function getMessageComponents(messageString) {
  var messageComponents = [];
  var div = Math.floor(messageString.length/16);
  var rem = (messageString.length%16);
  var start = 0;
  var lcdlength = 16;

  for (var i=0; i < div; i++) {
    var end = start + lcdlength;
    messageComponents[i] = messageString.substring(start, end);
    console.log(start + ":" + end + " | " + messageComponents[i]);
    start = end;
  }

  if (rem > 0) {
    start = end;
    end = end + rem;
    messageComponents[div] = messageString.substring(start, end);
    console.log(start + ":" + end + " | " + messageComponents[i]);
  };

  return messageComponents;
}