'use strict';
/*
基幹プロセス
アプリ実行中は常に存在する
*/
const path = require('path');
const fs = require('fs');

const CacheModel = require('./pages/cache/CacheModel');
const YtdlModel = require('./pages/ytdl/YtdlModel');
const SettingModel = require("./pages/setting/SettingModel");

let CachePage;
let YtdlPage;
let SettingPage;


// 初回実行
$(()=>{
    CachePage = new CacheModel();
    YtdlPage = new YtdlModel();
    SettingPage = new SettingModel();
    // 最初に表示するページ
    setPage("ytdl");

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
    }
}
