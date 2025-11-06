import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { setup as updateAppInit } from './components/UpdatePopup';

createApp(App).mount('#app')
 // 初始化前端更新检测：放在挂载后，避免阻塞首屏渲染
 updateAppInit();