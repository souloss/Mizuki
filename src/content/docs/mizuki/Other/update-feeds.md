---
title: 朋友圈 RSS 聚合
createTime: 2025/08/17 17:21:41
permalink: /other/update-feeds/
copyright:
  author:
    name: LyraVoid Team
    url: https://github.com/LyraVoid
---

## 朋友圈 RSS 聚合脚本

`scripts/update-feeds.mjs` 是一个 Node.js 脚本，用于自动抓取友链的 RSS/Atom 订阅，聚合生成朋友圈动态数据。

### 功能特性

- 自动解析 RSS 2.0 和 Atom 格式
- 支持从 `friends.ts` 读取配置
- 按权重和时间排序（权重每增加 1，相当于提前 1 小时）
- 限制每个友链的最大文章数
- 限制总显示条数
- 自动去重 HTML 标签
- 请求延迟避免被封

### 安装依赖

脚本依赖 `fast-xml-parser`，确保已安装：

```bash
pnpm add fast-xml-parser
```

### 使用方法

#### 手动运行

```bash
node scripts/update-feeds.mjs
```

#### 集成到构建流程

在 `package.json` 中添加：

```json
{
  "scripts": {
    "update-feeds": "node scripts/update-feeds.mjs",
    "prebuild": "pnpm update-feeds && pnpm update-anime"
  }
}
```

这样每次构建时都会自动更新朋友圈数据。

### 配置说明

脚本从 `src/config/friendsConfig.ts` 读取配置：

```typescript
export const friendsConfig: FriendsPageConfig = {
  // 是否启用朋友圈
  showFriendsCircle: true,
  // 朋友圈最多显示条数
  circleMaxItems: 20,
  // 每个友链最多显示条数
  circleMaxItemsPerFriend: 3,
};
```

### 友链数据配置

在 `src/data/friends.ts` 中为友链添加 `rss` 字段：

```typescript
export const friendsData: FriendItem[] = [
  {
    id: 1,
    name: "示例博客",
    avatar: "https://example.com/avatar.jpg",
    url: "https://example.com",
    rss: "https://example.com/feed.xml", // RSS 订阅地址
    weight: 10, // 权重越大排序越靠前
    enabled: true,
  },
];
```

### 输出文件

脚本会生成 `src/data/friends-circle.json`：

```json
{
  "lastUpdated": "2025-05-20T12:00:00.000Z",
  "items": [
    {
      "title": "文章标题",
      "author": "博客名称",
      "avatar": "头像地址",
      "siteUrl": "网站地址",
      "date": "2025-05-19T10:30:00.000Z",
      "link": "文章链接",
      "content": "摘要内容（最多 300 字符）"
    }
  ]
}
```

### 工作流程

1. 读取配置文件
2. 查找所有配置了 `rss` 的友链
3. 依次抓取每个友链的 RSS/Atom
4. 解析 XML 并提取文章数据
5. 按权重（权重*3600000ms + 时间戳）排序
6. 截取前 N 条
7. 写入输出文件

### 错误处理

- 单个友链抓取失败不会影响其他友链
- 超时时间设置为 10 秒
- 请求间隔 500ms 避免频繁请求
- 详细的控制台日志输出

### 支持的 Feed 格式

- RSS 2.0 (`<rss>` 或 `<RDF>`)
- Atom (`<feed>`)

### 自动提取字段

- 文章标题
- 作者（使用 Feed 标题）
- 发布日期
- 文章链接
- 内容摘要（去除 HTML 标签）
- 头像（使用友链头像）
- 网站地址
