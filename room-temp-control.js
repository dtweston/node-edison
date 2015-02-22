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
    temp_setter: {
      driver: "analogSensor",
      pin: 1,
      upperLimit: 400,
      lowerLimit: 100
    },
    temp_sensor: {
      driver: 'analogSensor',
      pin: 0,
      connection: 'edison'
    },
    relay: {
      driver: 'direct-pin',
      pin: 4,
      connection: 'edison'
    },
    led: {
      driver: "led",
      pin: 3,
      connection: 'edison'
    },
    lcd_screen: {
      driver: 'upm-jhd1313m1',
      connection: 'edison'
    }
  },

  work: function(my) {
    var set_temp = 0;
    var raw_room_temp = 0;

    my.temp_setter.on("analogRead", function(val) {
      set_temp = val / 10;
    });

    my.temp_sensor.on('analogRead', function(data) {
      raw_room_temp = data;
    });

    setInterval(function(){
      var B = 3975;
      var resistance = (1023-raw_room_temp)*10000/raw_room_temp;
      var room_temp = 1 / (Math.log(resistance/10000)/B+1/298.15)-273.15;
      console.log("room temp : " + room_temp);
      console.log("Set room temp to be : " + set_temp);
      writeToScreenFirstLine(my.lcd_screen, room_temp+"");
      writeToScreenSecondLine(my.lcd_screen, set_temp+"");
      if (room_temp > set_temp){ // if room is too hot, turn on relay
        my.relay.digitalWrite(1);
        my.led.brightness(255);
        // writeToScreenFirstLine(my.lcd_screen, "Too Hot!");
      }
      else // turn off relay if room is cold
      {
        my.relay.digitalWrite(0);
        my.led.brightness(0);
        // writeToScreenSecondLine(my.lcd_screen, "Too Cold!");
      }
    }, 1000);
  }

}).start();