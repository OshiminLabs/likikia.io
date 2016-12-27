/*
app.on("call:HTTP.get",function(args,done){
    app.os("RES-"+Math.floor(6*Math.random()+1)).then(x=>done(null,x),x=>done(x));
});*/

app.on("call:HTTP.get", async function(args,done) {
    try{
        var fn = args[0];
        var result = await fn("cool");
        console.log("remote EXEC",result);
        done(null,await app.os("RES-"+Math.floor(6*Math.random()+1)));
    } catch(e){
        done(e);
    }
});
app.on("call:os",function(args,done){
    console.log(args);
    done(null,args[0]+"-OS-"+Math.floor(6*Math.random()+1));
});
app.on("start",function(){
    setTimeout(()=>{
        console.log(123);
        app.stopContainer("HTTP","REPL");
    },5000)
})
app.on("stop",()=>{
    console.log("HTTP bye bye");
});