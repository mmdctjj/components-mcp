# dumi-plugin-components-mcp

[![NPM version](https://img.shields.io/npm/v/dumi-plugin-components-mcp.svg?style=flat)](https://npmjs.com/package/dumi-plugin-components-mcp)
[![NPM downloads](http://img.shields.io/npm/dm/dumi-plugin-components-mcp.svg?style=flat)](https://npmjs.com/package/dumi-plugin-components-mcp)

## 简介

`dumi-plugin-components-mcp` 是一个用于扩展 dumi 功能的插件，支持扫描组件文档并将其集成到 MCP（Model Context Protocol）服务器中。

## 下载和配置

```bash
$ pnpm install dumi-plugin-components-mcp
```

在 `dumi` 配置文件中添加以下配置：

```ts
import { defineConfig } from "dumi";

export default defineConfig({
  plugins: ["dumi-plugin-components-mcp"],
});
```

## 开发功能

### 1. 组件文档扫描

通过 `scan-components` 命令，扫描指定目录下的组件文档，并将其内容解析为结构化数据。

### 2. 配置化支持

支持通过 `componentScanner` 配置项自定义组件目录、文档文件模式以及排除规则。

### 3. 与 MCP 服务器集成

扫描的组件文档会通过 MCP 服务器工具方法进行处理，并支持实时通信功能。

## 安装

```bash
$ pnpm install
```

## 使用

### 启动开发环境

```bash
$ npm run dev
```

### 构建生产环境

```bash
$ npm run build
```

### 扫描组件文档

运行以下命令扫描组件文档：

```bash
$ npx dumi scan-components
```

## LICENSE

MIT
