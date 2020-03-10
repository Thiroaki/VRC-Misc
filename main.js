const { app, Menu, Tray, BrowserWindow } = require('electron');
const path = require('path');
const exec = require('child_process').exec;
const _AutoLaunch = require("auto-launch");
const _Store = require("electron-store");

let store = new _Store();
let mainWindow;
let forseQuit = false;

let autoLaunch = new _AutoLaunch({
    name:'VRC-Misc',
    path:app.getPath('exe'),
  }
);

autoLaunch.isEnabled()
    .then((isEnabled)=>{
        if(isEnabled){
        return;
        }
        //デバッグ時はコメント
        //autoLaunch.enable();
    })
    .catch((err)=>{

    });

require("electron-reload")(__dirname);

//二重起動の防止
const doubleboot = app.requestSingleInstanceLock();
if(!doubleboot){
    app.quit();
}

function createWindow() {
    if(mainWindow && !mainWindow.isDestroyed()){
        mainWindow.show();
        mainWindow.focus();
        return;
    }

    let wb = store.get("windowBounds");
    if(!wb){
        wb = {x:510, y:220, width:860, height:600};
    }
    mainWindow = new BrowserWindow({
        x:wb.x, y:wb.y, width: wb.width, height: wb.height,
        'icon': __dirname + '/icon_pre_64x64.png',
        webPreferences: { nodeIntegration : true}});
    mainWindow.setMinimumSize(860, 600);
    mainWindow.setMaximumSize(860, 0)
    mainWindow.loadURL("file://" + __dirname + "/src/base.html");

    // 開発ツールを有効化
    mainWindow.webContents.openDevTools();

    Menu.setApplicationMenu(null);

    mainWindow.on("will-resize", (e, newBounds)=>{
        let windowBounds = {x:newBounds.x, y:newBounds.y, width:newBounds.width, height:newBounds.height};
        store.set("windowBounds", windowBounds);
    });

    mainWindow.on('close', (event) => {
        if(!forseQuit){
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    
}

app.on('ready', ()=>{
    //トレイアイコン
    tray = new Tray(__dirname + '/icon_pre_32x32.png');
    //トレイのコンテキストメニュー
    const contextMenu = Menu.buildFromTemplate([
        {label:'開く', click(menuItem){
            createWindow();
        }},
        {label:"サウンドデバイス設定", click(menuItem){
            exec("C:/Windows/System32/mmsys.cpl",()=>{});
        }},
        {type:'separator'},
        {label:'終了',click(menuItem){
            forseQuit = true;
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
 
    //シングルクリック時にウィンドウを表示
    tray.on('click',() =>{
        createWindow();
    });

    createWindow();
});


