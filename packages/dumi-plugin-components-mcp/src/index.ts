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
    fn: async () => {
      const components = await scanComponentDocs(api);
      console.log("扫描到的组件文档:");
      components.forEach((comp) => {
        console.log(`\n组件名称: ${comp.name}`);
        console.log(`文档路径: ${comp.docPath}`);
        console.log("文档内容开头:", comp.content.substring(0, 100) + "...");
      });
      return components;
    },
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
    api.logger.warn(`组件目录不存在: ${componentsPath}`);
    return result;
  }

  const componentDirs = fs
    .readdirSync(componentsPath)
    .filter((dir) => !exclude.includes(dir));

  const mcpServer = createMcpServer();

  api.logger.info("开始扫描组件文档...", mcpServer);

  for (const dir of componentDirs) {
    const componentPath = path.join(componentsPath, dir);
    const stat = fs.statSync(componentPath);

    if (stat.isDirectory()) {
      // 查找文档文件
      const docPath = path.join(componentPath, docPattern);

      if (fs.existsSync(docPath)) {
        try {
          const content = fs.readFileSync(docPath, "utf-8");
          api.logger.info("注册...", dir);
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
          api.logger.error(`读取文档失败: ${docPath}`, e);
        }
      } else {
        api.logger.info(`未找到文档: ${docPath}`);
      }
    }
  }

  createSSEServer(mcpServer);

  api.logger.info(`共扫描到 ${result.length} 个组件文档`);
  return result;
}
