console.log("test");
const repl = require('repl');
var msg = 'message';
start = function(){
    repl.start('$ ').context.m = msg;    
}
app.on("start",start);

app.on("call:REPL.exec",function(args,done){
    console.log("REPL.exec");
    done("Je suis une error");
});

app.on("call:REPL.exec.toto",function(args,done){
    console.log("REPL.exec.toto");
    done(null,Math.floor(6*Math.random()+1));
});

app.REPL.exec.toto().then(x=>{
    console.log(x);
})