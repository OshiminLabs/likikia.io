const EventEmitter = require('events');
const uuid = require('uuid');
var remoteFn = {},
    appObj = null,
    buildRemoteFn = function(fn){
        var id = uuid();
        appObj[id] = fn;
        return {
            remoteFn : id
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
                                        reject(err);
                                    else
                                        resolve(resp);
                                };
                                done.bind = ()=>done;
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
    };

class app extends EventEmitter {
  constructor() {
    super();
  }
  shutdown (){
      process.sendMessage({
            action : "shutdown"
      }).then(x=>x,x=>x);
  }
  stopAllContainers(){
      process.sendMessage({
            action : "stopNonSystemContainers"
      }).then(x=>x,x=>x);
  }
  stopContainer(){
    if(arguments.length == 1)
        process.sendMessage({
                action : "stopContainer",
                localName : arguments[0]
        }).then(x=>x,x=>x);
    else
       process.sendMessage({
                action : "stopContainers",
                localNames : Array.prototype.slice.call(arguments)
        }).then(x=>x,x=>x);

  }
}

module.exports = buildProxy("",appObj=new app);
