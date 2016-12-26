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
                switch(obj.action){
                    case "shutdown":
                        process.exit();
                        break;
                    case "stopNonSystemContainers":
                        for(var i in container){
                            if(path.basename(path.dirname(i)) != "system"){
                                container[i].disconnect();
                                delete container[i];                                
                            }
                        }
                        break;
                    case "stopContainer":
                        console.log("stopContainer",obj.localName)
                        for(var i in container){
                            if(path.basename(path.dirname(i)) != "system" && container[i].config.localName == obj.localName){
                                container[i].disconnect();
                                delete container[i];
                                break;
                            }
                        }
                        this.sendMessage({
                            fromUuid : obj.uuid,
                            result : true,
                            error :  null         
                        });
                        break;
                    case "stopContainers":
                        console.log("stopContainers",obj.localNames);
                        obj.localNames = Array.isArray(obj.localNames) ? obj.localNames : [obj.localNames];
                        for(var i in container){
                            if(path.basename(path.dirname(i)) != "system" && obj.localNames.indexOf(container[i].config.localName) !== -1 ){
                                container[i].disconnect();
                                delete container[i];
                            }
                        }
                        this.sendMessage({
                            fromUuid : obj.uuid,
                            result : true,
                            error :  null         
                        });
                        break;
                    case "call":
                        var done = (err,resp)=>{
                            done = ()=>{};
                            this.sendMessage({
                                fromUuid : obj.uuid,
                                result : resp || null,
                                error : err || null         
                            });
                        };
                        done.bind = ()=>done;
                        if(obj.call in remoteFn)
                            return remoteFn[obj.call].apply(this,obj.args || []).then(response=>done(null,response),error=>done(error));
                        var x = obj.call.replace(/[\.]+$/g,"").replace(/[\.]+/g,".").split(".");
                        var e = CORE,i = 0;
                        for(var i=0;x.length > i ;i++){
                            if(x[i] in e)
                                e = e[x[i]];
                            console.log(e);
                            try{
                                if(i+1 == x.length){
                                    e["."].apply(null,(obj.args||[]).map(argument=>{
                                        if(argument && argument.remoteFn){
                                            var remoteFnID = argument.remoteFn;
                                            remoteFn[plugin.path +"-"+argument.remoteFn] = (function(){
                                                var args = Array.prototype.slice.call(arguments);
                                                console.log("EXE "+remoteFnID,args);
                                                return new Promise((resolve,reject)=>{
                                                    this.sendMessage({
                                                        "action" : "call",
                                                        "remote" : true,
                                                        "call" : remoteFnID, 
                                                        "args" : args
                                                    }).then(resolve).catch(reject);
                                                });
                                            }).bind(this);
                                            argument.remoteFn = plugin.path +"-"+argument.remoteFn;
                                        }
                                        return argument;
                                    })).then(response=>done(null,response),error=>done(error));
                                }
                            }catch(e){
                                done("not Found");
                            }
                        }                  
                    break;
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