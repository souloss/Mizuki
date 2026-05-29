# Upstream Tracking

## Sync Status

- Last sync: 2026-05-29 → upstream/master @ `dc9bebfc`
- Previous sync: 2025-05-25 → upstream/master @ `eabb6f5`

## Quick Commands

```bash
# View upstream changes since last sync
git log upstream-sync-2026-05-29..upstream/master --oneline

# View upstream changes to specific feature files
git log upstream-sync-2026-05-29..upstream/master -- src/pages/diary.astro src/components/features/diary/

# Cherry-pick a specific upstream commit
git cherry-pick <commit-hash>

# Fetch latest upstream
git fetch upstream
```

## Fork Divergence Map

| Upstream Feature | Our Fork | Strategy | Notes |
|-----------------|----------|----------|-------|
| diary (日记) | talking (说说) | REPLACE | 基于 diary 改来，上游 diary 改动需审查 bug 修复 |
| config.ts (monolithic) | config/ (modular) | REPLACE | 已拆分为 22 个文件，不跟进上游合并版 |
| ESLint + Prettier | ESLint + Prettier | KEEP | 上游已迁移到 Biome，我们暂不跟进 |
| Live2D Cubism 3/4/5 | Pio (Live2D) | REVIEW | 上游新增 Cubism 支持，我们用 Pio，需评估兼容性 |
| encryption | encryption | ADOPT | 通用功能增强 |
| feature page auto-hide | feature page auto-hide | ADOPT | 通用修复 |
| PhotoSwipe | PhotoSwipe | ADOPT | 图片查看器 |
| Swup page transitions | Swup page transitions | ADOPT | 页面转场 |
| OG image generation | OG image generation | ADOPT | 社交分享图 |
| Expressive Code | Expressive Code | ADOPT | 代码块样式 |
| Banner carousel | Banner carousel | ADOPT | 轮播功能 |
| i18n (zh_CN/ja/en/zh_TW) | i18n (zh_CN/ja/en/zh_TW) | ADOPT | 国际化 |
| anime tracking | anime tracking | CUSTOM | 我们独有，上游无此功能 |
| music player | music player | CUSTOM | 我们独有 |
| friends page | friends page | CUSTOM | 我们独有 |
| albums page | albums page | CUSTOM | 我们独有 |
| timeline page | timeline page | CUSTOM | 我们独有 |
| devices page | devices page | CUSTOM | 我们独有 |
| skills page | skills page | CUSTOM | 我们独有 |
| sponsor page | sponsor page | CUSTOM | 我们独有 |
| fullscreen wallpaper | fullscreen wallpaper | CUSTOM | 我们独有 |
| pio mascot | pio mascot | CUSTOM | 上游用 Live2D Cubism，我们用 Pio |
| reward | reward | CUSTOM | 我们独有 |
| encrypted posts | encrypted posts | CUSTOM | 加密文章功能 |
| share buttons | share buttons | CUSTOM | 分享功能 |
| markmap support | markmap support | CUSTOM | 思维导图 |
| plantuml support | plantuml support | CUSTOM | UML 图 |

### Strategy Definitions

- **ADOPT** — 直接采纳上游改动，冲突时以上游为准
- **REPLACE** — 上游改动需审查后手动移植，不能直接 merge（我们自定义程度高）
- **KEEP** — 保持我们的实现，不跟进上游变更
- **REVIEW** — 需要评估后再决定是否采纳
- **CUSTOM** — 我们独有的功能，上游无对应，同步时忽略

### Bug Sensitivity for REPLACE Items

对于标记为 REPLACE 的功能，上游的 bug 修复可能也适用于我们的 fork。同步时需额外检查：

```bash
# 检查上游对 talking (对应 diary) 相关文件的改动
git log upstream-sync-2026-05-29..upstream/master -- \
  src/pages/diary.astro \
  src/content/diary/ \
  src/components/features/diary/ \
  src/data/diary.ts

# 检查上游对 config 相关文件的改动（我们的拆分版需手动移植）
git log upstream-sync-2026-05-29..upstream/master -- \
  src/config.ts
```

---

## 2025-05-25 Sync Batch (upstream/master @ eabb6f5)

