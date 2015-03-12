var request = require('request');

request.get('https://www.yammer.com/api/v1/users/current.json', {
  'auth': {
    'bearer': '[your_access_token]'
  }
}).on('response', function(response) {
  response.body = "";
  response.on('data', function(chunk){
    response.body += chunk;
  });
  response.on('end', function(){
    console.log(response.statusCode);
    console.log(response.body);
  });
});