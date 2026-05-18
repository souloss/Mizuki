---
title: "Getting Started"
order: 2
section: "Getting Started"
docSlug: mizuki-en
lang: "en"
description: "Quick start guide for setting up Mizuki"
icon: "material-symbols:rocket-launch-rounded"
badge:
  type: new
  text: "New"
---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 22
- **pnpm** (package manager — enforced via preinstall hook)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/mizuki.git
cd mizuki
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Development Server

```bash
pnpm dev
```

The dev server will automatically sync content before starting (via the `predev` hook).

### 4. Build for Production

```bash
pnpm build
```

The build pipeline runs in sequence:
1. `update-anime.mjs` — Fetches anime data
2. `astro build` — Builds the static site
3. `pagefind` — Generates search index
4. `compress-fonts.js` — Compresses font files

### 5. Preview Production Build

```bash
pnpm preview
```

## Configuration

The main configuration file is `src/config.ts`. Key configuration objects:

- **`siteConfig`** — Site metadata, language, theme, features
- **`navBarConfig`** — Navigation links
- **`profileConfig`** — Author profile
- **`sidebarLayoutConfig`** — Sidebar widget ordering

## Common Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm check` | Astro type checking |
| `pnpm lint` | ESLint with auto-fix |
| `pnpm format` | Prettier formatting |
| `pnpm new-post <name>` | Create a new blog post |
