import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { setup as updateAppInit } from './components/UpdatePopup';

createApp(App).mount('#app')
 // 初始化版本更新！
 updateAppInit();