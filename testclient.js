function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

var id = guid();
if (process.argv.length>2)
{
  id = process.argv[2];
}

var Client = require('node-edison-client/client');
var eddy = new Client(id);
eddy.read('test-sensor',function(){
  console.log("read called");
  return 42;
},1000);
eddy.connect('http://localhost:4222',function(){});

setTimeout(function(){
  console.log("shutting down...");
  eddy.shutdown();
},10000);