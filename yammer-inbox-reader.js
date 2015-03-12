"use strict";

var Cylon = require("cylon");
var request = require('request');

function writeToScreenFirstLine(screen, message) {
  screen.setCursor(0,0);
  screen.write(message);
}

function writeToScreenSecondLine(screen, message) {
  screen.setCursor(1,0);
  screen.write(message);
}

function writeToScreen(screen, message, line){
  var sub_messages = [];
  sub_messages[0] = "pg is awesome";
  sub_messages[1] = "dj is awesome";
  sub_messages[2] = "grace is awesome";
  sub_messages[3] = "mom is awesome";

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
    }

    // servo: {
    //   driver: 'servo',
    //   pin: 6,
    //   connection: 'edison'
    // }
  },

  work: function(my) {
    var inbox_unread_count = 0;
    var test_i = 0;
    var messages = [];

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
          var json_messages = JSON.parse(response.body);
          inbox_unread_count = json_messages.messages.length;
          console.log("inbox_unread_count: " + inbox_unread_count);
          for (var i=0; i < inbox_unread_count; i++) {
            messages[i] = json_messages.messages[i].body.plain;
            console.log("MESSAGE" + i + ": " + messages[i]);
          }

          if(inbox_unread_count > 0){
            my.red_led.brightness(255);
            my.green_led.brightness(0);
            // writeToScreenFirstLine(my.lcd_screen, messages[0]);
          }else{
            my.green_led.brightness(255);
            my.red_led.brightness(0);
            // writeToScreenFirstLine(my.lcd_screen, "                 ");
            // writeToScreenSecondLine(my.lcd_screen, "                 ");
          }
        });
      });

      test_i = test_i % 4;
      writeToScreen(my.lcd_screen, "", test_i);
      test_i = test_i + 1;

    }, 2000);
  }

}).start();
