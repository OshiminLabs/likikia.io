module.exports = function(obj,container,plugin,remoteFn){
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
}