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
const app = require("./app.js");
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
process.on("message",function(obj){
   console.log("message", arguments);
   switch(obj.action){
       case "event":
        process.sendMessage({
            fromUuid : obj.uuid,
            result : sandbox.app.emit(obj.type,obj.args || [])             
        });
        break;
        case "call":
        var done = function(err,resp){
            process.sendMessage({
                fromUuid : obj.uuid,
                result : resp || null,
                error : err || null         
            });
        };
        sandbox.app.emit("call:"+obj.call,obj.args || [],done);  
        break;
   }
})
process.sendMessage = function(obj){
    if(!obj.fromUuid)
       obj.uuid = uuid();
    return new Promise((resolve,reject)=>{
        this.send(obj);
        this.on("message",function(objResp){
            if(objResp.fromUuid && obj.uuid == objResp.fromUuid){
                emitter.removeListener("message", arguments.callee);
                if(objResp.error){
                    reject(new Error(objResp.error));
                }else if(objResp.result){
                    resolve(objResp.result);
                }
            }
        })
    }).then(x=>x,x=>{throw x});
}
fs.readFile(process.argv[2], (err, data) => {
  if (err) throw err;
  vm.runInContext(data, sandbox);
});
