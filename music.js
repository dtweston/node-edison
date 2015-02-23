// Make the buzzer go beep
// Warning - this is going to be really annoying.
var async = require('async');
var mraa = require('mraa');
var util = require('util');

var notes = "ccggaagffeeddc ";
var beats = [ 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 4 ];
var tempo = 300;

function play_tone(pin, tone, duration, callback) {
  util.log('Playing ' + tone + ' for duration ' + duration);
  util.log('Period: ' + 1000000.0 / tone);
  pin.period_us(1000000.0 / tone);
  pin.write(0.5);
  setTimeout(function() {
    pin.write(0);
    callback(null);
  }, duration);
}

function play_note(pin, note, duration, callback) {
  var tones = { 'c': 261, 'd': 293, 'e': 329, 'f': 349, 'g': 391, 'a': 440,
    'b': 493, 'C': 523 };
  tone = tones[note];
  if (tone)
    play_tone(pin, tone, duration, callback);
}

function delay(time, callback) {
  util.log('Delaying for ' + time);
  setTimeout(callback, time);
}

function loop(pin) {
  var song = [];
  for (var i = 0; i < notes.length; i++) {
    (function() {
    var note = notes[i];
    var leng = beats[i] * tempo;

    if (note == ' ') {
      song.push(function(callback) {
        delay(leng, function(err, results) {
          delay(tempo / 2, callback);
        });
      });
    }
    else {
      song.push(function(callback) {
        util.log('note ' + note);
        play_note(pin, note, leng, function(err, results) {
          delay(tempo / 2, callback);
        });
      });
    }
    })();
  }

  async.series(song, function(err, results) {
    if (err) {
      util.log('Error running series! ' + err);
    }
    pin.enable(false);
  });
}

module.exports = {
  play_music: function play_music() {
    console.log('MRAA ' + mraa.getVersion());

    var pin = new mraa.Pwm(3);
    pin.enable(true);
    loop(pin);
  }
};

