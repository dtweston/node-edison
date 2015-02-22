var NewGuid = require('./new-guid');

var id = NewGuid();
if (process.argv.length>2)
{
  id = process.argv[2];
}

var Client = require('node-edison-client/client');
var eddy = new Client(id);
eddy.read('current_temp',function(){
  console.log("read called");
  return 27;
},1000);
eddy.connect('http://edisonserver.azurewebsites.net',function(){});

setTimeout(function(){
  console.log("shutting down...");
  eddy.shutdown();
},10000);
