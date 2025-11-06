// 环境判断工具：用于在开发环境跳过版本轮询，仅在生产环境启用更新检测
export function isDevMode(): boolean {
  // Vite 会在构建期注入 import.meta.env.DEV/PROD
  return import.meta.env.DEV;
}

export function isProdMode(): boolean {
  return import.meta.env.PROD;
}


