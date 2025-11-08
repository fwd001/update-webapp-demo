/**
 * 环境判断工具模块
 * 
 * 功能说明：
 * - 提供开发环境和生产环境的判断方法
 * - 用于在开发环境跳过版本轮询，仅在生产环境启用更新检测
 * 
 * 使用场景：
 * - 版本检测：开发环境跳过，生产环境启用
 * - 调试日志：根据环境输出不同级别的日志
 * - 功能开关：根据环境启用或禁用某些功能
 */

/**
 * 判断当前是否为开发环境
 * 
 * 说明：
 * - Vite 会在构建期注入 `import.meta.env.DEV` 和 `import.meta.env.PROD`
 * - 开发环境：`npm run dev` 或 `vite dev` 时返回 true
 * - 生产环境：`npm run build` 构建后返回 false
 * 
 * @returns {boolean} true 表示开发环境，false 表示生产环境
 * 
 * @example
 * ```ts
 * if (isDevMode()) {
 *   console.log('开发环境，跳过版本检测');
 * }
 * ```
 */
export function isDevMode(): boolean {
  // Vite 会在构建期注入 import.meta.env.DEV/PROD
  return import.meta.env.DEV;
}

/**
 * 判断当前是否为生产环境
 * 
 * 说明：
 * - Vite 会在构建期注入 `import.meta.env.PROD`
 * - 生产环境：`npm run build` 构建后返回 true
 * - 开发环境：`npm run dev` 时返回 false
 * 
 * @returns {boolean} true 表示生产环境，false 表示开发环境
 * 
 * @example
 * ```ts
 * if (isProdMode()) {
 *   // 生产环境特定逻辑
 *   enableAnalytics();
 * }
 * ```
 */
export function isProdMode(): boolean {
  return import.meta.env.PROD;
}


