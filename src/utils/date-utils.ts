import { siteConfig } from "../config";

export function formatDateToYYYYMMDD(date: Date): string {
	return date.toISOString().substring(0, 10);
}

/** Map siteConfig.lang format (zh_CN) to BCP-47 locale format (zh-CN) */
const localeMap: Record<string, string> = {
	zh_CN: "zh-CN",
	zh_TW: "zh-TW",
	en: "en-US",
	ja: "ja-JP",
	ko: "ko-KR",
	es: "es-ES",
	th: "th-TH",
	vi: "vi-VN",
	tr: "tr-TR",
	id: "id-ID",
	fr: "fr-FR",
	de: "de-DE",
	ru: "ru-RU",
	ar: "ar-SA",
};

export function getLocaleFromLang(lang?: string): string {
	return localeMap[lang || siteConfig.lang] || "en-US";
}

export function formatDateI18n(dateString: string): string {
	const date = new Date(dateString);
	const locale = getLocaleFromLang();
	return date.toLocaleDateString(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}
