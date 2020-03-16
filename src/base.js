'use strict';
const {ipcRenderer} = require("electron");
const path = require('path');
const fs = require('fs');
const _Store = require("electron-store");

let store = new _Store();

const InfoModel = require("./pages/info/InfoModel");
const CacheModel = require('./pages/cache/CacheModel');
const YtdlModel = require('./pages/ytdl/YtdlModel');
const SettingModel = require("./pages/setting/SettingModel");
const PicModel = require("./pages/pic/PicModel");
const FriendModel = require("./pages/friend/FriendModel");

let InfoPage = new InfoModel();
let CachePage = new CacheModel();
let YtdlPage = new YtdlModel();
let SettingPage = new SettingModel();
let PicPage = new PicModel();
let FriendPage = new FriendModel();

// 初回実行
$(()=>{
    // 最初に表示するページ
    if(store.get("vrcPath") == undefined){
        setPage("setting");
    }else{
        setPage("info");
    }
});

// サイドメニュークリック設定
$("#side .clickable").on("click", (e) => {
    let id = e.currentTarget.id;
    setPage(id);
    
    
});

function setPage(pid) {
    $("#main").load("pages\\"+pid+"\\"+pid+".html");
    $(".side-selected").removeClass("side-selected");
    $("#"+pid+" .icon").addClass("side-selected");

    setTimeout(() => {
        switch (pid) {
            case "info":
                InfoPage.onSelect();
                break;
            case "cache":
                CachePage.onSelect();
                break;
            case "ytdl":
                YtdlPage.onSelect();
                break;
            case "setting":
                SettingPage.onSelect();
                break;
            case "pic":
                PicPage.onSelect();
            case "friend":
                FriendPage.onSelect();
        }
    }, 10);
}