// definition of parameters
const protocol = require('./protocol');
const moment = require('moment');
//import object for TCP
var net = require('net');


// standart package for UDP use
var dgram = require("dgram");
var s = dgram.createSocket('udp4');

// dictionnary to save musicians
var musiciansList = {};

// listen for connections on a multicast group UDP
s.bind(protocol.PORT, function() {
    console.log("Joining multicast group");
    s.addMembership(protocol.MULTICAST_ADDRESS);
});


// called when new datagram is received UDP
s.on('message', function(msg, source) {
    console.log("Data has arrived: " + msg + ". Source port: " + source.port);

    // deserialize json payload
    var musician = JSON.parse(msg);
    var uuid = musician.uuid

    // if musician not in list, add to list
    if(!(uuid in musiciansList)){
        musiciansList[uuid] = musician;
    }
    // else update activityTime
    else{
        musiciansList[uuid].activeSince = musician.activeSince;
    }
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

    for(musician in musiciansList){
        if(moment().diff(musician.activeSince) > protocol.DELAY){
            console.log('Musician removed : ' + JSON.stringify(musician));
            delete musiciansList[musician.uuid];
        }
    }
}

// start TCP serveur
tcpServer.listen(protocol.PORT);
console.log("TCP Server now running on port : " + protocol.PORT);