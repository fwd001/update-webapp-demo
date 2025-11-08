<!--
  HelloWorld 示例组件
  
  组件说明：
  - Vue 3 示例组件，展示基本的响应式数据绑定和事件处理
  - 用于演示 Vue 3 Composition API 的基本用法
  - 支持热模块替换（HMR）功能
-->
<script setup lang="ts">
import { ref } from 'vue'

/**
 * 组件 Props 定义
 * 
 * @property {string} msg - 显示的欢迎消息文本
 */
defineProps<{ msg: string }>()

/**
 * 计数器状态
 * 
 * 使用 Vue 3 的 ref 创建响应式数据
 * 点击按钮时会自动更新视图
 */
const count = ref(0)
</script>

<template>
  <!-- 主标题：显示传入的消息 -->
  <h1>{{ msg }}</h1>

  <!-- 交互卡片区域 -->
  <div class="card">
    <!-- 计数器按钮：点击时增加计数 -->
    <button type="button" @click="count++">count is {{ count }}</button>
    
    <!-- 提示文本：说明如何测试热模块替换（HMR） -->
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <!-- 学习资源链接 -->
  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  
  <!-- 提示文本：引导用户查看更多信息 -->
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
/**
 * 提示文本样式
 * 
 * 使用灰色文字，表示次要信息
 */
.read-the-docs {
  color: #888;
}
</style>
