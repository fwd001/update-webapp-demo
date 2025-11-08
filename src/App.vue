<!--
  应用根组件
  
  组件说明：
  - 应用的入口组件，包含主要页面结构和子组件
  - 集成了更新检测弹窗组件，用于提示用户应用有新版本可用
-->
<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
import UpdatePopup from "./components/UpdatePopup/Popup.vue";
</script>

<template>
  <!-- 技术栈 Logo 展示区域 -->
  <div>
    <!-- Vite 构建工具 Logo -->
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <!-- Vue.js 框架 Logo -->
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  
  <!-- HelloWorld 示例组件 -->
  <HelloWorld msg="Vite + Vue2" />
  
  <!-- 更新提示弹窗组件
       用于在检测到新版本时提示用户更新应用 -->
  <UpdatePopup />
</template>

<style scoped>
/**
 * Logo 图片基础样式
 * 
 * 设计特点：
 * - 使用 will-change 优化动画性能
 * - 添加过渡效果，提升交互体验
 */
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

/**
 * Vite Logo 悬停效果
 * 蓝色光晕效果
 */
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

/**
 * Vue Logo 悬停效果
 * 绿色光晕效果，与 Vue 品牌色一致
 */
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
