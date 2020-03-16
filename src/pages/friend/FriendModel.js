module.exports = class FriendModel{
    constructor(){
        this._View = require("./FriendView");
        this._vrcObs = require("../../module/vrc-observer/index");
        this._Store = require("electron-store");
        this.fs = require("fs");
        this.path = require("path");
        this.readline = require("readline");
        this.dateformat = require("dateformat");

        this.View = new this._View(this);
        this.store = new this._Store();
        this.vrcObserver = new this._vrcObs();

        if(this.store.get("saveLogStatus") != undefined && this.store.get("saveLogStatus")){
            // vrc終了時にsavePlaylog();
            this.vrcObserver.onExit(this.savePlaylog.bind(this));
        }
    }
    
    onSelect(){
        this.View.setView();
        this.View.setUiEvents();
        this.setSaveLogView();
    }


    onChangeLogParam(status, DCL, dir){
        this.store.set("saveLogStatus", status);
        this.store.set("saveLogDir", dir);
        this.store.set("saveLogDCL", DCL);
        if(status){
            this.vrcObserver.onExit(this.savePlaylog.bind(this));
        }else{
            this.vrcObserver.clearOnExit();
        }
    }

    setSaveLogView(){
        let status = this.store.get("saveLogStatus");
        let dcl = this.store.get("saveLogDCL");
        let dir = this.store.get("saveLogDir");
        this.View.setSaveLogParam(status, dcl, dir);
    }

    savePlaylog = async ()=>{
        const userName = this.store.get("username");
        const logFilePath = `C:/Users/${userName}/AppData/LocalLow/VRChat/VRChat`;
        const re = /output_log_(\d|-)*_(AM|PM)\.txt/;
        const re_friend = /\[NetworkManager\] OnPlayerJoined .+/;
        const re_world = /\[RoomManager\] Joining or Creating Room: .+/;

        // 変更日時でソート
        let ls = this.fs.readdirSync(logFilePath);
        ls = ls.filter(n => re.test(n));
        ls.sort((a,b) => {
            return this.fs.statSync(this.path.join(logFilePath, a)).mtimeMs - 
                this.fs.statSync(this.path.join(logFilePath, b)).mtimeMs;
        });
        
        let logFiles = ls;

        // ログファイル
        for(const file of logFiles){
            let logId = 0;
            let logDate;
            let outFileName ="";
            let outText = "";
            let outDir = this.store.get("saveLogDir");
            let DCL = parseInt(this.store.get("saveLogDCL"), 10);
            
            let stream = this.fs.createReadStream(path.join(logFilePath, file), {encoding:"utf8"});
            let reader = this.readline.createInterface({input: stream});
            
            
            // 1行ずつ処理
            for await (const line of reader){
                if(!line || /^\D/.test(line)) continue;
                // 未取得のファイルのみ
                logId = parseInt(line.substr(0, 19).replace(/(\.|:|\s)/g, ""), 10);
                
                if(logId < this.store.get("lastLogId")){
                    return;
                }
                if(re_friend.test(line)){
                    let date = line.substr(0, 19);     // {2020.03.07 23:42:00}
                    let pname = line.match(/(?<=OnPlayerJoined ).*$/)[0];
                    outText += `${date} User: ${pname}\n`;
                }else if(re_world.test(line)){
                    let date = line.substr(0, 19);     // {2020.03.07 23:42:00}
                    let wname = line.match(/(?<=Creating Room: ).*$/)[0];
                    logDate = new Date(date);
                    logDate.setHours(logDate.getHours() - DCL);
                    let ymd = this.dateformat(logDate, "yyyy-mm-dd");
                    let fnametmp = `VRChat_playlog_${ymd}.txt`;
                    if(outFileName != fnametmp){
                        this.fs.writeFile(this.path.join(outDir,outFileName), outText, ()=>{});
                        outFileName = fnametmp;
                        outText = `--\n${date} World: ${wname}\n`;
                    }else{
                        outText += `--\n${date} World: ${wname}\n`;
                    }
                }
            }
            this.fs.writeFile(this.path.join(outDir,outFileName), outText, ()=>{});
            this.store.set("lastLogId", logId);
        }

    };

}