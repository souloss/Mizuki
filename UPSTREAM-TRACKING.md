# Upstream Tracking

## Sync Status

- Last sync: 2025-05-25 → upstream/master @ `eabb6f5`
- Previous sync: none (initial tracking setup)

## Quick Commands

```bash
# View upstream changes since last sync
git log upstream-sync-2025-05-25..upstream/master --oneline

# View upstream changes to specific feature files
git log upstream-sync-2025-05-25..upstream/master -- src/pages/diary.astro src/components/features/diary/

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
git log upstream-sync-2025-05-25..upstream/master -- \
  src/pages/diary.astro \
  src/content/diary/ \
  src/components/features/diary/ \
  src/data/diary.ts

# 检查上游对 config 相关文件的改动（我们的拆分版需手动移植）
git log upstream-sync-2025-05-25..upstream/master -- \
  src/config.ts
```

## 2025-05-25 Sync Batch (upstream/master @ eabb6f5)

These are the upstream commits since our divergence point (`f511780`). We have not adopted any of these yet — they are listed here for future sync decisions.

| Commit | Description | Decision | Reason |
|--------|------------|----------|--------|
| `eabb6f5` | fix: blurry text in banner | ADOPT | 通用视觉修复，CSS 层面 |
| `0a94965` | fix: scan all config files and read musicConfig from its own file | SKIP | 我们已拆分 config，此修复针对上游合并版 |
| `82b7738` | refactor: update CI workflows for Biome | SKIP | 我们暂用 ESLint，CI 不适用 |
| `ab65ce0` | refactor: resolve all Biome lint warnings | SKIP | 同上 |
| `ee89a18` | refactor: migrate from ESLint + Prettier to Biome | SKIP | 我们暂不跟进 Biome |
| `30a4d92` | feat: upgrade content encryption with verification prefix | ADOPT | 加密系统增强，通用功能 |
| `8ffce3d` | feat: multi-algorithm weighted scoring for related posts | ADOPT | 推荐算法改进，通用功能 |
| `d4f74a7` | fix: add SSR guard for document access in Pio onDestroy | REVIEW | 我们也有 Pio，需检查是否需要此修复 |
| `90185ef` | feat: upgrade Live2D to support Cubism 3/4/5 models | REVIEW | 我们用 Pio，需评估是否迁移到 Cubism |
| `4d7ee3a` | fix: auto-hide disabled feature pages from navbar | ADOPT | 我们已有类似实现，需审查差异 |
| `83cbb47` | refactor: split monolithic compress-fonts.js | REPLACE | 我们已改版 compress-fonts，需手动移植逻辑 |
| `599dd3e` | feat: upgrade image system with referrer policy | ADOPT | 图片系统增强 |
| `7a3fa70` | refactor: split monolithic config.ts into modular directory | REPLACE | 我们已完成拆分，此 commit 对我们无效 |
| `2f0daea` | feat: upgrade encryption to AES-256-GCM and add album encryption | ADOPT | 加密系统升级 |
| `fd0d979` | feat: add card border and shadow effect with config toggle | ADOPT | 通用 UI 功能 |
| `a0b6121` | fix: clean up code formatting and indentation | SKIP | 代码风格，上游用 Biome 格式 |
| `b42ffbe` | Update dependencies | REVIEW | 依赖更新，需逐个检查兼容性 |
| `9b9db61` | fix(diary): use local time for relative timestamps | REVIEW | 对应我们的 talking，需检查是否需要此修复 |
| `1d37d64` | feat: diary module integrates Memos API | REVIEW | 上游 diary 重大更新，对应我们的 talking |
| `8bfe8f1` | Fix musicPlayerConfig closing issue | ADOPT | 音乐播放器修复，通用功能 |

> These commits are from upstream after our divergence point. They are NOT yet applied to our fork.

## Next Sync Checklist

1. `git fetch upstream`
2. `git log upstream-sync-2025-05-25..upstream/master --oneline` — 查看所有新提交
3. 逐条审查，按 Strategy 分类
4. 对 REPLACE 项，检查上游 bug 修复是否适用于我们的 fork
5. ADOPT 项：cherry-pick 或 merge
6. 更新此文件和 sync tag
