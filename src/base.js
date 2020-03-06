'use strict';
/*
基幹プロセス
アプリ実行中は常に存在する
*/
const path = require('path');
const fs = require('fs');

const CacheModel = require('./pages/cache/CacheModel');
const YtdlModel = require('./pages/ytdl/YtdlModel');

let CachePage;
let YtdlPage;


// 初回実行
$(()=>{
    // 最初に表示するページ
    setPage("info");

    CachePage = new CacheModel();
    YtdlPage = new YtdlModel();
});

// サイドメニュークリック設定
$("#side .clickable").on("click", (e) => {
    let id = e.currentTarget.id;
    setPage(id);
    if(id == "cache"){
        CachePage.onSelect();
    }else if(id == "ytdl"){
        YtdlPage.onSelect();
    }
});

function setPage(pid) {
    $("#main").load("pages\\"+pid+"\\"+pid+".html");
    $(".selected").removeClass("selected");
    $("#"+pid+" .icon").addClass("selected");
}
