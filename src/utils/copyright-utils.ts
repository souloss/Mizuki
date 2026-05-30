import type I18nKey from "@i18n/i18nKey";

export type CopyrightType =
	| "CC BY"
	| "CC BY-SA"
	| "CC BY-ND"
	| "CC BY-NC"
	| "CC BY-NC-SA"
	| "CC BY-NC-ND"
	| "CC0"
	| "ARR";

export interface CopyrightInfo {
	name: string;
	url: string;
	icon: string;
	descriptionKey: I18nKey;
}

export const COPYRIGHT_MAP: Record<CopyrightType, CopyrightInfo> = {
	"CC BY": {
		name: "CC BY 4.0",
		url: "https://creativecommons.org/licenses/by/4.0/",
		icon: "fa7-brands:creative-commons",
		descriptionKey: "copyrightNotice" as I18nKey,
	},
	"CC BY-SA": {
		name: "CC BY-SA 4.0",
		url: "https://creativecommons.org/licenses/by-sa/4.0/",
		icon: "fa7-brands:creative-commons-sa",
		descriptionKey: "copyrightNotice" as I18nKey,
	},
	"CC BY-ND": {
		name: "CC BY-ND 4.0",
		url: "https://creativecommons.org/licenses/by-nd/4.0/",
		icon: "fa7-brands:creative-commons-nd",
		descriptionKey: "copyrightNotice" as I18nKey,
	},
	"CC BY-NC": {
		name: "CC BY-NC 4.0",
		url: "https://creativecommons.org/licenses/by-nc/4.0/",
		icon: "fa7-brands:creative-commons-nc",
		descriptionKey: "copyrightNotice" as I18nKey,
	},
	"CC BY-NC-SA": {
		name: "CC BY-NC-SA 4.0",
		url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
		icon: "fa7-brands:creative-commons-nc-sa",
		descriptionKey: "copyrightNotice" as I18nKey,
	},
	"CC BY-NC-ND": {
		name: "CC BY-NC-ND 4.0",
		url: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
		icon: "fa7-brands:creative-commons-nc-nd",
		descriptionKey: "copyrightNotice" as I18nKey,
	},
	CC0: {
		name: "CC0 1.0",
		url: "https://creativecommons.org/publicdomain/zero/1.0/",
		icon: "fa7-brands:creative-commons-zero",
		descriptionKey: "copyrightNotice" as I18nKey,
	},
	ARR: {
		name: "All Rights Reserved",
		url: "",
		icon: "material-symbols:copyright",
		descriptionKey: "copyrightNotice" as I18nKey,
	},
};

export function getCopyrightInfo(copyright: CopyrightType): CopyrightInfo {
	return COPYRIGHT_MAP[copyright];
}
