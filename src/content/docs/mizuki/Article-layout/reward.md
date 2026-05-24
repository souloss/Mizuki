---
title: 赞赏功能配置
order: 11
icon: "ri:heart-2-line"
badge:
  type: warning
  text: 新
createTime: 2026/05/20 12:00:00
permalink: /article-layout/reward/
copyright:
  author:
    name: LyraVoid Team
    url: https://github.com/LyraVoid
---

# 赞赏功能配置

赞赏功能允许读者通过扫描支付宝或微信二维码对文章作者进行打赏支持。配置位于 `src/config.ts` 中的 `rewardConfig` 对象。

## 基本配置

```typescript title="src/config.ts"
export const rewardConfig: import("./types/config").RewardConfig = {
  enable: true,           // 是否启用赞赏功能
  message: "觉得文章有帮助？请我喝杯咖啡~",  // 自定义提示文字，留空使用 i18n 默认值
  AliPay: "/images/alipay-qr.png",  // 支付宝收款二维码图片路径
  WeChat: "/images/wechat-qr.png",  // 微信收款二维码图片路径
};
```

## 配置项说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `enable` | `boolean` | 是 | 是否启用赞赏功能，设为 `false` 则不在文章中显示赞赏区域 |
| `message` | `string` | 否 | 自定义提示文字，留空则使用 i18n 中的 `rewardMessage` 翻译 |
| `AliPay` | `string` | 否 | 支付宝收款二维码图片路径，留空则不显示支付宝按钮 |
| `WeChat` | `string` | 否 | 微信收款二维码图片路径，留空则不显示微信按钮 |

## 二维码图片准备

1. 打开支付宝/微信的收款码功能，保存收款二维码图片
2. 将图片裁剪为 6:8 的竖版比例（组件使用 `aspect-[6/8]`）
3. 将图片放置在 `public/images/` 目录下
4. 在配置中引用路径，如 `/images/alipay-qr.png`

## 交互效果

赞赏组件在文章底部显示，具有以下交互效果：

- **按钮样式**：支付宝按钮为蓝色（`#00a0e8`），微信按钮为绿色（`#1aad19`）
- **悬停效果**：鼠标悬停按钮时，按钮上浮并显示阴影，二维码从底部弹出
- **二维码展示**：二维码以绝对定位方式浮于按钮上方，最大宽度 258px
- **暗色模式**：自动适配暗色主题

## 仅显示一种支付方式

如果只需要支持一种支付方式，只需配置对应的字段，另一个留空即可：

```typescript
// 仅启用微信赞赏
export const rewardConfig = {
  enable: true,
  WeChat: "/images/wechat-qr.png",
  // AliPay 留空，不显示支付宝按钮
};
```

## 国际化

赞赏功能支持以下 i18n 键：

| 键名 | 用途 |
|------|------|
| `rewardMessage` | 默认提示文字 |
| `rewardAliPay` | 支付宝按钮文字 |
| `rewardWeChat` | 微信按钮文字 |

可在 `src/i18n/languages/` 对应语言文件中自定义翻译。
