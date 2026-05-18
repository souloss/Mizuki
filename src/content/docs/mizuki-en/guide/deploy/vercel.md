---
title: "Vercel Deployment"
order: 3
section: "Getting Started"
docSlug: mizuki-en
lang: "en"
description: "Deploy Mizuki to Vercel"
icon: "material-symbols:cloud-upload-rounded"
badge:
  type: recommended
  text: "Recommended"
---

## Deploy to Vercel

Vercel is the recommended deployment platform for Mizuki.

### Automatic Deployment

1. Push your project to GitHub
2. Go to [Vercel](https://vercel.com/) and import your repository
3. Vercel will auto-detect Astro and configure the build
4. Click "Deploy"

### Environment Variables

If you use environment variables (e.g., for Bilibili SESSDATA), configure them in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Add your variables:
   - `BILI_SESSDATA` — Your Bilibili SESSDATA value
3. Select the appropriate environments (Production/Preview/Development)

### Custom Domain

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update your `src/config.ts`:

```typescript title="src/config.ts"
siteURL: "https://your-domain.com/",
```

### Build Configuration

Vercel should auto-detect the correct build settings:

- **Framework Preset**: Astro
- **Build Command**: `pnpm build`
- **Output Directory**: `dist/`
- **Install Command**: `pnpm install`
