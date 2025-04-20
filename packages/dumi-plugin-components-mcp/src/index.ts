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
  // 设置插件名称和配置key
  api.name = "componentScanner";
  api.describe({
    key: "componentScanner",
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

  // 注册自定义命令
  api.registerCommand({
    name: "scan-components",
    description: "扫描组件文档",
    fn: async () => await scanComponentDocs(api),
  });

  // 添加运行时变量
  api.addRuntimePluginKey(() => "componentScanner");

  // 在编译时提供组件文档数据
  api.modifyConfig((memo) => {
    memo.componentScanner = memo.componentScanner || {};
    memo.componentScanner.getComponentDocs = async () => {
      return scanComponentDocs(api);
    };
    return memo;
  });

  // 可选：将组件文档信息添加到全局变量中
  api.onGenerateFiles(async () => {
    const components = await scanComponentDocs(api);
    api.writeTmpFile({
      path: "component-docs.ts",
      content: `export const componentDocs = ${JSON.stringify(
        components,
        null,
        2
      )};`,
    });
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
    api.logger.warn(`component scanner not found: ${componentsPath}`);
    return result;
  }

  const componentDirs = fs
    .readdirSync(componentsPath)
    .filter((dir) => !exclude.includes(dir));

  const mcpServer = createMcpServer();

  api.logger.info("start mcp components scan...");

  for (const dir of componentDirs) {
    const componentPath = path.join(componentsPath, dir);
    const stat = fs.statSync(componentPath);

    if (stat.isDirectory()) {
      // 查找文档文件
      const docPath = path.join(componentPath, docPattern);

      if (fs.existsSync(docPath)) {
        try {
          const content = fs.readFileSync(docPath, "utf-8");
          api.logger.info("register component tool:", dir);
          result.push({
            name: dir,
            componentPath: componentPath,
            docPath: docPath,
            content: content,
          });
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
        } catch (e) {
          api.logger.error(`read file error: ${docPath}`, e);
        }
      } else {
        api.logger.info(`not found doc: ${docPath}`);
      }
    }
  }

  const PORT = process.env.PORT || 3000; // 优先从环境变量获取端口

  createSSEServer(mcpServer, Number(PORT) + 1);

  api.logger.info(
    `mcp components scan done!, success register ${result.length} component tools`
  );

  return result;
}
