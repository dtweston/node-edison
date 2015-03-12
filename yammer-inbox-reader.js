"use strict";

var Cylon = require("cylon");


function writeToScreenFirstLine(screen, message) {
  screen.setCursor(0,0);
  screen.write(message);
}

function writeToScreenSecondLine(screen, message) {
  screen.setCursor(1,0);
  screen.write(message);
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

    setInterval(function(){

      console.log("check yammer for inbox messages.");
      writeToScreenFirstLine(my.lcd_screen, "12345678901234567890");
      // writeToScreenSecondLine(my.lcd_screen, "set  temp " + set_temp + " C");
      my.red_led.brightness(255);
      my.green_led.brightness(255);

    }, 2000);
  }

}).start();
