// baseディレクトリで動作する
const CacheView = require("./pages/cache/CacheView.js");
const Sidebar = {};

let CacheFileStats = {count:0,size:0};
let CacheFiles = [];
let View;

// 起動時実行
$(()=>{
    View = new CacheView(this);
    View.setUiEvents();
    loadCacheStatus();
});

function onSelect() {
    let count = CacheFileStats.count;
    let totalSize = CacheFileStats.size;
    let dispSize;
    if(String(totalSize).length > 9){
        // GB表示
        dispSize = (totalSize/1024**3).toFixed(2) + "GB";
    }else{
        // MB表示
        dispSize = (totalSize/1024**2).toFixed(2) + "MB";
    }

    View.setCacheInfo(count, dispSize);
}

function onButtonPress() {
    View.test("キャッシュ削除ボタンが押された");
}


function loadCacheStatus(){
    // ファイル配列とトータルサイズ取得
    setTimeout(() => {
        const userName = process.env['USERPROFILE'].split(path.sep)[2];
        const cachepath = ["C:/Users/"+userName+"/AppData/LocalLow/VRChat/VRChat/VRCHTTPCache",
                    "C:/Users/"+userName+"/AppData/LocalLow/VRChat/VRChat/HTTPCache-WindowsPlayer"];

        let totalSize=0;
        let totalCount=0;

        for(let i=0; i<cachepath.length; i++){
            if(path.isAbsolute(cachepath[i])){
                try{
                    files = fs.readdirSync(cachepath[i]);
                    totalCount += files.length;
                    
                    for (let file of files) {
                        let fp = path.join(cachepath[i], file);
                        stat = fs.statSync(fp);
                        if (!stat.isDirectory()) {
                            // キャッシュファイル1個に対しての処理
                            totalSize += stat.size;
                            stat.name = fp;
                            CacheFiles.push(stat);
                        }
                    }
                }catch (e){
                    console.log(e);
                }
            }
        }

        CacheFileStats.conunt = totalCount;
        CacheFileStats.size = totalSize;
    }, 0);
    
}