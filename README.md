# Web 前端版本更新提示（纯前端方案）

通过定时轮询构建产物中的 `version.json`，对比构建时注入到 HTML 的 Window 变量（`window.__app_version`），检测到新版本时在页面内弹出提示；用户确认后刷新页面以加载最新静态资源。该方案零后端依赖、与框架解耦，可在 Vue/React 等任意前端项目中复用。

## 主要功能与用途

- 自动检测是否有新构建版本产出
- 在页面内非侵入式弹出更新提示
- 用户确认后刷新，确保始终加载最新静态资源

## 实现思路

- 构建阶段：
  - 在 `dist/` 写入 `version.json`，包含唯一标识构建的 `version`（时间戳或 git hash）。
  - 在 HTML 中注入版本信息到 Window 对象（`window.__app_version`），供运行时版本检测使用。
- 运行时（仅生产）：使用 `useIntervalFn` 轮询 `publicPath/version.json`；结合页面可见性，前台轮询、后台暂停，切回前台立即检查一次。
- 版本对比：将远端 `version.json` 中的 `version` 与构建时注入的 `window.__app_version` 比较；不同则触发全局 `window.__showUpdatePrompt(cb)` 显示更新提示；确认后刷新页面加载新版本。

## 依赖与第三方库

- Vue 3 / React：应用框架（方案核心逻辑与框架解耦）。
- Vite：构建与本地开发，注入 `import.meta.env.*`。
- TypeScript：类型与开发期检查。
- @vueuse/core：`useIntervalFn` 提供可见性感知轮询能力。

> `version.json` 可在 Vite 的 `closeBundle`、CI/CD 或托管平台构建脚本中生成。

## 在你的项目中使用

### Vue 3

1) 复制文件

- 复制本仓库的目录/文件：
  - `src/components/UpdatePopup/`（整目录）
  - `src/global.d.ts`
  - 如无则新增 `src/utils/env.ts`（提供 `isDevMode`/`isProdMode`）

2) 初始化调用（`src/main.ts`）

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { setup as updateAppInit } from './components/UpdatePopup'

const app = createApp(App)
app.mount('#app')

// 挂载后初始化，避免阻塞首屏
updateAppInit()
```

3) 生成 `version.json` 并注入版本信息到 HTML

- 使用下文"使用 Vite 生成 version.json 并注入版本信息（推荐）"或在 CI/CD 中：
  - 写入 `dist/version.json`：
    ```json
    { "version": "<git-hash-or-timestamp>" }
    ```
  - 在 HTML 中注入版本信息到 Window 对象：
    ```html
    <script>
      window.__app_version = "<git-hash-or-timestamp>";
    </script>
    ```

4) 可选运行时配置

```ts
// 在入口或 HTML 注入
window.__bizConfig__ = {
  VITE_UPDATE_INTERVAL: 10000, // 毫秒，默认 10000
  VITE_PUBLIC_PATH: '/',       // 默认 '/'
}
```

5) 注意事项

- 开发环境不会轮询：`isDevMode()` 基于 `import.meta.env.DEV`。
- 若采用自定义公共路径，请确保 `version.json` 可通过 `VITE_PUBLIC_PATH + 'version.json'` 访问。
- SSR/微前端：仅在客户端激活后调用 `updateAppInit()`。

### React 18

1) 复制检测逻辑与类型

- 复制或等价实现以下内容：
  - 检测逻辑：`src/components/UpdatePopup/index.ts`（可重命名为 `src/update-check.ts`）
  - 全局类型：`src/global.d.ts`（保持 `window.__showUpdatePrompt` 的签名）

2) 实现 React 弹窗组件

- 组件挂载时赋值 `window.__showUpdatePrompt = (cb) => { ... }`，UI 自行实现。

3) 在入口初始化（`main.tsx`/`main.jsx`）

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { setup as updateAppInit } from './components/UpdatePopup' // 或你的检测文件路径

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

updateAppInit()
```

4) 生成 `version.json` 并注入版本信息到 HTML

- 与 Vue 方案一致：构建后在 `dist/` 写入 `version.json`，并在 HTML 中注入版本信息到 Window 对象；可选设置 `window.__bizConfig__`。

5) 注意事项

- 组件样式与布局可自由定制。
- 路由懒加载或多入口不受影响；方案仅依赖全局函数与轮询逻辑。

## 使用 Vite 生成 version.json 并注入版本信息到 HTML（推荐）

在 `vite.config.ts` 中添加一个插件，在生产构建完成后：
1. 写入 `dist/version.json` 文件
2. 在 HTML 中注入版本信息到 Window 对象（`window.__app_version`）

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'generate-version-and-inject',
      closeBundle() {
        // 生成版本信息（可替换为 git hash）
        const version = { version: new Date().toISOString() }
        const distPath = path.resolve(__dirname, 'dist')
        const versionFile = path.resolve(distPath, 'version.json')
        const htmlFile = path.resolve(distPath, 'index.html')

        // 确保构建产物目录存在
        if (!fs.existsSync(distPath)) {
          fs.mkdirSync(distPath, { recursive: true })
        }

        // 1. 生成 version.json 文件
        fs.writeFileSync(versionFile, JSON.stringify(version), 'utf-8')
        console.log('✅ version.json 已生成:', version)

        // 2. 在 HTML 中注入版本信息到 Window 对象
        if (fs.existsSync(htmlFile)) {
          try {
            let htmlContent = fs.readFileSync(htmlFile, 'utf-8')
            
            // 检查是否已经注入过版本信息，避免重复注入
            if (!htmlContent.includes('window.__app_version')) {
              const injectScript = `
    <script>
      // 注入构建版本信息到 Window 对象，供运行时版本检测使用
      window.__app_version = ${JSON.stringify(version.version)};
    </script>`

              // 在 </title> 标签后注入脚本
              htmlContent = htmlContent.replace(/<\/title>/i, `</title>${injectScript}`)
              fs.writeFileSync(htmlFile, htmlContent, 'utf-8')
              console.log('✅ 版本信息已注入到 HTML！')
            }
          } catch (e) {
            console.warn('注入版本信息到 HTML 失败:', e)
          }
        }
      },
    },
  ],
})
```

> 若使用 CI/CD，也可在构建脚本阶段写入 `version.json` 并在 HTML 中注入版本信息，效果等同。

## 配置项

- `import.meta.env.VITE_PUBLIC_PATH`：版本文件公共路径，默认 `'/'`。
- `window.__bizConfig__.VITE_UPDATE_INTERVAL`：轮询间隔（毫秒），默认 `10000`。
- 开发模式跳过轮询：`isDevMode()`（`src/utils/env.ts`）。

## 目录

- `src/components/UpdatePopup/`：轮询与弹窗（Vue 示例）
- `src/utils/env.ts`：环境判断
- `src/global.d.ts`：全局类型
