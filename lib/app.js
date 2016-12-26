const EventEmitter = require('events');
const uuid = require('uuid');
var remoteFn = {},
    buildRemoteFn = function(fn){
        var id = uuid();
        remoteFn[id] = fn;
        return {
            remoteFn : id
        };
    }

class app extends EventEmitter {
  constructor() {
    super();
  }
}

buildProxy = (parent,app)=>{
    var handler = {
        get: function(cible, nom){
            var fnName = (parent?(parent+".") : "")+nom.toString().replace(/^Symbol\(/,"").replace(/\)$/,"");
            return nom in cible ?
                cible[nom] :
                buildProxy(fnName,function(){
                    var args = Array.prototype.slice.call(arguments);
                    
                    if(fnName in remoteFn && typeof remoteFn[fnName] == "function")
                        return new Promise(function(resolve,reject){
                            var done = function(err,resp){
                                if(err)
                                    reject(err);
                                else
                                    resolve(resp);
                            };
                            try{
                                var ret = remoteFn[fnName](args,done);
                                if(typeof ret != "undefined")
                                    resolve(ret);
                            }catch(e){
                                reject(e);
                            }
                        });
                    else if(process.properties.indexOf(fnName) != -1)
                        return new Promise(function(resolve,reject){
                            var done = function(err,resp){
                                if(err)
                                    reject(err);
                                else
                                    resolve(resp);
                            };
                            module.exports.emit("call:"+fnName,args,done);
                        });
                    else return new Promise(function(resolve,reject){
                        process.sendMessage({
                            action : "call",
                            call : fnName,
                            args : args.map(x=>
                                typeof x == "function" ? buildRemoteFn(x) : x
                            )
                        }).then(resolve).catch(reject);
                    }).then(x=>x,x=>{throw x});
                });
        }
    };
    return new Proxy(app, handler);
}
module.exports = buildProxy("",new app);