/**
 * Vite 构建配置文件
 * 
 * 功能说明：
 * - 配置 Vue 插件
 * - 自定义构建插件：生成版本文件并注入版本信息到 HTML
 * 
 * 自定义插件功能：
 * - 在构建完成后生成 `version.json` 文件（包含构建时间戳）
 * - 将版本信息注入到 HTML 的 Window 对象中，供运行时版本检测使用
 * 
 * @see https://vite.dev/config/
 */

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [
    // Vue 单文件组件支持插件
    vue(),
    
    /**
     * 自定义构建插件：生成版本文件并注入版本信息
     * 
     * 插件名称：generate-version-and-inject
     * 
     * 执行时机：在构建完成（closeBundle）时执行
     * 
     * 功能：
     * 1. 生成包含构建时间戳的 version.json 文件
     * 2. 将版本信息注入到 HTML 的 Window 对象中
     * 
     * 版本标识说明：
     * - 当前使用 ISO 时间戳作为版本标识
     * - 可根据需要替换为 Git Hash 或其他版本标识
     */
    {
      name: "generate-version-and-inject",
      closeBundle() {
        /**
         * 生成版本信息对象
         * 
         * 当前使用 ISO 时间戳作为版本标识
         * 可根据需要替换为：
         * - Git Hash: 使用 `git rev-parse HEAD` 获取
         * - 语义化版本: 从 package.json 读取
         * - 构建编号: 使用递增的构建编号
         */
        const version = {
          version: new Date().toISOString(), // 可换成 git hash 或其他版本标识
        };
        
        // 构建产物目录路径
        const distPath = path.resolve(__dirname, "dist");
        // 版本文件路径
        const versionFile = path.resolve(distPath, "version.json");
        // HTML 文件路径
        const htmlFile = path.resolve(distPath, "index.html");

        // 确保构建产物目录存在
        if (!fs.existsSync(distPath)) {
          fs.mkdirSync(distPath, { recursive: true });
        }

        /**
         * 生成 version.json 文件
         * 
         * 此文件用于运行时版本检测：
         * - 应用会定期拉取此文件检查是否有新版本
         * - 文件内容与构建时注入到 HTML 的版本信息进行对比
         */
        fs.writeFileSync(versionFile, JSON.stringify(version), "utf-8");
        console.log("✅ webapp版本文件已生成！");

        /**
         * 在 HTML 中注入版本信息到 Window 对象
         * 
         * 目的：
         * - 在应用启动时即可获取当前构建版本
         * - 用于与远程 version.json 进行版本对比
         * 
         * 注入位置：</title> 标签之后
         * 注入内容：window.__app_version = "版本标识"
         */
        if (fs.existsSync(htmlFile)) {
          try {
            let htmlContent = fs.readFileSync(htmlFile, "utf-8");
            
            // 检查是否已经注入过版本信息，避免重复注入
            if (!htmlContent.includes("window.__app_version")) {
              // 构建注入脚本
              const injectScript = `
    <script>
      // 注入构建版本信息到 Window 对象，供运行时版本检测使用
      window.__app_version = ${JSON.stringify(version.version)};
    </script>`;

              // 在 </title> 标签后注入脚本
              htmlContent = htmlContent.replace(/<\/title>/i, `</title>${injectScript}`);
              fs.writeFileSync(htmlFile, htmlContent, "utf-8");
              console.log("✅ 版本信息已注入到 HTML！");
            }
          } catch (e) {
            // 注入失败时的错误处理（不影响构建流程）
            console.warn("注入版本信息到 HTML 失败:", e);
          }
        }
      },
    },
  ],
});
