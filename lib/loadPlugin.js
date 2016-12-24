const path = require("path");
const uuid = require("uuid");

var container = [];
var loadContainer = function(plugin){
    if(!(plugin.path in container)){
       container[plugin.path] = require('child_process').fork(path.join(__dirname,'container.js'),[path.join(plugin.path,plugin.main)]);
       container[plugin.path].on('message', (m) => {
            console.log('CHILD got message:', m);
       });
    }
    container[plugin.path].sendMessage = function(obj){
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
        });
    }
    container[plugin.path].sendMessage({
        "action" : "event",
        "type" : "load"
    });
}

module.exports = function(plugin){
    if(plugin.properties){
        if(!Array.isArray(plugin.properties))
            plugin.properties = [plugin.properties];
        plugin.properties.forEach(x=>{
            x = x.replace(/[\.]+$/g,"").replace(/[\.]+/g,".").split(".");
            var e = CORE,i = 0;
            for(var i=0;x.length > i ;i++){                
                if(!e.hasOwnProperty(x[i]))
                    e[x[i]] = {};
                e = e[x[i]];
                if(i+1 == x.length){
                    e["."] = function(){
                        if(plugin.path in container){
                             return new Promise(function(resolve,reject){
                                container[plugin.path].sendMessage({
                                    "action" : "msg",
                                    "property" : x[i], 
                                    "msg" : Array.prototype.slice.call(arguments)
                                }).then(resolve).catch(reject);
                            });
                        } else 
                            return new Promise(function(resolve,reject){
                                reject(new Error("Plugin not found"))
                            });
                    }; 
                    return;
                };
            }
        });
        loadContainer(plugin);
    }
};

module.exports.startEvent = function(){
    for(var i in container){
        container[i].sendMessage({
        "action" : "event",
        "type" : "start"
    });
    }
}
