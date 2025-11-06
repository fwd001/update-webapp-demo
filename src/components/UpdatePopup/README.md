# app弹窗更新 组件最佳实践

引用第三方库 @vueuse/core, vue3, ts

```js
import fs from 'fs';
import path from 'path';
const config = {
  plugins: [
    {
      name: 'generate-version',
      closeBundle() {
        // 生成一个包含时间戳的 version.json 文件
        const version = {
          version: new Date().toISOString(), // 可换成 git hash
        };
        const distPath = path.resolve(__dirname, 'dist');
        const versionFile = path.resolve(distPath, 'version.json');

        if (!fs.existsSync(distPath)) {
          fs.mkdirSync(distPath, { recursive: true });
        }

        fs.writeFileSync(versionFile, JSON.stringify(version), 'utf-8');
        console.log('✅ webapp版本文件已生成！');
      },
    },
  ],
};
```

```js main.js 初始化
import { setup as updateAppInit } from './components/UpdatePopup';

async function bootstrap() {
  const app = createApp(App);

  /* ... */

  app.mount('#app');

  // 初始化版本更新！
  updateAppInit();
}
```

```js global.d.ts 类型定义
declare global {
  /* ... */
  let __showUpdatePrompt: (cb: () => void) => void;
  declare interface Window {
    /* ... */
    // 更新弹窗全局事件
    __showUpdatePrompt?: (cb: () => void) => void;
  }
}
```
