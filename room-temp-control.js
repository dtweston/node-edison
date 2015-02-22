"use strict";

var Cylon = require("cylon");
var Client = require('node-edison-client/client');
var NewGuid = require('./new-guid');

var eddy = new Client(NewGuid());

function writeToScreenFirstLine(screen, message) {
  screen.setCursor(0,0);
  screen.write(message);
}

function writeToScreenSecondLine(screen, message) {
  screen.setCursor(1,0);
  screen.write(message);
}

function raw_temp_to_celsius(raw_room_temp) {
  var B = 3975;
  var resistance = (1023-raw_room_temp)*10000/raw_room_temp;
  return 1 / (Math.log(resistance/10000)/B+1/298.15)-273.15;
 }

Cylon.robot({
  connections: {
    edison: { adaptor: "intel-iot" }
  },

  // todo: use sound to check whether baby is fuzzy and trigger
  // fuzzy LED, servo, and vibration
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
    fan_relay: {
      driver: 'direct-pin',
      pin: 4,
      connection: 'edison'
    },
    fever_led: {
      driver: "led",
      pin: 3,
      connection: 'edison'
    },
    lcd_screen: {
      driver: 'upm-jhd1313m1',
      connection: 'edison'
    },
    servo: {
      driver: 'servo',
      pin: 6,
      connection: 'edison'
    }
  },

  work: function(my) {
    var set_temp = 0;
    var raw_room_temp = 0;
    var servo_angle = 0;
    var interval = 0;

    my.temp_setter.on("analogRead", function(val) {
      set_temp = val / 10;
    });

    my.temp_sensor.on('analogRead', function(data) {
      raw_room_temp = data;
    });

    eddy.read('current_temp', function() {
      return raw_temp_to_celsius(raw_room_temp);
    }, 1000);

    eddy.connect('http://edisonserver.azurewebsites.net',function(){});

    setInterval(function(){
      var increment = 20;
      interval += 1;
      var room_temp = raw_temp_to_celsius(raw_room_temp);
      console.log("room temp : " + room_temp);
      console.log("Set room temp to be : " + set_temp);
      writeToScreenFirstLine(my.lcd_screen, room_temp + "");
      writeToScreenSecondLine(my.lcd_screen, set_temp + "");
      if (room_temp > set_temp){ // if room is too hot, turn on fan
        my.fan_relay.digitalWrite(1);
        my.fever_led.brightness(255);
      }
      else // turn off relay if room is cold
      {
        my.fan_relay.digitalWrite(0);
        my.fever_led.brightness(0);
      }
      // let servo rotate every 5 seconds
      // if(interval >= 5)
      // {
      //   interval = 0;
      //   servo_angle += increment;
      //   if(servo_angle > 150){
      //       servo_angle = 0; //reset position if servo angle is greater than 135 (i.e. 180)
      //   }
      //   my.servo.angle(servo_angle);
      //   console.log("servo angle: " + servo_angle);
      // }
    }, 1000);
  }

}).start();
