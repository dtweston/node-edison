"use strict";

var Cylon = require("cylon");

Cylon.robot({
  connections: {
    edison: { adaptor: "intel-iot" }
  },

  devices: {
    sensor: {
      driver: "analogSensor",
      pin: 1,
      upperLimit: 400,
      lowerLimit: 100
    }
  },

  work: function(my) {
    my.sensor.on("analogRead", function(val) {
      console.log("Read value ===> " + val);
    });
  }

}).start();