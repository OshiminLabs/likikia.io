const EventEmitter = require('events');
const uuid = require('uuid');
var remoteFn = {},
    keys = {};
    appObj = null,
    buildRemoteFn = function(fn){
        if(!("idRemote" in fn))
            fn.idRemote = uuid();
        appObj[fn.idRemote] = fn;
        return {
            remoteFn : fn.idRemote
        };
    },
    buildProxy = (parent,app)=>{
        var handler = {
            get: function(cible, nom){
                var fnName = (parent?(parent+".") : "")+nom.toString().replace(/^Symbol\(/,"").replace(/\)$/,"");
                return nom in cible ?
                    cible[nom] :
                    buildProxy(fnName,function(){
                        var args = Array.prototype.slice.call(arguments);
                        
                        if(process.properties.indexOf(fnName) != -1)
                            return new Promise(function(resolve,reject){
                                var done = (err,resp)=>{
                                    done = ()=>{};
                                    if(err)
                                        reject(err && err.message ? err.message : err );
                                    else
                                        resolve(resp);
                                };
                                done.bind = ()=>done;
                                var ret = module.exports.emit("call:"+fnName,args,done);
                                if(!ret)
                                    done(fnName+" not implemented");
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
    };

class app extends EventEmitter {
  constructor() {
    super();
  }
  startAllContainers(){
    return process.sendMessage({
            action : "startNonSystemContainers"
      }).then(x=>x,x=>x);
  }

  shutdown (){
      return process.sendMessage({
            action : "shutdown"
      }).then(x=>x,x=>x);
  }
 

  stopContainer(){
    if(arguments.length == 0) return;
    if(arguments.length == 1)
        return process.sendMessage({
                action : "stopContainer",
                localName : arguments[0]
        }).then(x=>x,x=>x);
    else
       return process.sendMessage({
                action : "stopContainers",
                localNames : Array.prototype.slice.call(arguments)
        }).then(x=>x,x=>x);

  }

  stopCatContainers(){
    if(arguments.length == 0) 
        return;
    else
       return process.sendMessage({
                action : "stopCatContainers",
                catNames : Array.prototype.slice.call(arguments)
        }).then(x=>x,x=>x);
  }

 uninstallCatContainers(){
    if(arguments.length == 0) 
        return;
    else
       return process.sendMessage({
                action : "uninstallCatContainers",
                catNames : Array.prototype.slice.call(arguments)
        }).then(x=>x,x=>x);
  }

  uninstallAllContainers(){
      console.log('test inside');
       return process.sendMessage({
                action : "uninstallNonSystemContainers",
                catNames : Array.prototype.slice.call(arguments)
        }).then(x=>x,x=>x);
  }

  uninstallContainers(){
    if(arguments.length == 0) 
        return;
    else
       return process.sendMessage({
                action : "uninstallContainers",
                localNames : Array.prototype.slice.call(arguments)
        }).then(x=>x,x=>x);
  }
}

module.exports = buildProxy("",appObj=new app);
