/**
 * Created by kobi on 2/26/14.
 */
/**
 * Created by kobi on 2/26/14.
 */



var io = require('socket.io-client');
var socket = io.connect('localhost',{port:8081});
var async = require('async');
var prompt = require('prompt');

socket.emit('join', {chatid: '234', userid: '337', tokenid: '4abc'});

socket.on('inroom', function(msg) {
    console.log('inroom');
    socket.emit('newchat', {
        chatid: '234', chatnum: '193946',
        medianum:'199934', chattext: 'Great Game'});
});

socket.on('error', function(msg) {
    console.log('error: ' + msg.error);
});

socket.on('addchat', function(msg) {
    console.log('addchat: ' + msg.chatinfo.toString());
});




/*pool.query("select tokenid from chattoken where userid = '337' and chatid = '234' and tokenid = '4abc'",
 [], function(err,results) {
 chatpush(err, results);
 }
 );
 */