// Room temp control hack

var Cylon = require('cylon');

Cylon
  .robot({ name: 'Room Temperature Control'})
  .connection('edison', { adaptor: 'intel-iot' })
  .device('temp_sensor', { driver: 'analogSensor', pin: 0, connection: 'edison' })
  .on('ready', function(my) {
    var temp_sensor_val = 0;
    var room_temp = 0;

    my.temp_sensor.on('analogRead', function(data) {
      temp_sensor_val = data;
    });

    setInterval(function() {
      var B = 3975;
      var resistance = (1023-temp_sensor_val)*10000/temp_sensor_val;
      var room_temp = 1 / (Math.log(resistance/10000)/B+1/298.15)-273.15;
      console.log('Temperature Sensor Value:' + room_temp);
    }, 1000);
  })
  .start();
