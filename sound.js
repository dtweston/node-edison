// Plug the sound sensor into the Analog port A0 on the provided
// Seeed Sensor Kit Arduino Shield
// MUST be in the analog pin slots!

var Cylon = require('cylon');

Cylon
  .robot({ name: 'Temperature'})
  .connection('edison', { adaptor: 'intel-iot' })
  .device('sensor', { driver: 'analogSensor', pin: 2, connection: 'edison' })
  .on('ready', function(my) {
    var sensorVal = 0;

    my.sensor.on('analogRead', function(data) {
      sensorVal = data;
    });

    setInterval(function() {
      console.log('Sound Sensor Value:' + sensorVal);
    }, 1000);
  })
  .start();