var request = require('request');


//https://www.yammer.com/api/v1/messages/inbox.json?filter=unarchived%3Binbox_unseen&threaded=extended&exclude_own_messages_from_unseen=true&_=1426184657399

request.get('https://www.yammer.com/api/v1/messages/inbox.json?filter=unarchived%3Binbox_unseen&threaded=extended&exclude_own_messages_from_unseen=true', {
  'auth': {
    'bearer': 'lbbRDdqRosJ3e8EFuAr4xg'
  }
}).on('response', function(response) {
  response.body = "";
  response.on('data', function(chunk){
    response.body += chunk;
  });
  response.on('end', function(){
    //console.log(response.statusCode);
    //console.log(response.body);
    var jsonMessages = JSON.parse(response.body);
    //console.log(jsonMessages);
    var messages = [];
    for (var i=0; i < jsonMessages.messages.length; i++) {
      messages[i] = jsonMessages.messages[i].body.plain;
      console.log(messages[i]);
    }
  });
});