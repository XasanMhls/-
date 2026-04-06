const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, shell, ipcMain } = require('electron');
const path = require('path');

let win = null;
let tray = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 860,
    minHeight: 600,
    backgroundColor: '#08090f',
    title: 'Chronos',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    show: false,
  });

  // Загружаем собранный React-app из dist папки
  win.loadFile(path.join(__dirname, '../client/dist/index.html'));

  win.once('ready-to-show', () => win.show());

  // Внешние ссылки — открывать в браузере
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Сворачивать в трей вместо закрытия
  win.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      win.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);

  const menu = Menu.buildFromTemplate([
    { label: 'Открыть Chronos', click: () => { win.show(); win.focus(); } },
    { type: 'separator' },
    { label: 'Выход', click: () => { app.isQuiting = true; app.quit(); } },
  ]);

  tray.setToolTip('Chronos — Умные напоминания');
  tray.setContextMenu(menu);
  tray.on('double-click', () => { win.show(); win.focus(); });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Не выходим — живём в трее
  }
});

app.on('activate', () => {
  if (win) { win.show(); win.focus(); }
});

// Показывать уведомление из renderer
ipcMain.on('show-notification', (_, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, icon: path.join(__dirname, 'icon.png') }).show();
  }
});
