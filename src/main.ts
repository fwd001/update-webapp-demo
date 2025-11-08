/**
 * 应用入口文件
 * 
 * 功能说明：
 * - 创建并挂载 Vue 应用实例
 * - 初始化应用更新检测功能
 * 
 * 执行顺序：
 * 1. 导入必要的依赖和样式
 * 2. 创建 Vue 应用实例并挂载到 DOM
 * 3. 初始化更新检测（在应用挂载后执行，避免阻塞首屏渲染）
 */

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { setup as updateAppInit } from './components/UpdatePopup';

// 创建 Vue 应用实例并挂载到 #app 元素
createApp(App).mount('#app')

/**
 * 初始化前端更新检测功能
 * 
 * 说明：
 * - 在应用挂载后执行，避免阻塞首屏渲染
 * - 启动智能轮询定时器，定期检查应用是否有新版本
 * - 检测到新版本时会自动显示更新提示弹窗
 */
updateAppInit();