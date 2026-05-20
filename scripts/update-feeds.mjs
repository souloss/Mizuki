import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { XMLParser } from "fast-xml-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRIENDS_DATA_PATH = path.join(__dirname, "../src/data/friends.ts");
const FRIENDS_CONFIG_PATH = path.join(__dirname, "../src/config/friendsConfig.ts");
const OUTPUT_PATH = path.join(__dirname, "../src/data/friends-circle.json");

// ========== 配置读取 ==========
async function getCircleConfig() {
	try {
		const configContent = await fs.readFile(FRIENDS_CONFIG_PATH, "utf-8");
		const maxItemsMatch = configContent.match(/circleMaxItems:\s*(\d+)/);
		const maxItemsPerFriendMatch = configContent.match(/circleMaxItemsPerFriend:\s*(\d+)/);
		const showFriendsCircleMatch = configContent.match(/showFriendsCircle:\s*(true|false)/);

		return {
			maxItems: maxItemsMatch ? parseInt(maxItemsMatch[1], 10) : 20,
			maxItemsPerFriend: maxItemsPerFriendMatch ? parseInt(maxItemsPerFriendMatch[1], 10) : 3,
			showFriendsCircle: showFriendsCircleMatch ? showFriendsCircleMatch[1] === "true" : true,
		};
	} catch (error) {
		console.warn("Failed to read circle config, using defaults");
		return {
			maxItems: 20,
			maxItemsPerFriend: 3,
			showFriendsCircle: true,
		};
	}
}

// ========== 友链数据读取 ==========
async function getFriendsWithRss() {
	try {
		const content = await fs.readFile(FRIENDS_DATA_PATH, "utf-8");
		const friends = [];

		// 使用正则解析对象数组，比 eval 更安全
		const objectPattern = /\{[\s\S]*?\}/g;
		let match;
		while ((match = objectPattern.exec(content)) !== null) {
			const objStr = match[0];

			// 跳过空对象
			if (objStr.trim() === "{}") continue;

			// 提取字段
			const rssMatch = objStr.match(/rss:\s*["']([^"']+)["']/);
			if (!rssMatch) continue;

			const idMatch = objStr.match(/id:\s*(\d+)/);
			const titleMatch = objStr.match(/title:\s*["']([^"']+)["']/);
			const imgurlMatch = objStr.match(/imgurl:\s*["']([^"']+)["']/);
			const siteurlMatch = objStr.match(/siteurl:\s*["']([^"']+)["']/);
			const weightMatch = objStr.match(/weight:\s*(\d+)/);
			const enabledMatch = objStr.match(/enabled:\s*(true|false)/);

			// 跳过禁用的友链
			if (enabledMatch && enabledMatch[1] === "false") continue;

			friends.push({
				id: idMatch ? parseInt(idMatch[1], 10) : 0,
				title: titleMatch ? titleMatch[1] : "Unknown",
				imgurl: imgurlMatch ? imgurlMatch[1] : "",
				siteurl: siteurlMatch ? siteurlMatch[1] : "",
				rss: rssMatch[1],
				weight: weightMatch ? parseInt(weightMatch[1], 10) : 0,
			});
		}

		return friends;
	} catch (error) {
		console.error("Failed to read friends data:", error);
		return [];
	}
}

// ========== RSS/Atom 解析 ==========
const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "@_",
	textNodeName: "#text",
	isArray: (name) => name === "item" || name === "entry",
});

function stripHTML(html) {
	if (!html) return "";
	return html.replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ").trim();
}

function normalizeDate(dateStr) {
	if (!dateStr) return new Date().toISOString();
	try {
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return new Date().toISOString();
		return date.toISOString();
	} catch {
		return new Date().toISOString();
	}
}

function parseRSS2(xmlText, friendInfo) {
	const parsed = parser.parse(xmlText);
	const channel = parsed.rss?.channel || parsed.RDF?.channel || parsed.channel;
	if (!channel) return [];

	const items = Array.isArray(channel.item) ? channel.item : (channel.item ? [channel.item] : []);
	const feedTitle = channel.title || friendInfo.title;

	return items.map((item) => {
		const content = item.description || item.content?.["#text"] || item.summary || "";
		let link = item.link;
		if (typeof link === "object" && link?.["@_href"]) {
			link = link["@_href"];
		}
		const dateStr = item.pubDate || item.date || item.published || "";
		const title = item.title?.["#text"] || item.title || "";

		return {
			title: stripHTML(title),
			author: feedTitle,
			avatar: friendInfo.imgurl,
			siteUrl: friendInfo.siteurl,
			date: normalizeDate(dateStr),
			link: typeof link === "string" ? link : "",
			content: stripHTML(content).substring(0, 300),
			_weight: friendInfo.weight || 0,
		};
	});
}