| Upstream Commit | Description | Decision | Our Commit | Notes |
|----------------|-------------|----------|------------|-------|
| `eabb6f5` | fix: remove blurry text caused by GPU layer promotion and font-smoothing overrides | ADOPT | `d39ef9e0` | 合入 async style flash fix 中，CSS 层面通用修复 |
| `0a94965` | fix: scan all config files and read musicConfig from its own file | SKIP | — | 我们已拆分 config，此修复针对上游合并版，不适用 |
| `82b7738` | refactor: update CI workflows for Biome | SKIP | — | 我们暂用 ESLint，CI 配置不适用 |
| `ab65ce0` | refactor: resolve all Biome lint warnings | SKIP | — | 同上 |
| `ee89a18` | refactor: migrate from ESLint + Prettier to Biome | SKIP | — | 我们暂不跟进 Biome |
| `30a4d92` | feat: upgrade content encryption with verification prefix | ADOPT | `1273d343` | cherry-pick 加密测试；加密增强通用功能 |
| `8ffce3d` | feat: multi-algorithm weighted scoring for related posts | PENDING | — | 推荐算法改进，待下次同步审查 |
| `d4f74a7` | fix: add SSR guard for document access in Pio onDestroy | REVIEW | — | 我们也有 Pio，需检查是否需要此修复 |
| `90185ef` | feat: upgrade Live2D to support Cubism 3/4/5 models | REVIEW | — | 我们用 Pio，需评估是否迁移到 Cubism |
| `4d7ee3a` | fix: auto-hide disabled feature pages from navbar | ADOPT | `ad58ff20` | 合入 Svelte 5 修复批次 |
| `83cbb47` | refactor: split monolithic compress-fonts.js into modular architecture | ADOPT | `4459fba1` | cherry-pick 逻辑，我们改版了 compress-fonts |
| `599dd3e` | feat: upgrade image system with multi-format optimization and configurable referrer policy | PENDING | — | 图片系统增强，待下次同步 |
| `7a3fa70` | refactor: split monolithic config.ts into modular config directory | SKIP | — | 我们已完成拆分，此 commit 对我们无效 |
| `2f0daea` | feat: upgrade encryption to AES-256-GCM and add album encryption | PENDING | — | 加密升级，待下次同步审查 |
| `fd0d979` | feat: add card border and shadow effect with config toggle | PENDING | — | 通用 UI 功能，待下次同步 |
| `a0b6121` | fix: clean up code formatting and indentation | SKIP | — | 代码风格，上游用 Biome 格式，不适用 |
| `b42ffbe` | Update dependencies | ADOPT | `6a761a13` | 部分采纳：安全版本升级（astro, tailwind, expressive-code）；svelte 因 patch 冲突回退 |

---

## 2026-05-29 Sync Batch (upstream/master @ dc9bebfc)

