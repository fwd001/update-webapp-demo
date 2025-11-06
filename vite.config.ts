import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import fs from "fs";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: "generate-version",
      closeBundle() {
        // 生成一个包含时间戳的 version.json 文件
        const version = {
          version: new Date().toISOString(), // 可换成 git hash
        };
        const distPath = path.resolve(__dirname, "dist");
        const versionFile = path.resolve(distPath, "version.json");

        if (!fs.existsSync(distPath)) {
          fs.mkdirSync(distPath, { recursive: true });
        }

        fs.writeFileSync(versionFile, JSON.stringify(version), "utf-8");
        console.log("✅ webapp版本文件已生成！");
      },
    },
  ],
});
