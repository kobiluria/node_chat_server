

var appPort = 8080;

// Librairies

var express = require('express');
var app = express();
var http = require('http')
var server = http.createServer(app)
var io = require('socket.io').listen(server);


/**
 * This is the chat room dict
 * @property chat_rooms
 */
var chat_rooms = {};


server.listen(appPort);

console.log("Server listening on port : " + appPort);

var users = 0;  // count the users

// io socket connection :
io.sockets.on('connection', function (socket) { // First connection
        users += 1; // Add 1 to the count
        send_user_count(); // Send the count to all the users

        // a req for a chat :
        socket.on('req' , function(msg) {
            var room_name = msg.room;
            var chat_count = chat_rooms[room_name];
            if(chat_count == null){
                chat_rooms[room_name] = 1;
            }

            else chat_rooms[room_name] += 1;

            socket.emit('count',{count:chat_rooms[room_name]});
            console.log(" the room : " + msg.room + "the count" + chat_rooms[room_name]);
        })

        socket.on('disconnect', function () { // Disconnection of the client
            users -= 1;
            send_user_count();

        });
    }
);

function send_user_count() { // Send the count of the users to all
    io.sockets.emit('num_of_users', {"num_of_users": users});
}