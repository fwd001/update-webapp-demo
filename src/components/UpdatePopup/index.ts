import { useIntervalFn } from '@vueuse/core';
import { isDevMode } from '../../utils/env';
/**
 * 超级定时器, 标签切换到后台自动暂停， 切回启动
 */
export const superInterval = (cbFn: Fn, time: number = 10 * 1000) => {
  // 每隔 10 秒钟检测一次
  const { pause, resume } = useIntervalFn(cbFn, time, { immediate: false });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden === false) {
      // 切回当前页面
      cbFn();
      resume?.();
    } else {
      // 切回后台
      pause?.();
    }
  });

  if (document.hidden === false) {
    // 切回当前页面
    cbFn();
    resume?.();
  }
};

// 定期检测发布文件是否有更新---------------------------------------------------------
// app是否第一次进入运行
let __isFirstRun = true;
function checkForUpdates() {
  if (isDevMode()) return;

  const currentVersion = localStorage.getItem('app_version');
  const publicPath = import.meta.env.VITE_PUBLIC_PATH || '/';
  fetch(`${publicPath}version.json`, { cache: 'no-cache' })
    .then((res) => res.json())
    .then((data) => {
      const newVersion = data.version;
      if (!currentVersion || __isFirstRun) {
        localStorage.setItem('app_version', newVersion);
        __isFirstRun = false;
      } else if (currentVersion !== newVersion) {
        // 关联文件 @/components/UpdatePopup.vue 组件弹窗函数
        __showUpdatePrompt?.(() => {
          localStorage.setItem('app_version', newVersion);
          window.location.reload();
        });
      }
    })
    .catch(() => {
      console.warn('版本检查失败!');
    });
}

export const setup = () => {
  // 定期检测是否有新版本, 每隔 VITE_UPDATE_INTERVAL 可配置  默认10秒钟检测一次
  superInterval(checkForUpdates, window.__bizConfig__.VITE_UPDATE_INTERVAL);
};
// 测试定时器
// superInterval(() => {
//   console.log('测试打印');
// }, 2 * 1000);
