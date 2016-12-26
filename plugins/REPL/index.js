const repl = require('repl');
var msg = 'message';
app.on("stop",()=>{
    console.log("REPL bye bye");
});
app.on("start",async function(){
    var e = repl.start('$ ').context;
    e.m = msg;
    e.app = app;    
    try {
        var result = await app.HTTP.get(function(val,done){
            console.log("remote GET",val[0]);
            return "merci"; // => done("merci")
        });
        console.log("HTTP.get =",result);
    }catch(x){
        console.log( "ERROR", x);
    };
});

app.on("call:REPL.exec",function(args,done){
    done("Je suis une error");
});

app.on("call:REPL.exec.toto",function(args,done){
    done(null,Math.floor(6*Math.random()+1));
});