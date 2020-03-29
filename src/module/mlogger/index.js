const _log4js = require("log4js");
_log4js.configure(__dirname+"/log-config.json");
module.exports = class mlogger{
    constructor(name){
        return _log4js.getLogger(name);
    }
}