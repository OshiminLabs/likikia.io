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
<<<<<<< HEAD
        console.log("GET",await app.HTTP.get(function(val){
            console.log("remote GET",e.m,val);
            return true;
        }));
=======
        var result = await app.HTTP.get(function(val,done){
            console.log("remote GET",val[0]);
            return "merci"; // => done("merci")
        });
        console.log("HTTP.get =",result);
>>>>>>> 8871fa345057c236ee762a9a184f43f1f681a919
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