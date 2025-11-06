# Web 前端版本更新提示（纯前端方案）

通过定时轮询构建产物中的 `version.json`，对比本地记录的版本号，检测到新版本时在页面内弹出提示；用户确认后刷新页面以加载最新静态资源。该方案零后端依赖、与框架解耦，可在 Vue/React 等任意前端项目中复用。

## 主要功能与用途

- 自动检测是否有新构建版本产出
- 在页面内非侵入式弹出更新提示
- 用户确认后刷新，确保始终加载最新静态资源

## 实现思路

- 构建阶段：在 `dist/` 写入 `version.json`，包含唯一标识构建的 `version`（时间戳或 git hash）。
- 运行时（仅生产）：使用 `useIntervalFn` 轮询 `publicPath/version.json`；结合页面可见性，前台轮询、后台暂停，切回前台立即检查一次。
- 版本对比：将远端 `version` 与本地 `localStorage('app_version')` 比较；不同则触发全局 `window.__showUpdatePrompt(cb)` 显示更新提示；确认后写入新版本并刷新页面。

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

3) 生成 `version.json`

- 使用下文“使用 Vite 生成 version.json（推荐）”或在 CI/CD 中写入 `dist/version.json`：

```json
{ "version": "<git-hash-or-timestamp>" }
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

4) 生成 `version.json` 与可选配置

- 与 Vue 方案一致：构建后在 `dist/` 写入 `version.json`；可选设置 `window.__bizConfig__`。

5) 注意事项

- 组件样式与布局可自由定制。
- 路由懒加载或多入口不受影响；方案仅依赖全局函数与轮询逻辑。

## 使用 Vite 生成 version.json（推荐）

在 `vite.config.ts` 中添加一个简单插件，在生产构建完成后写入 `dist/version.json`：

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
      name: 'generate-version',
      closeBundle() {
        const version = { version: new Date().toISOString() } // 可替换为 git hash
        const distPath = path.resolve(__dirname, 'dist')
        const versionFile = path.resolve(distPath, 'version.json')
        if (!fs.existsSync(distPath)) fs.mkdirSync(distPath, { recursive: true })
        fs.writeFileSync(versionFile, JSON.stringify(version), 'utf-8')
        console.log('✅ version.json 已生成:', version)
      },
    },
  ],
})
```

> 若使用 CI/CD，也可在构建脚本阶段写入上述文件，效果等同。

## 配置项

- `import.meta.env.VITE_PUBLIC_PATH`：版本文件公共路径，默认 `'/'`。
- `window.__bizConfig__.VITE_UPDATE_INTERVAL`：轮询间隔（毫秒），默认 `10000`。
- 开发模式跳过轮询：`isDevMode()`（`src/utils/env.ts`）。

## 目录

- `src/components/UpdatePopup/`：轮询与弹窗（Vue 示例）
- `src/utils/env.ts`：环境判断
- `src/global.d.ts`：全局类型
