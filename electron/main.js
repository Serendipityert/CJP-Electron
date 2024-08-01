const {
  app,
  BrowserWindow,
  Notification,
  Menu,
  Tray,
  screen,
  ipcMain,
} = require("electron");
const path = require("path");

const { updateElectronApp, UpdateSourceType } = require("update-electron-app");
updateElectronApp();

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

let win;
const NODE_ENV = process.env.NODE_ENV;

const createWindow = (width, height) => {
  let w = 1200;
  let h = 700;
  win = new BrowserWindow({
    width: w,
    height: h,
    maxWidth: width,
    maxHeight: height,
    minWidth: w,
    minHeight: h,
    frame: true,
    resizable: true,
    show: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  win.loadURL(
    NODE_ENV === "development"
      ? "http://localhost:3000/"
      : `file://${path.join(__dirname, "../dist/index.html")}`
  );

  // 打开开发工具
  // if (NODE_ENV === "development") {
  win.webContents.openDevTools();
  // }
};

// app.setAppUserModelId("相知相识");
// 隐藏菜单栏
Menu.setApplicationMenu(null);

/**
 * 桌面通知
 * show():即时向用户展示 notification
 */
const NOTIFICATION_TITLE = "Hello 初识";
const NOTIFICATION_BODY = "初识音乐";

function showNotification() {
  new Notification({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY,
  }).show();
}

/**
 * 系统托盘
 * 添加图标和上下文菜单到系统通知区
 */
function tray() {
  tray = new Tray("./public/logo.png");
  const contextmenu = Menu.buildFromTemplate([
    {
      role: "minimize",
      label: "收起",
      click: () => {
        win.minimize();
      },
    },
    {
      role: "quit",
      label: "退出",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip(app.name);
  tray.on("right-click", () => {
    tray.setContextMenu(contextmenu);
  });
  tray.on("click", () => {
    win.show();
  });
}

// 在窗口中打开您的页面
/**
 * app 模块，它控制应用程序的事件生命周期
 * BrowserWindow 模块，它创建和管理应用程序窗口
 */
app.whenReady().then(async () => {
  const { width, height } = screen.getPrimaryDisplay().size;

  createWindow(width, height);

  showNotification();
  tray();

  win.webContents.send("music-started", "music-started");
});

// 关闭所有窗口时退出应用 (Windows & Linux)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// 最大化事件
ipcMain.on("maximize-app", (e) => {
  if (win.isMaximized()) {
    e.sender.send("restore-app", "restore");

    win.webContents.send("footer-restore", "footer-restore");

    win.restore();
  } else {
    win.maximize();

    win.webContents.send("footer-maximize", "footer-maximize");

    e.sender.send("maximize-app", "maximize");
  }
});

// 最小化事件
ipcMain.on("minimize-app", () => {
  win.minimize();
});

// 关闭事件
ipcMain.on("close-app", () => {
  app.quit();
});
