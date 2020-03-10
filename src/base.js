'use strict';
/*
基幹プロセス
アプリ実行中は常に存在する
*/
const path = require('path');
const fs = require('fs');
const _Store = require("electron-store");

let sotre = new _Store();

const CacheModel = require('./pages/cache/CacheModel');
const YtdlModel = require('./pages/ytdl/YtdlModel');
const SettingModel = require("./pages/setting/SettingModel");
const PicModel = require("./pages/pic/PicModel");

let CachePage;
let YtdlPage;
let SettingPage;
let PicPage;


// 初回実行
$(()=>{
    CachePage = new CacheModel();
    YtdlPage = new YtdlModel();
    SettingPage = new SettingModel();
    PicPage = new PicModel();

    // 最初に表示するページ
    if(sotre.get("vrcPath") == undefined){
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
        }
    }, 10);
}
