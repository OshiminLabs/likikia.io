/*
app.on("call:HTTP.get",function(args,done){
    app.os("RES-"+Math.floor(6*Math.random()+1)).then(x=>done(null,x),x=>done(x));
});*/

app.on("call:HTTP.get",async function(args,done){
    try{
        await args[0](await app.os("RES-"+Math.floor(6*Math.random()+1)));
        done(null,await app.os("RES-"+Math.floor(6*Math.random()+1)));
    } catch(e){
        done(e);
    }
});
app.on("call:os",function(args,done){
    console.log(args);
    done(null,args[0]+"-OS-"+Math.floor(6*Math.random()+1));
});