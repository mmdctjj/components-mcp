import { createMcpServer, createSSEServer } from "@components-mcp-plugins/core";
import type { IApi } from "dumi";
import fs from "fs";
import path from "path";

interface ComponentDoc {
  name: string;
  componentPath: string;
  docPath: string;
  content: string;
}

export default (api: IApi) => {
  api.name = "@components-mcp-plugins/core";
  api.describe({
    key: "@components-mcp-plugins/core",
    config: {
      schema(joi) {
        return joi.object({
          componentDir: joi.string().default("src/components"),
          docPattern: joi.string().default("index.md"),
          exclude: joi.array().items(joi.string()).default([]),
        });
      },
    },
  });

  api.registerCommand({
    name: "scan-components",
    description: "扫描组件文档",
    fn: async () => await scanComponentDocs(api),
  });
};

/**
 * 扫描组件文档
 */
async function scanComponentDocs(api: IApi): Promise<ComponentDoc[]> {
  const {
    componentDir = "src/components",
    docPattern = "index.md",
    exclude = [],
  } = api.userConfig.componentScanner || {};

  const componentsPath = path.join(api.cwd, componentDir);
  const result: ComponentDoc[] = [];

  if (!fs.existsSync(componentsPath)) {
    api.logger.warn(`组件目录不存在: ${componentsPath}`);
    return result;
  }

  const componentDirs = fs
    .readdirSync(componentsPath)
    .filter((dir) => !exclude.includes(dir));

  const mcpServer = createMcpServer();

  for (const dir of componentDirs) {
    const componentPath = path.join(componentsPath, dir);
    const stat = fs.statSync(componentPath);

    if (stat.isDirectory()) {
      const docPath = path.join(componentPath, docPattern);

      if (fs.existsSync(docPath)) {
        try {
          const content = fs.readFileSync(docPath, "utf-8");
          mcpServer.tool(dir, {}, async () => {
            return {
              content: [
                {
                  type: "text",
                  text: content,
                },
              ],
            };
          });
        } catch {
          api.logger.warn(`读取文档失败: ${docPath}`);
        }
      }
    }
  }
  createSSEServer(mcpServer);
  return result;
}
