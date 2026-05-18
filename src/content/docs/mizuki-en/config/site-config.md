---
title: "Site Configuration"
order: 11
section: "Basic Layout"
docSlug: mizuki-en
lang: "en"
description: "Configure site-wide settings in Mizuki"
---

## Site Configuration

The main site configuration is in `src/config.ts`. This file exports all configuration objects used throughout the theme.

### siteConfig

The `siteConfig` object controls the overall site behavior:

```typescript title="src/config.ts"
export const siteConfig = {
  title: "Mizuki",           // Site title
  subtitle: "A blog theme",  // Site subtitle
  lang: "zh_CN",             // Default language
  themeColor: { hue: 250 },  // Theme hue (0-360)
  banner: { enable: true },  // Enable banner
  // ... more options
};
```

### Key Configuration Options

| Option | Type | Description |
|---|---|---|
| `title` | string | Site title displayed in navbar and browser tab |
| `subtitle` | string | Site subtitle |
| `lang` | string | Default language (zh_CN, zh_TW, en, ja) |
| `themeColor.hue` | number | Theme color hue (0-360) |
| `banner.enable` | boolean | Show banner image on homepage |
| `toc.enable` | boolean | Enable table of contents |
| `pageProgressBar` | object | Page reading progress bar settings |

### navBarConfig

Configure navigation links:

```typescript title="src/config.ts"
export const navBarConfig = {
  links: [
    LinkPreset.Home,
    LinkPreset.Archive,
    // Add custom links:
    { name: "Docs", url: "/docs/", icon: "ri:book-line" },
  ],
};
```

### profileConfig

Configure the sidebar profile widget:

```typescript title="src/config.ts"
export const profileConfig = {
  avatar: "/assets/avatar.webp",
  name: "Your Name",
  bio: "Your bio",
  // ... more options
};
```
