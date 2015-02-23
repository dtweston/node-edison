"use strict";

var Cylon = require("cylon");
var Client = require('node-edison-client/client');
var NewGuid = require('./new-guid');
var Music = require('./music');

var eddy = new Client("baby status");

function writeToScreenFirstLine(screen, message) {
  screen.setCursor(0,0);
  screen.write(message);
}

function writeToScreenSecondLine(screen, message) {
  screen.setCursor(1,0);
  screen.write(message);
}

function raw_temp_to_celsius(raw_body_temp) {
  var B = 3975;
  var resistance = (1023-raw_body_temp)*10000/raw_body_temp;
  return 1 / (Math.log(resistance/10000)/B+1/298.15)-273.15;
 }

function fussy_baby(sound_level){
  return sound_level > 400 ;
}

Cylon.robot({
  connections: {
    edison: { adaptor: "intel-iot" }
  },

  // todo: use sound to check whether baby is fussy and trigger
  // fussy LED, servo, and vibration
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
    sound_sensor: {
      driver: 'analogSensor',
      pin: 2,
      connection: 'edison'
    },
    fan_relay: {
      driver: 'direct-pin',
      pin: 4,
      connection: 'edison'
    },
    vibration_relay: {
      driver: 'direct-pin',
      pin: 2,
      connection: 'edison'
    },
    fever_led: {
      driver: "led",
      pin: 6,
      connection: 'edison'
    },
    fussy_led: {
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
    var set_temp = 35;
    var raw_body_temp = 0;
    var sound_level = 0;
    var servo_angle = 0;
    var interval = 0;
    var fan_on = false;
    var rocking_on = false;
    var music_on = false;

    // my.temp_setter.on("analogRead", function(val) {
    //   set_temp = val / 10;
    // });

    my.temp_sensor.on('analogRead', function(data) {
      raw_body_temp = data;
    });

    my.sound_sensor.on('analogRead', function(data) {
      sound_level = data;
    });

    eddy.read('current_temp', function() {
      return raw_temp_to_celsius(raw_body_temp);
    }, 1000);

    eddy.read('fussy_mode', function() {
      return fussy_baby(sound_level);
    }, 1000);

    eddy.on('fan', function(data){
      console.log("Got fan command");
      fan_on = data.status;
      console.log(fan_on + "");
    });

    eddy.on('set_temp', function(data){
      console.log("Got set_temp command");
      set_temp = data.value;
      console.log(set_temp + "");
    });

    eddy.on('set_rocking', function(data){
      console.log("Got set_rocking command");
      rocking_on = data.status;
      console.log(rocking_on + "");
    });

    eddy.on('set_music', function(data) {
      console.log('Got set_music command');
      music_on = data.status;
      Music.play_music();
      console.log(music_on + '');
    });

    eddy.connect('http://edisonserver.azurewebsites.net',function(){});

    setInterval(function(){
      // var increment = 20;
      // interval += 1;
      var body_temp = raw_temp_to_celsius(raw_body_temp) + "";
      var body_temp_str = body_temp.substring(0,4);
      console.log("body temp : " + body_temp_str);
      console.log("Set body temp to be : " + set_temp);
      writeToScreenFirstLine(my.lcd_screen, "body temp " + body_temp_str + " C");
      writeToScreenSecondLine(my.lcd_screen, "set  temp " + set_temp + " C");

      if (body_temp > set_temp){ // if room is too hot, turn on fan
        if (fan_on){
          my.fan_relay.digitalWrite(1);
        }else{
          my.fan_relay.digitalWrite(0);
        }
        my.fever_led.brightness(255);
      }
      else{ // turn off relay if room is cold
        my.fan_relay.digitalWrite(0);
        my.fever_led.brightness(0);
      }

      if(fussy_baby(sound_level)){
        console.log("fussy mode!");
        my.fussy_led.brightness(255);
        if(rocking_on){
          my.vibration_relay.digitalWrite(1);
        }
        else{
          my.vibration_relay.digitalWrite(0);
        }
      }
      else{
        my.fussy_led.brightness(0);
        my.vibration_relay.digitalWrite(0);
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
