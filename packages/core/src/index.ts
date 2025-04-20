import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createServer } from "http";

const createMcpServer = () => {
  const mcpServer = new McpServer({
    name: "componentScanner",
    version: "1.0.0",
  });
  return mcpServer;
};

const createSSEServer = (mcpServer: McpServer, PORT: number) => {
  // 创建 HTTP server
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);

    // SSE GET 请求用于建立连接
    if (req.method === "GET" && url.pathname === "/sse") {
      const transport = new SSEServerTransport("/sse/post", res);
      await mcpServer.connect(transport as any);
      return;
    }

    // POST 请求用于发送消息到服务端
    if (req.method === "POST" && url.pathname === "/sse/post") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const parsed = JSON.parse(body);
          const transport = mcpServer["server"][
            "_transport"
          ] as SSEServerTransport;
          await transport.handlePostMessage(req, res, parsed);
        } catch (e) {
          res.writeHead(400);
          res.end("Invalid JSON");
        }
      });
      return;
    }

    // 其他请求
    res.writeHead(404);
    res.end("Not Found");
  });
  // 启动服务器
  server.listen(PORT, () => {
    console.log(`Mcp Server running on http://localhost:${PORT}`);
  });
};

export { createMcpServer, createSSEServer };

export default {
  createSSEServer,
  createMcpServer,
};
