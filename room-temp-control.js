"use strict";

var Cylon = require("cylon");

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
    }, 1000);
  }

}).start();