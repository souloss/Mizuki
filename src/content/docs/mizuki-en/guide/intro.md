---
title: "Introduction"
order: 1
section: "Getting Started"
docSlug: mizuki-en
lang: "en"
description: "Learn about Mizuki, a feature-rich Astro blog theme"
---

## What is Mizuki?

Mizuki is a feature-rich static blog built with **Astro 6** (static output mode), **Svelte 5**, **Tailwind CSS 4**, and **TypeScript**. It is based on the Fuwari template and extended with anime tracking, diary, music player, Live2D mascot, and more.

### Key Features

- **Static Site Generation** — Built with Astro for blazing-fast performance
- **Component Framework** — Svelte 5 for interactive client-side components
- **Styling** — Tailwind CSS 4 with dark mode support
- **Type Safety** — Full TypeScript support throughout
- **Page Transitions** — Swup for smooth page transitions
- **Search** — Pagefind for full-text search
- **Anime Tracking** — Built-in anime tracking with Bangumi/Bilibili integration
- **Music Player** — Integrated music player with APlayer/MePlayer
- **Live2D** — Optional Live2D mascot integration
- **i18n** — Multi-language support (zh_CN, zh_TW, en, ja)
- **Encrypted Posts** — Client-side post encryption support
- **Diary** — Built-in diary page with calendar view

### Tech Stack

| Technology | Purpose |
|---|---|
| Astro 6 | Static site framework |
| Svelte 5 | Interactive components |
| Tailwind CSS 4 | Styling |
| TypeScript | Type safety |
| Swup | Page transitions |
| Pagefind | Search |
| Iconify | Icon system |

### Project Structure

```
Mizuki/
├── src/
│   ├── components/    # UI components (Atomic Design)
│   ├── content/       # Blog posts and special pages
│   ├── data/          # Static data files
│   ├── i18n/          # Internationalization
│   ├── layouts/       # Page layouts
│   ├── pages/         # Route pages
│   ├── plugins/       # Remark/Rehype plugins
│   ├── styles/        # CSS/Stylus files
│   └── utils/         # Utility functions
├── public/            # Static assets
└── scripts/           # Build scripts
```
