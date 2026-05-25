export interface PioModelConfig {
	path: string;
	tips?: {
		welcomeMessage?: string[];
		messages?: string[];
		duration?: number;
		interval?: number;
	};
}

export interface PioMenuItem {
	icon?: string;
	label: string;
	action: string;
}

export interface PioMenusConfig {
	items?: PioMenuItem[];
	align?: "left" | "right";
}

export interface PioConfig {
	enable: boolean;
	mode?: string;
	hiddenOnMobile?: boolean;
	hideAboutMenu?: boolean;
	position?: "left" | "right";
	width?: number;
	height?: number;
	dialog?: Record<string, string>;
	models?: string[];
	tips?: {
		welcomeMessage?: string[];
		messages?: string[];
		duration?: number;
		interval?: number;
	};
	menus?: PioMenusConfig;
}

export interface PioProps {
	config?: Partial<PioConfig>;
}