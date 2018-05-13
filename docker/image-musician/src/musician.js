// definition of parameters
const protocol = require('./protocol');
const uuidv1 = require('uuid/v1');
const moment = require('moment');

// standart package for UDP use
var dgram = require("dgram");
var s = dgram.createSocket('udp4');

function Musician (instrument) {
    this.instrument = instrument;
    this.uuid = uuidv1();

    // allows threw protorype to make updates, will be called by set interval
    Musician.prototype.playSound = function() {

        // create json payload
        var sound = new Object();
        sound.uuid = this.uuid;
        // set the sound according to the instrument.
        switch (instrument) {
            case "piano":
                sound.value = protocol.PIANO;
                break;
            case "trumpet":
                sound.value = protocol.TRUMPET;
                break;
            case "flute":
                sound.value = protocol.FLUTE;
                break;
            case "violin":
                sound.value = protocol.VIOLIN;
                break;
            case "drum":
                sound.value = protocol.DRUM;
                break;
            default:
                sound.value = "silence";
        }
        sound.activeSince = moment();

        var payload = JSON.stringify(sound);


        // send payload over UDP
        message = new Buffer(payload);
        s.send(message, 0, message.length, protocol.PORT, protocol.MULTICAST_ADDRESS, function(err, bytes) {
            console.log("Sending payload: " + payload + " via port " + s.address().port);
        });
    }

    // execute function on periodic basis
    setInterval(this.playSound.bind(this), protocol.INTERVAL);
}

// get argument
var instrument = process.argv[2];

// create object
var m1 = new Musician(instrument);
