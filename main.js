const { app, Menu, Tray, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

//require("electron-reload")(__dirname);

function createWindow() {
    //二重起動の防止
    const doubleboot = app.requestSingleInstanceLock();
    if(!doubleboot){
        app.quit();
    }

    mainWindow = new BrowserWindow({ width: 820, height: 620,
        'icon': __dirname + '/icon_pre.png',
        webPreferences: { nodeIntegration : true}});
    mainWindow.setMinimumSize(820, 500);
    mainWindow.loadURL("file://" + __dirname + "/src/base.html");

    // 開発ツールを有効化
    mainWindow.webContents.openDevTools();

    Menu.setApplicationMenu(null);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', ()=>{
    tray = new Tray(__dirname + '/icon_pre.ico');

    const contextMenu = Menu.buildFromTemplate([
        {label:'開く', click(menuItem){
          createWindow();
        }},
        {type:'separator'},
        {label:'終了',click(menuItem){
          app.quit();
        }}
    ]);

    //ツールチップの設定
    tray.setToolTip("VRC-Misc");
 
    //右クリック時にコンテキストメニュー表示をセットする
    tray.on('right-click',() =>{
        //メニューを表示
        tray.popUpContextMenu(contextMenu);
    });
 
    //シングルクリック時にリストを表示
    tray.on('click',() =>{
        createWindow();
    });

    createWindow();
});

app.on('window-all-closed', () => {

});
