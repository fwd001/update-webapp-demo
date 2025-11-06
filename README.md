# Web 前端纯前端版本更新提示最佳实践（Vue 3 + Vite）

本项目提供一个零后端依赖、纯前端的 Web 应用“新版本可用”提示方案示例：通过定时轮询打包产物中的 `version.json`，对比本地已记录版本，若发现变更则在页面内弹出更新提示，点击后刷新加载新版本资源。

## 方案亮点

- 纯前端：不需要后端接口或 WebSocket。
- 感知可见性：页面切换到后台暂停轮询，切回前台自动恢复并立即检查。
- 易接入：仅需初始化一次，无侵入业务代码。
- 可配置：轮询间隔、公共路径等通过环境变量或运行时配置控制。

---

## 快速开始

1) 安装依赖并启动

```bash
pnpm i
pnpm dev
```

2) 初始化更新检测（在 `src/main.ts`）

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { setup as updateAppInit } from './components/UpdatePopup'

createApp(App).mount('#app')

// 初始化版本更新检测（挂载后调用）
updateAppInit()
```

3) 生产环境构建后在 `dist/` 放置 `version.json`

```json
{ "version": "2025-11-06T08:00:00.000Z" }
```

> 注：`version` 字段可替换为 `git commit hash`、时间戳等能唯一标识构建的值。

---

## Vite 配置（生成 version.json 思路）

生产构建完成后写入一个包含版本标识的 `version.json` 到 `dist/`。可使用 Vite 插件的 `closeBundle` 钩子实现：

```js
// 伪代码示例：vite.config.ts 中添加一个写入 dist/version.json 的插件
import fs from 'fs'
import path from 'path'

export default {
  plugins: [
    {
      name: 'generate-version',
      closeBundle() {
        const version = { version: new Date().toISOString() } // 或使用 git hash
        const distPath = path.resolve(__dirname, 'dist')
        const versionFile = path.resolve(distPath, 'version.json')
        if (!fs.existsSync(distPath)) fs.mkdirSync(distPath, { recursive: true })
        fs.writeFileSync(versionFile, JSON.stringify(version), 'utf-8')
        console.log('✅ version.json 已生成')
      },
    },
  ],
}
```

> 你也可以在 CI/CD 中写入该文件，或由静态托管平台的构建脚本生成。

---

## 更新组件的初始化与工作方式

- 初始化入口：`src/components/UpdatePopup/index.ts` 暴露 `setup()`，在应用挂载后调用。
- 轮询逻辑：基于 `@vueuse/core` 的 `useIntervalFn`，每隔一段时间请求 `publicPath/version.json`；
  - 页面可见时轮询，切后台自动暂停；
  - 切回前台会先立即检查一次并继续轮询。
- 版本对比：将 `version.json.version` 与 `localStorage('app_version')` 比较；若不同则通过全局函数 `window.__showUpdatePrompt(cb)` 触发弹窗。
- 弹窗行为：在 `src/components/UpdatePopup/Popup.vue` 中注册 `window.__showUpdatePrompt`；当用户点击“立即更新”，会写入最新版本并刷新页面。

---

## 关键配置

- `import.meta.env.VITE_PUBLIC_PATH`：`version.json` 所在公共路径（默认 `'/'`）。
- `window.__bizConfig__.VITE_UPDATE_INTERVAL`：轮询间隔（毫秒），未配置时默认 `10000`。
- 开发环境跳过：`isDevMode()`（`src/utils/env.ts`）基于 Vite 注入的 `import.meta.env.DEV`，在开发环境不会发起轮询。

---

## 方案思路与流程

1. 构建阶段在 `dist/` 写入 `version.json`，包含一个可唯一标识构建的 `version` 字段。
2. 运行时（仅生产）：定时请求 `version.json`，结合页面可见性优化请求时机。
3. 若发现版本变化：
   - 通过全局函数 `window.__showUpdatePrompt(cb)` 显示提示条；
   - 用户点击“立即更新”后：
     - 将新版本写入 `localStorage('app_version')`；
     - 调用 `window.location.reload()` 强制刷新，加载最新静态资源。

---

## 类型声明（已内置）

`src/global.d.ts` 内置以下全局类型，方便在 TS 中安全使用：

```ts
declare global {
  type Fn = (...args: any[]) => void

  interface Window {
    __bizConfig__?: {
      VITE_PUBLIC_PATH?: string
      VITE_UPDATE_INTERVAL: number
      [key: string]: unknown
    }

    __showUpdatePrompt?: (cb: () => void) => void
  }

  let __showUpdatePrompt: (cb: () => void) => void
}
export {}
```

---

## FAQ

- 为何需要 `version.json`？
  - 因为静态资源通常带有缓存策略，直接比较入口文件的内容不稳定。独立的版本文件能明确且轻量地表达“是否有新构建”。
- 如需灰度或更复杂策略？
  - 可将 `version.json` 扩展为对象，如 `{ version, force, message }`，并在弹窗中按需处理。
- 与 Service Worker 有何区别？
  - 本方案更轻量、可控；若你已使用 PWA/Service Worker，也可以在 SW 中实现更新检测并触发前端提示。

---

## 目录

- `src/components/UpdatePopup/`：更新检测与弹窗组件
  - `index.ts`：轮询与版本对比逻辑
  - `Popup.vue`：提示 UI，并注册全局回调
- `src/utils/env.ts`：环境判断（`isDevMode`、`isProdMode`）
- `src/global.d.ts`：全局类型声明

---

如需接入到你的项目：

1) 拷贝 `UpdatePopup` 目录与 `global.d.ts`；
2) 在 `main.ts` 调用 `updateAppInit()`；
3) 在构建流程产出 `version.json`；
4) 按需配置 `VITE_PUBLIC_PATH` 与 `VITE_UPDATE_INTERVAL`。
