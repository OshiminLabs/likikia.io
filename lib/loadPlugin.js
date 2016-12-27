const newProcess = require('child_process').fork;
const path = require("path");
const uuid = require("uuid");
var remoteFn = {};
var container = [];
var loadContainer = function(plugin){
    if(!(plugin.path in container)){
       container[plugin.path] = newProcess(
           path.join(__dirname,'container.js'),
           [path.join(plugin.path,plugin.main),JSON.stringify(plugin.properties)],
           {execArgv: ['--harmony']}
        );
        container[plugin.path].config = plugin;
        container[plugin.path].on('message', function(obj){
            if(obj.uuid){
                try{
                    require(path.join(__dirname,"msgAction",obj.action+".js")).call(this,obj,container,plugin,remoteFn);
                }catch(e){
                    this.sendMessage({
                            fromUuid : obj.uuid,
                            result : null,
                            error :  e         
                        });
                }
            }
       });
    }
    container[plugin.path].sendMessage = function(obj){
        if(!obj.fromUuid)
           obj.uuid = uuid();
        return new Promise((resolve,reject)=>{
            this.send(obj);
            this.on("message",(objResp)=>{
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
    container[plugin.path].sendMessage({
        "action" : "event",
        "type" : "load"
    });
}

module.exports = function(plugin){
    if(plugin.properties){
        if(!Array.isArray(plugin.properties))
            plugin.properties = [plugin.properties];
        plugin.properties.forEach(X=>{
            x = X.replace(/[\.]+$/g,"").replace(/[\.]+/g,".").split(".");
            var e = CORE,i = 0;
            for(var i=0;x.length > i ;i++){                
                if(!e.hasOwnProperty(x[i]))
                    e[x[i]] = {};
                e = e[x[i]];
                if(i+1 == x.length){
                    e["."] = function(){
                        if(plugin.path in container){
                            var args = Array.prototype.slice.call(arguments);
                             return new Promise(function(resolve,reject){
                                container[plugin.path].sendMessage({
                                    "action" : "call",
                                    "call" : X.replace(/\.+$/,""), 
                                    "args" : args
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
    if(typeof run === "undefined")
        run = setTimeout(function(){
            CORE.REPL.exec.toto["."]().then(console.log.bind(console,"call exec.toto"))
            CORE.REPL.exec["."]().catch(console.error.bind(console,"call exec"))
        },1000)
}


process.on("exit",()=>{
    console.log("Core shutdown...");
    for(var i in container){
        container[i].disconnect();
    }
});