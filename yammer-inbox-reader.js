"use strict";

var Cylon = require("cylon");
var request = require('request');
var Music = require('./music');

function writeToScreenFirstLine(screen, message) {
  screen.setCursor(0,0);
  screen.write(message);
}

function writeToScreenSecondLine(screen, message) {
  screen.setCursor(1,0);
  screen.write(message);
}

function getMessageComponents(messageString) {
  var messageComponents = [];
  var div = Math.floor(messageString.length/16);
  var rem = (messageString.length%16);
  var start = 0;
  var lcdlength = 16;

  for (var i=0; i < div; i++) {
    var end = start + lcdlength;
    messageComponents[i] = messageString.substring(start, end);
    start = end;
  }

  if (rem > 0) {
    start = end;
    end = end + rem;
    messageComponents[div] = messageString.substring(start, end);
  };
  return messageComponents;
}

function writeToScreen(screen, message, line){
  var sub_messages = getMessageComponents(message);
  if(line >= sub_messages.length)
    return;
  screen.clear();
  screen.setColor(53, 39, 249);
  writeToScreenFirstLine(screen, sub_messages[line]);
  if(line + 1 < sub_messages.length){
    writeToScreenSecondLine(screen, sub_messages[line + 1]);
  }else{
    writeToScreenSecondLine(screen, "                      ");
  }
}

Cylon.robot({
  connections: {
    edison: { adaptor: "intel-iot" }
  },

  devices: {
    red_led: {
      driver: "led",
      pin: 6,
      connection: 'edison'
    },
    green_led: {
      driver: "led",
      pin: 5,
      connection: 'edison'
    },
    lcd_screen: {
      driver: 'upm-jhd1313m1',
      connection: 'edison'
    },
    up_button: {
      driver: 'button',
      pin: 3,
      connection: 'edison'
    },
    down_button: {
      driver: 'button',
      pin: 4,
      connection: 'edison'
    },
    buzzer: {
      driver: 'direct-pin',
      pin: 2
    }

    // servo: {
    //   driver: 'servo',
    //   pin: 6,
    //   connection: 'edison'
    // }
  },

  work: function(my) {
    var inbox_unread_count = 0;
    var current_line = 0;
    var current_message = 0;
    var messages = [];


    my.up_button.on('release', function() {
      console.log('up_button released');
      if(current_line >= 1)
      {
        current_line -= 1;
        writeToScreen(my.lcd_screen, messages[0], current_line);
      }
    });

    my.down_button.on('release', function() {
      console.log('down_button released');

      current_line += 1;
      writeToScreen(my.lcd_screen, messages[0], current_line);

    });

    setInterval(function(){

      console.log("check yammer for inbox messages.");

      request.get('https://www.yammer.com/api/v1/messages/inbox.json?filter=unarchived%3Binbox_unseen&threaded=extended&exclude_own_messages_from_unseen=true&', {
        'auth': {
          'bearer': 'XdaqUYnjnzGI0iJuPuKxA'
        }
      }).on('response', function(response) {
        response.body = "";

        response.on('data', function(chunk){
          response.body += chunk;
        });

        response.on('end', function(){
          var old_unread_count = inbox_unread_count;
          var json_messages = JSON.parse(response.body);
          inbox_unread_count = json_messages.messages.length;
          console.log("inbox_unread_count: " + inbox_unread_count);
          for (var i=0; i < inbox_unread_count; i++) {
            messages[i] = json_messages.messages[i].body.plain;
            console.log("MESSAGE" + i + ": " + messages[i]);
          }

          if (inbox_unread_count > old_unread_count) {
            my.buzzer.digitalWrite(1);
          }else{
            my.buzzer.digitalWrite(0);
          }

          if(inbox_unread_count > 0){
            my.red_led.turnOn();
            my.green_led.turnOff();
            writeToScreen(my.lcd_screen, messages[0], current_line);
          }else{
            my.green_led.turnOn();
            my.red_led.turnOff();
            my.lcd_screen.clear();
            my.lcd_screen.setColor(0, 0, 0);
          }
        });
      });
    }, 2000);
  }

}).start();
