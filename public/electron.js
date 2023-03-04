const electron = require("electron");
const path = require("path");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;

let isMac = process.platform === "darwin";

const template = [
  /*{
    label: "File",
    submenu: [isMac ? { role: "close" } : { role: "quit" }],
  },*/
];

const menu = electron.Menu.buildFromTemplate(template);
electron.Menu.setApplicationMenu(menu);

module.exports = {
  menu,
};

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 880,
    center: true,
    minHeight: 600,
    minWidth: 900,
    icon: __dirname + '/favicon.ico',
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  // and load the index.html of the app.
  console.log(__dirname);
  mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);