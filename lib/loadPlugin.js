const path = require("path");
const uuid = require("uuid");
var remoteFn = {};
var container = [];
var loadContainer = function(plugin){
    if(!(plugin.path in container)){
       container[plugin.path] = require('child_process').fork(
           path.join(__dirname,'container.js'),
           [path.join(plugin.path,plugin.main),JSON.stringify(plugin.properties)],
           {execArgv: ['--harmony']}
        );
       container[plugin.path].on('message', function(obj){
            if(obj.uuid){
                switch(obj.action){
                    case "call":
                        var done = (err,resp)=>{
                            this.sendMessage({
                                fromUuid : obj.uuid,
                                result : resp || null,
                                error : err || null         
                            });
                        };
                        if(obj.call in remoteFn)
                            return remoteFn[obj.call].apply(this,obj.args || []).then(e=>done(null,e),e=>done(e));
                        var x = obj.call.replace(/[\.]+$/g,"").replace(/[\.]+/g,".").split(".");
                        var e = CORE,i = 0;
                        for(var i=0;x.length > i ;i++){
                            if(x[i] in e)
                                e = e[x[i]];
                            if(i+1 == x.length){
                                e["."].apply(null,(obj.args||[]).map(x=>{
                                    if(x && x.remoteFn){
                                        var remoteFnID = x.remoteFn;
                                        remoteFn[plugin.path +"-"+x.remoteFn] = (function(){
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
                                        x.remoteFn = plugin.path +"-"+x.remoteFn;
                                    }
                                    return x;
                                })).then(e=>done(null,e),e=>done(e));
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
    console.log("bye");
    for(var i in container){
        container[i].kill();
    }
});