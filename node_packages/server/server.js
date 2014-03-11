

var appPort = 8080;

// Librairies

var express = require('express');
var app = express();
var http = require('http')
var server = http.createServer(app)
var io = require('socket.io').listen(server);

var mysql = require('mysql');
var pool  = mysql.createPool({
    host     : 'localhost',
    user     : 'webuser',
    password : 'APh6ifoo'
});
require('mootools');

/**
 * This is the chat room dict
 * @property chat_rooms
 */
var chat_rooms = {};


server.listen(appPort);

console.log("Server listening on port : " + appPort);



// io socket connection :
io.sockets.on('connection', function (socket) { // First connection
        var chatrooms = [];
        userid = 0;

        socket.on('join' , function(msg) {
            var chatid = msg.chatid;
            pool.query('select pkey from chattoken where userid = ? and chatid = ? and tokenid = ?',
                [userid, msg.chatid,msg.tokenid], function(err,results) {
                    if (!err &&  results.length ) {
                        if (!chatrooms.contains(chatid)) chatrooms.push(chatid);
                        pool.query('delete from chattoken where tokenid = ?', [msg.tokenid]);
                        socket.join('c' + chatid);
                    }
                });
        });
        socket.on('identify', function(msg) {
           userid = msg.id;
        });

        socket.on('disconnect', function () { // Disconnection of the client
            users -= 1;
            send_user_count();

        });
    }
);

function send_user_count() { // Send the count of the users to all
    io.sockets.emit('num_of_users', {"num_of_users": users});
}