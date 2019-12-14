const { app, Menu, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

require("electron-reload")(__dirname);

function createWindow() {
    mainWindow = new BrowserWindow({ width: 820, height: 500,
        'icon': __dirname + '/icon_pre.png',
        webPreferences: { nodeIntegration : true}});
    mainWindow.setMinimumSize(820, 500);
    mainWindow.loadURL("file://" + __dirname + "/index.html");

    // 開発ツールを有効化
    mainWindow.webContents.openDevTools();

    Menu.setApplicationMenu(null);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});