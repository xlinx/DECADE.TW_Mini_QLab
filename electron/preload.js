// 纯壳：前端零改动，暂不暴露任何 API。
// 后续若需主进程能力（文件对话框、托盘、全局快捷键等），在此通过 contextBridge 暴露。
// 注意：本项目 "type": "module"，Electron 主进程/preload 均为 ESM（import 语法）。
