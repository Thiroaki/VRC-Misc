'use strict';
const remote = require('electron').remote;
const { dialog } = require('electron').remote;

// 初回実行
$(function(){
    // 最初に表示するページ
    setPage("info");

    //サイドバーアイコン一括設定
    $(".icon i").addClass("fa-2x fa-fw");

    
});

// サイドメニュークリック設定
$("#side .clickable").on("click", function(){
    var id = $(this).attr("id");
    setPage(id);
});


function setPage(pid) {
    $("#main").load("content/"+pid+".html");
    $(".selected").removeClass("selected");
    $("#"+pid+" .icon").addClass("selected");
}