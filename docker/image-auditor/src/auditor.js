// definition of parameters
const protocol = require('./protocol');
const moment = require('moment');
//import object for TCP
var net = require('net');


// standart package for UDP use
var dgram = require("dgram");
var s = dgram.createSocket('udp4');

// dictionnary to save musicians
var musiciansList = [];

// listen for connections on a multicast group UDP
s.bind(protocol.PORT, function () {
    console.log("Joining multicast group");
    s.addMembership(protocol.MULTICAST_ADDRESS);
});

// called when new datagram is received UDP
s.on('message', function (msg, source) {
    console.log("Data has arrived: " + msg + ". Source port: " + source.port);

    // deserialize json payload
    var sound = JSON.parse(msg);

    // if musician not in list, add to list
    for (var i = 0; i < musiciansList.length; i++) {
        if (musiciansList[i].uuid === sound.uuid) {
            musiciansList[i].activeSince = sound.activeSince;
            return;
        }
    }

    musiciansList.push(new function () {
        this.uuid = sound.uuid;
        this.activeSince = sound.activeSince;

        // set the sound according to the instrument.
        switch (sound.value) {
            case protocol.PIANO:
                this.instrument = "piano";
                break;
            case protocol.TRUMPET:
                this.instrument = "trumpet";
                break;
            case protocol.FLUTE:
                this.instrument = "flute";
                break;
            case protocol.VIOLIN:
                this.instrument = "violin";
                break;
            case protocol.DRUM:
                this.instrument = "drum";
                break;
            default:
                this.instrument = "rien";
        }
    });

});


// TCP serveur
var tcpServer = net.createServer();
// for telnet connections
tcpServer.on('connection', function (socket) {

    cleanInnactifInstruments();

    socket.write(JSON.stringify(musiciansList));
    socket.end();
});


// check if a musician/instrument is still active
function cleanInnactifInstruments() {

    for (var i = 0; i < musiciansList.length; i++) {
        var duration = moment.duration(moment().diff(musiciansList[i].activeSince));
        if (duration > protocol.DELAY) {
            console.log('Musician removed : ' + JSON.stringify(musiciansList[i]));
            musiciansList.splice(i, 1);
        }
    }
}

// start TCP serveur
tcpServer.listen(protocol.PORT);
console.log("TCP Server now running on port : " + protocol.PORT);