# @components-mcp/core

[![NPM version](https://img.shields.io/npm/v/@components-mcp/core.svg?style=flat)](https://npmjs.com/package/@components-mcp/core)
[![NPM downloads](http://img.shields.io/npm/dm/@components-mcp/core.svg?style=flat)](https://npmjs.com/package/@components-mcp/core)

## 简介

`@components-mcp/core` 是一个核心库，提供了与 MCP（Model Context Protocol）服务器交互的功能，支持组件扫描和 SSE（Server-Sent Events）通信。

## 技术栈

- **TypeScript**：提供类型安全的开发体验。
- **Node.js**：运行时环境。
- **@modelcontextprotocol/sdk**：用于实现 MCP 协议的核心 SDK。
- **HTTP 模块**：用于创建和管理 HTTP 服务器。

## 功能

### 1. 创建 MCP 服务器

通过 `createMcpServer` 方法，可以创建一个 MCP 服务器实例，用于管理组件的上下文协议。

### 2. 创建 SSE 服务器

通过 `createSSEServer` 方法，可以启动一个支持 SSE 的 HTTP 服务器，用于实时通信。

### 3. 集成工具

支持通过 MCP 服务器工具方法（如 `tool`）处理组件文档的内容。

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

## 导出功能

### `createMcpServer`

创建并返回一个 MCP 服务器实例。

```ts
import { createMcpServer } from "@components-mcp/core";

const mcpServer = createMcpServer();
```

### `createSSEServer`

启动一个支持 SSE 的 HTTP 服务器。

```ts
import { createSSEServer, createMcpServer } from "@components-mcp/core";

const mcpServer = createMcpServer();
createSSEServer(mcpServer);
```

## LICENSE

MIT
