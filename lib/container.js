const uuid = require("uuid");
const util = require('util');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const fileWhiteList = path.join(__dirname,"..","config", 'whiteList');
var whiteList = [];

function updateWhiteList() {
  fs.stat(fileWhiteList, function(err, stats) {
    if (!err) {
      console.log("Updating whiteList.");
      whiteList = fs.readFileSync(fileWhiteList).toString('utf8').trim().split(/[ ]|\r|\n|\r\n/)
               .filter(function(rx) { return rx.length });
    }
  });
}
var app = {

}
const sandbox = {
    console : console,
    app : app,
    require : function(name){
        var n = whiteList.indexOf(name);
        if(n != -1)
            return require(name);
    }
};
vm.createContext(sandbox);
updateWhiteList();
fs.watchFile(fileWhiteList, function(c,p) {
    updateWhiteList();
});
process.on("message",function(){
   console.log("message", arguments) 
})
process.sendMessage = function(obj){
    obj.uuid = uuid();
    return new Promise((resolve,reject)=>{
        this.send(obj);
        this.on("message",function(objResp){
            if(obj.uuid == objResp.uuid){
                emitter.removeListener("message", arguments.callee);
                if(objResp.error){
                    reject(new Error(objResp.error));
                }else if(objResp.result){
                    resolve(objResp.result);
                }
            }
        })
    });
}
fs.readFile(process.argv[2], (err, data) => {
  if (err) throw err;
  vm.runInContext(data, sandbox);
});
