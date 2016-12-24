console.log("test");
const repl = require('repl');
var msg = 'message';
start = function(){
    repl.start('$ ').context.m = msg;    
}