// 朋友圈数据配置
// 用于管理朋友圈页面的RSS聚合数据
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface FriendsCircleItem {
	title: string;
	author: string;
	date: string;
	link: string;
	content: string;
	avatar?: string;
	siteUrl?: string;
}

interface FriendsCircleData {
	lastUpdated: string;
	items: FriendsCircleItem[];
}

let cachedData: FriendsCircleData | undefined;

function loadCircleData(): FriendsCircleData {
	if (cachedData) {return cachedData;}
	const jsonPath = path.resolve(__dirname, "friends-circle.json");
	if (fs.existsSync(jsonPath)) {
		try {
			const raw = fs.readFileSync(jsonPath, "utf-8");
			cachedData = JSON.parse(raw);
		} catch (error) {
			console.warn("[FriendsCircle] Failed to parse JSON:", error);
			cachedData = { lastUpdated: "", items: [] };
		}
	} else {
		cachedData = { lastUpdated: "", items: [] };
	}
	return cachedData as FriendsCircleData;
}

// 获取朋友圈数据
export function getFriendsCircleList(): FriendsCircleItem[] {
	return loadCircleData().items;
}

// 获取朋友圈数据最后更新时间
export function getFriendsCircleLastUpdated(): string {
	return loadCircleData().lastUpdated;
}
