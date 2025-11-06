declare global {
    /**
     * 通用函数类型
     */
    type Fn = (...args: any[]) => void;
    /**
     * 浏览器全局 Window 上挂载的自定义字段
     */
    interface Window {
      /**
       * 业务配置（通过环境变量或运行时脚本注入）
       */
      __bizConfig__?: {
        VITE_PUBLIC_PATH?: string;
        VITE_UPDATE_INTERVAL: number;
        // 可按需扩展更多键
        [key: string]: unknown;
      };
  
      /**
       * 版本更新提示的触发函数（由 `UpdatePopup/Popup.vue` 运行时挂载）
       */
      __showUpdatePrompt?: (cb: () => void) => void;
    }
  
    /**
     * 也允许以全局变量的形式直接调用（与 Window 字段保持一致）
     */
    let __showUpdatePrompt: (cb: () => void) => void;
  }
  
  export {};
  
  