| Upstream Commit | Description | Decision | Our Commit | Notes |
|----------------|-------------|----------|------------|-------|
| `2f11798` | chore: update dependencies and improve documentation | ADOPT | `6a761a13` | 部分采纳：安全版本升级（astro 6.3.7→6.3.8, tailwind 4.2→4.3, expressive-code 0.41→0.42）；svelte 5.55.9 因现有 patch 冲突回退到 5.55.5 |
| `ff47556` | feat: rewrite settings panel with config-gated controls, fix fullscreen banner layout, add config enforce audit | REVIEW | — | 大型提交(36 files, +1862/-365)，含 settings panel 重写和 fullscreen 修复。我们手动移植了 fullscreen 部分 |
| `9d1e6d6b` | refactor(fullscreen): align steady-state layout with Swup transitions | ADOPT | `c4c348a5` | 手动移植：Swup content:replace 后 #top-row 强制重排防止高度塌陷 |
| `e947a405` | fix(fullscreen): change top-row to sticky track with 100vh for banner-area-only navbar adhesion | ADOPT | `c4c348a5` | 手动移植：fullscreen mode #top-row `height:100vh; position:sticky; top:0; z-index:50` |
| `bf8e9733` | feat(banner): add scroll-fade page title overlay with date/category/word count | ADOPT | `bb48e5ee` + `3c58bcfb` | 手动移植：JS 逻辑(swup-hooks + back-to-top-handler)、数据源(MainGridLayout)、HTML(Banner.astro #banner-page-overlay) |
| `99291756` | refactor(pio): isolate Live2D widget in iframe to prevent main thread blocking | REVIEW | — | 性能优化，我们用 Pio 而非 Cubism，需评估是否需要 iframe 隔离 |
| `f8ed363d` | fix(mobile): align banner content top with actual banner height on small screens | ADOPT | `c4c348a5` | 手动移植：移动端 banner 高度 min-height 保护（70vh→max(70vh,450px) 等） |
| `015d5efc` | config(overlay): set default blur to 1.5px and card opacity to 80% | ADOPT | `df029098` | 手动移植为 CSS 变量：--wallpaper-blur, --wallpaper-opacity, --card-transparent-opacity |
| `f6768dcb` | Merge branch 'master' (duplicate merge) | SKIP | — | 重复合并提交，无需处理 |
| `d4fb5d4c` | style(markdown): improve code font-family formatting and add spacing for headings | ADOPT | `4459fba1` | 合入 compress-fonts 拆分批次中（markdown code font + heading spacing） |
| `1f1aeed8` | refactor(pio): enhance Live2D widget initialization and management | REVIEW | — | Pio/Live2D 初始化重构，我们用 Pio，需评估兼容性 |
| `dc9bebfc` | refactor(pio): update initialization logic and type definitions | REVIEW | — | Pio 配置简化，我们用 Pio，需评估兼容性 |

---

## Our Fork-Specific Fixes (not from upstream)

These commits fix issues unique to our fork or were necessary adaptation work during upstream sync:

| Our Commit | Description | Context |
|------------|-------------|---------|
| `eb6d2565` | fix: negative time in LastModified, DocSearch filter key | 上游无此 bug，我们独有 |
| `682cbb79` | fix: LastModified timezone offset causing negative time | 修正 eb6d2565 的时区逻辑 |
| `d1c15318` | refactor: deduplicate config, single-source-of-truth | 我们拆分版 config 维护 |
| `ad58ff20` | fix: Svelte 5 dev hydration, DocSearch navbar modal | 开发模式修复 |
| `d39ef9e0` | fix: prevent async component style flash | Waline/KaTeX CSS 时序问题 |
| `a6822215` | fix: Stylus rgba() with var() — use unquote() | Stylus 编译器限制 workaround |
| `8f2930e5` | fix: revert svelte bump + fix esbuild parse error | svelte 5.55.9 patch 冲突回退 + anime-layout-handler `as EventListener` esbuild 不兼容 |
| `3c58bcfb` | fix: add missing banner-page-overlay HTML | 之前遗漏的 HTML 元素 |

---

## Pending Items (next sync cycle)

| Upstream Commit | Description | Priority | Notes |
|----------------|-------------|----------|-------|
| `8ffce3d` | feat: multi-algorithm weighted scoring for related posts | Medium | 推荐算法改进 |
| `599dd3e` | feat: upgrade image system with referrer policy | Medium | 图片系统增强 |
| `2f0daea` | feat: upgrade encryption to AES-256-GCM | Medium | 加密系统升级 |
| `fd0d979` | feat: add card border and shadow effect with config toggle | Low | 通用 UI |
| `d4f74a7` | fix: add SSR guard for Pio onDestroy | High | 可能影响我们的 Pio |
| `90185ef` | feat: upgrade Live2D Cubism 3/4/5 | Low | 我们用 Pio，暂不迁移 |
| `99291756` | refactor(pio): isolate Live2D widget in iframe | Medium | 性能优化，需评估 |
| `1f1aeed8` + `dc9bebfc` | refactor(pio): Live2D initialization refactor | Medium | Pio 兼容性需评估 |
| `ff47556` settings panel | feat: rewrite settings panel | Low | 大型重写，我们 settings 结构不同 |

---

## Next Sync Checklist

1. `git fetch upstream`
2. `git log upstream-sync-2026-05-29..upstream/master --oneline` — 查看所有新提交
3. 逐条审查，按 Strategy 分类
4. 对 REPLACE 项，检查上游 bug 修复是否适用于我们的 fork
5. ADOPT 项：cherry-pick 或手动移植
6. 更新此文件和 sync tag
7. `git tag upstream-sync-2026-05-29 upstream/master` — 打同步标记