function parseAtom(xmlText, friendInfo) {
	const parsed = parser.parse(xmlText);
	const feed = parsed.feed;
	if (!feed) return [];

	const entries = Array.isArray(feed.entry) ? feed.entry : (feed.entry ? [feed.entry] : []);
	const feedTitle = feed.title?.["#text"] || feed.title || friendInfo.title;

	return entries.map((entry) => {
		const content = entry.content?.["#text"] || entry.summary?.["#text"] || entry.content || entry.summary || "";
		let link = "";
		if (Array.isArray(entry.link)) {
			const firstLink = entry.link.find((l) => l?.["@_rel"] === "alternate" || !l?.["@_rel"]) || entry.link[0];
			link = firstLink?.["@_href"] || "";
		} else if (entry.link?.["@_href"]) {
			link = entry.link["@_href"];
		}
		const dateStr = entry.published || entry.updated || entry.issued || "";
		const title = entry.title?.["#text"] || entry.title || "";

		return {
			title: stripHTML(title),
			author: feedTitle,
			avatar: friendInfo.imgurl,
			siteUrl: friendInfo.siteurl,
			date: normalizeDate(dateStr),
			link: link,
			content: stripHTML(content).substring(0, 300),
			_weight: friendInfo.weight || 0,
		};
	});
}

function parseFeed(xmlText, friendInfo) {
	try {
		if (xmlText.includes("<rss") || xmlText.includes("<RDF")) {
			return parseRSS2(xmlText, friendInfo);
		}
		if (xmlText.includes("<feed")) {
			return parseAtom(xmlText, friendInfo);
		}
		const rssItems = parseRSS2(xmlText, friendInfo);
		if (rssItems.length > 0) return rssItems;
		return parseAtom(xmlText, friendInfo);
	} catch (error) {
		console.warn(`  Failed to parse feed for ${friendInfo.title}:`, error.message);
		return [];
	}
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchFeed(url) {
	try {
		const response = await fetch(url, {
			signal: AbortSignal.timeout(10000),
			headers: {
				"User-Agent": "Mizuki-Friends-Circle/1.0",
				"Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
			},
		});
		if (!response.ok) {
			console.warn(`  HTTP ${response.status}: ${url}`);
			return null;
		}
		return await response.text();
	} catch (error) {
		if (error.name === "AbortError" || error.name === "TimeoutError") {
			console.warn(`  Timeout: ${url}`);
		} else {
			console.warn(`  Failed to fetch: ${url}`, error.message);
		}
		return null;
	}
}

// ========== 主逻辑 ==========
async function main() {
	console.log("=== Friends Circle RSS Aggregator ===");

	// 读取配置
	const config = await getCircleConfig();
	if (!config.showFriendsCircle) {
		console.log("Friends circle is disabled, skipping.");
		const emptyData = { lastUpdated: new Date().toISOString(), items: [] };
		const dir = path.dirname(OUTPUT_PATH);
		try {
			await fs.access(dir);
		} catch {
			await fs.mkdir(dir, { recursive: true });
		}
		await fs.writeFile(OUTPUT_PATH, JSON.stringify(emptyData, null, 2));
		return;
	}

	// 获取有 RSS 的友链
	const friendsWithRss = await getFriendsWithRss();
	if (friendsWithRss.length === 0) {
		console.log("No friends with RSS found.");
		const emptyData = { lastUpdated: new Date().toISOString(), items: [] };
		const dir = path.dirname(OUTPUT_PATH);
		try {
			await fs.access(dir);
		} catch {
			await fs.mkdir(dir, { recursive: true });
		}
		await fs.writeFile(OUTPUT_PATH, JSON.stringify(emptyData, null, 2));
		return;
	}

	console.log(`Found ${friendsWithRss.length} friends with RSS`);

	// 抓取所有 feed
	let allItems = [];
	let successCount = 0;
	let failCount = 0;

	for (const friend of friendsWithRss) {
		console.log(`\nFetching: ${friend.title}`);
		console.log(`  RSS: ${friend.rss}`);

		const xmlText = await fetchFeed(friend.rss);
		if (!xmlText) {
			failCount++;
			continue;
		}

		const items = parseFeed(xmlText, friend);
		console.log(`  Got ${items.length} items`);
		if (items.length > 0) {
			const limited = items.slice(0, config.maxItemsPerFriend);
			allItems = allItems.concat(limited);
			successCount++;
		} else {
			failCount++;
		}

		await delay(500);
	}

	console.log(`\n=== Summary ===`);
	console.log(`Success: ${successCount}, Failed: ${failCount}`);
	console.log(`Total items before filtering: ${allItems.length}`);

	// 按权重时间提升排序
	allItems.sort((a, b) => {
		const aDate = new Date(a.date).getTime() + (a._weight || 0) * 3600_000;
		const bDate = new Date(b.date).getTime() + (b._weight || 0) * 3600_000;
		return bDate - aDate;
	});

	// 去除 _weight 字段，保留前 N 条
	const finalItems = allItems
		.map((item) => {
			const { _weight, ...rest } = item;
			return rest;
		})
		.slice(0, config.maxItems);

	console.log(`Final items: ${finalItems.length}`);

	// 写入输出
	const output = {
		lastUpdated: new Date().toISOString(),
		items: finalItems,
	};

	const dir = path.dirname(OUTPUT_PATH);
	try {
		await fs.access(dir);
	} catch {
		await fs.mkdir(dir, { recursive: true });
	}

	await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2));
	console.log(`Written to: ${OUTPUT_PATH}`);
	console.log("=== Done ===");
}

main().catch((err) => {
	console.error("\n✘ Script execution error:");
	console.error(err);
	process.exit(1);
});
