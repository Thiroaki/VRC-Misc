'use strict';
/*
基幹プロセス
アプリ実行中は常に存在する
*/
const path = require('path');
const fs = require('fs');


// 初回実行
$(()=>{
    // 最初に表示するページ
    setPage("info");
    var script = $('<script>').attr({
    'type': 'text/javascript',
    'src': 'pages/cache/CachePresenter.js'
    });
    $('body')[0].appendChild(script[0]);
});

// サイドメニュークリック設定
$("#side .clickable").on("click", (e) => {
    let id = e.currentTarget.id;
    setPage(id);
});

function setPage(pid) {
    $("#main").load("pages\\"+pid+"\\"+pid+".html");
    $(".selected").removeClass("selected");
    $("#"+pid+" .icon").addClass("selected");
}
