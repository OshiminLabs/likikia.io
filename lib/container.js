const uuid = require("uuid");
const util = require('util');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const fileWhiteList = path.join(__dirname,"..","config", 'whiteList');
var whiteList = [];
process.properties = JSON.parse(process.argv[3]);
function updateWhiteList() {
  fs.stat(fileWhiteList, function(err, stats) {
    if (!err) {
      whiteList = fs.readFileSync(fileWhiteList).toString('utf8').trim().split(/[ ]|\r|\n|\r\n/)
               .filter(function(rx) { return rx.length });
    }
  });
}

const app = require("./app.js");
process.on("disconnect",()=>{
    console.log("bye");
    app.emit("stop");
    process.exit();
});
process.on("exit",()=>{
    console.log("bye");
    app.emit("stop");
});
process.on("beforeExit",()=>{
    console.log("bye");
    app.emit("stop");
});
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
        obj.args = (obj.args||[]).map(x=>{
            if(x && x.remoteFn){
                return(function(){
                    var args = Array.prototype.slice.call(arguments);
                    return new Promise(function(resolve,reject){
                        process.sendMessage({
                            "action" : "call",
                            "call" : x.remoteFn, 
                            "args" : args
                        }).then(resolve).catch(reject);
                    });
                }).bind(this);
            }
            return x;
        });
        if(obj.remote){
            try{
                sandbox.app[obj.call](obj.args,done);
            }catch(e){
                done(e);
            }
        }else
            sandbox.app.emit("call:"+obj.call,obj.args,done);
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
                this.removeListener("message", arguments.callee);
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
