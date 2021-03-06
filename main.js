const debug_mode = false;

const { app, Menu, Tray, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require("fs");
const path = require('path');
const exec = require('child_process').exec;
const _Store = require("electron-store");
const {autoUpdater} = require("electron-updater");
const _mlogger = require("./src/module/mlogger/index");

let store = new _Store();
let mainWindow;
let forseQuit = false;
let notifyUpdate = false;
let logger = new _mlogger("system");

//二重起動の防止
const doubleboot = app.requestSingleInstanceLock();
if(!doubleboot){
    app.quit();
}

if(debug_mode){
    //require("electron-reload")(__dirname);
}else{
    app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true
    });
}

store.set("username", process.env['username']);

logger.info("App Launch");

function createWindow() {
    if(mainWindow && !mainWindow.isDestroyed()){
        mainWindow.show();
        mainWindow.focus();
        return;
    }

    let wb = store.get("windowBounds");
    if(!wb){
        wb = {width:860, height:530};
    }
    mainWindow = new BrowserWindow({
        icon: __dirname + "/icon.ico",
        x:wb.x, y:wb.y, width: wb.width, height: wb.height,
        webPreferences: { nodeIntegration : true}});
    mainWindow.setMinimumSize(860, 530);
    mainWindow.setMaximumSize(860, 0)
    mainWindow.loadURL("file://" + __dirname + "/src/base.html");

    // 開発ツールを有効化
    if(debug_mode) mainWindow.webContents.openDevTools();

    Menu.setApplicationMenu(null);

    //スケーリングしてると変になる
    mainWindow.on("will-resize", (e, newBounds)=>{
        let windowBounds = {x:newBounds.x, y:newBounds.y, width:newBounds.width, height:newBounds.height};
        store.set("windowBounds", windowBounds);
    });

    mainWindow.on("will-move", (e, newBounds)=>{
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
    tray = new Tray(__dirname + '/icon.ico');
    //トレイのコンテキストメニュー
    const contextMenu = Menu.buildFromTemplate([
        {label:'開く', click(menuItem){
            createWindow();
        }},
        {label:"サウンドデバイス設定", click(menuItem){
            exec("C:/Windows/System32/mmsys.cpl",()=>{});
        }},
        {type:"separator"},
        {label:"VRモードで起動", click(){
            launchVRMode();
        }},
        {label:"デスクトップモードで起動", click(){
            launchDesktopMode();
        }},
        {type:'separator'},
        {label:"アップデート確認", click(){
            notifyUpdate = true;
            logger.info("Check for update in manual");
            autoUpdater.checkForUpdatesAndNotify()
            .then((res)=>{
                res.downloadPromise.then(()=>{
                    dialog.showMessageBox(
                        mainWindow,
                        {
                            type: "info",
                            buttons: ["OK"],
                            message: "新しいバージョンをダウンロードしました。再起動してください。"
                        },
                        () => {
                            notifyUpdate = false;
                            autoUpdater.quitAndInstall();
                        }
                    )
                })
            });
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

    setInterval(() => {
        logger.info("Check for update in auto");
        autoUpdater.checkForUpdatesAndNotify();
    }, 60*60*1000);

});

autoUpdater.on("update-not-available", ()=>{
    if(notifyUpdate){
        dialog.showMessageBox(
            mainWindow,
            {
                type: "info",
                buttons: ["ok"],
                message: "最新バージョンです。"
            }
        )
        notifyUpdate = false;
    }
})
autoUpdater.on("update-downloaded", ()=>{
    logger.info("Update avalable");
    mainWindow.webContents.send("setUpdateAvalable", "true");
})


function launchVRMode() {
    exec(`"C:\\Program Files (x86)\\Steam\\Steam.exe" -applaunch 438100`, (err, out, stderr)=>{});
}
function launchDesktopMode() {
    exec(`"C:\\Program Files (x86)\\Steam\\Steam.exe" -applaunch 438100 --no-vr`, (err, out, stderr)=>{});
}


ipcMain.on("openDialogSelectDir", (e, arg)=>{
    let path = dialog.showOpenDialogSync(null, {
        properties: ['openDirectory'],
        defaultPath: arg
    });
    if(path){
        e.returnValue = path[0];
    }else{
        e.returnValue = undefined;
    }
})

ipcMain.on("log", (e, arg)=>{
    console.log(arg);
})

ipcMain.on("updateQuit", (e, arg)=>{
    autoUpdater.quitAndInstall();
})