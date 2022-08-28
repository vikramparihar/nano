// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getProgress: () => ipcRenderer.invoke("get-progress"),
  getLogs: () => ipcRenderer.invoke("get-logs"),
  convertPhoto: (args) => ipcRenderer.invoke("convert-photo", args),
  goToDownloadPage: () => ipcRenderer.invoke('go-to-download')
});
