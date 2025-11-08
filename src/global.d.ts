/**
 * 全局类型定义文件
 * 
 * 功能说明：
 * - 定义全局类型和接口，扩展 Window 对象
 * - 为应用更新检测功能提供类型支持
 * 
 * 类型说明：
 * - Fn: 通用函数类型
 * - Window: 扩展浏览器 Window 对象，添加自定义属性和方法
 * - __showUpdatePrompt: 全局函数，用于触发更新提示弹窗
 */

declare global {
    /**
     * 通用函数类型
     * 
     * 用于定义回调函数、事件处理器等函数类型
     * 
     * @example
     * ```ts
     * const callback: Fn = () => {
     *   console.log('执行回调');
     * };
     * ```
     */
    type Fn = (...args: any[]) => void;
    
    /**
     * 扩展浏览器全局 Window 对象
     * 
     * 添加应用更新检测相关的自定义属性和方法
     */
    interface Window {
      /**
       * 业务配置对象
       * 
       * 说明：
       * - 通过环境变量或运行时脚本注入
       * - 用于配置应用的运行时参数
       * 
       * 配置项：
       * - VITE_UPDATE_INTERVAL: 版本检测轮询间隔（毫秒）
       * 
       * @example
       * ```ts
       * window.__bizConfig__ = {
       *   VITE_UPDATE_INTERVAL: 5000
       * };
       * ```
       */
      __bizConfig__?: {
        /** 版本检测轮询间隔（毫秒），默认 10 秒 */
        VITE_UPDATE_INTERVAL: number;
        /** 可按需扩展更多配置项 */
        [key: string]: unknown;
      };
  
      /**
       * 版本更新提示的触发函数
       * 
       * 说明：
       * - 由 `UpdatePopup/Popup.vue` 组件在运行时挂载到 Window 对象
       * - 版本检测模块（index.ts）调用此函数显示更新提示弹窗
       * 
       * @param cb - 用户确认更新后执行的回调函数（通常是刷新页面）
       * 
       * @example
       * ```ts
       * window.__showUpdatePrompt?.(() => {
       *   window.location.reload();
       * });
       * ```
       */
      __showUpdatePrompt?: (cb: () => void) => void;

      /**
       * 应用版本信息
       * 
       * 说明：
       * - 由构建时注入到 HTML 中（通过 vite.config.ts 插件）
       * - 用于与远程 version.json 进行版本对比
       * 
       * 版本格式：
       * - 当前使用 ISO 时间戳（如：2024-01-01T00:00:00.000Z）
       * - 可根据需要替换为 Git Hash 或其他版本标识
       * 
       * @example
       * ```ts
       * const currentVersion = window.__app_version;
       * console.log('当前版本:', currentVersion);
       * ```
       */
      __app_version?: string;
    }
  
    /**
     * 全局函数：触发更新提示弹窗
     * 
     * 说明：
     * - 允许以全局变量的形式直接调用（与 Window 字段保持一致）
     * - 提供更简洁的调用方式，无需通过 window 对象访问
     * 
     * @param cb - 用户确认更新后执行的回调函数
     * 
     * @example
     * ```ts
     * __showUpdatePrompt(() => {
     *   window.location.reload();
     * });
     * ```
     */
    let __showUpdatePrompt: (cb: () => void) => void;
  }
  
  export {};
  
  