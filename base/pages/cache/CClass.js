// baseディレクトリで動作する
module.exports = class CClass{
    constructor(){
        this.CacheView = require("./CacheView");
        this.Sidebar = {};
    
        this.CacheFileStats = {count:0,size:0};
        this.CacheFiles = [];

        this.View = new this.CacheView(this);
        this.View.setUiEvents();
        this.loadCacheStatus();
    }
    


    onSelect() {
        let count = this.CacheFileStats.count;
        let totalSize = this.CacheFileStats.size;
        let dispSize;
        if(String(totalSize).length > 9){
            // GB表示
            dispSize = (totalSize/1024**3).toFixed(2) + "GB";
        }else{
            // MB表示
            dispSize = (totalSize/1024**2).toFixed(2) + "MB";
        }

        console.log(count);
        console.log(dispSize);

        setTimeout(() => {
            this.View.setView();
            this.View.setCacheInfo(count, dispSize);
        }, 10);
        
    }

    onButtonPress() {
        this.View.test("キャッシュ削除ボタンが押された");
    }


    loadCacheStatus(){
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
                        let files = fs.readdirSync(cachepath[i]);
                        totalCount += files.length;
                        
                        for (let file of files) {
                            let fp = path.join(cachepath[i], file);
                            let stat = fs.statSync(fp);
                            if (!stat.isDirectory()) {
                                // キャッシュファイル1個に対しての処理
                                totalSize += stat.size;
                                stat.name = fp;
                                this.CacheFiles.push(stat);
                            }
                        }
                    }catch (e){
                        console.log(e);
                    }
                }
            }

            this.CacheFileStats.count = totalCount;
            this.CacheFileStats.size = totalSize;
        }, 0);
        
    }
}