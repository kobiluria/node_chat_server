

var appPort = 8081;

// Librairies

var express = require('express');
var app = express();
var http = require('http')
var server = http.createServer(app)
var io = require('socket.io').listen(server);
io.set('log level', 1);

var mysql = require('mysql');
var pool  = mysql.createPool({
    host     : 'localhost',
    user     : 'webuser',
    password : 'APh6ifoo',
    database:  'imsportzdemo'
});
require('mootools');
async = require('async');

/**
 * This is the chat room dict
 * @property chat_rooms
 */
var chat_rooms = {};


server.listen(appPort);

console.log("Server listening on port : " + appPort);



// io socket connection :
io.sockets.on('connection', function (socket) { // First connection
        console.log('connected to chatnode');
    var chatrooms = [];
    var userid = 0;
    var username = 0;

        io.sockets.socket(socket.id).emit("connected", {});
        socket.on('join' , function(msg) {
            console.log('join');
            var chatid = msg.chatid;
            userid = msg.userid;
//            pool.query('select pkey from chattoken where userid = ? and chatid = ? and tokenid = ?',
            pool.query('select pkey from chattoken where userid = ? and chatid = ? and tokenid = ?',
                [userid, msg.chatid,msg.tokenid], function(err,results) {
                    if (!err &&  results.length ) {
                        if (!chatrooms.contains(chatid)) chatrooms.push(chatid);
//                        pool.query('delete from chattoken where tokenid = ?', [msg.tokenid]);
                        socket.join('c' + chatid);
                        io.sockets.socket(socket.id).emit("inroom", {userid: userid, chatid: chatid});

                    }
                    else {
                        io.sockets.socket(socket.id).emit("error", {error: userid + ',' + chatid + ': inroom error'});
                    }
                });
        });
        socket.on('leave' , function(msg) {
            console.log('join');
            var chatid = msg.chatid;
            socket.join('c' + chatid);
        });

        socket.on('addchat', function(msg) {
            console.log('addchat');
            var chatid = msg.chatid;
            var chattext = msg.chattext;
            var chatnum  = msg.chatnum;
            var medianum = msg.medianum;

            var chatkey = 0;
            if (chatrooms.contains(chatid)) {
                pool.query('select chatnum from chats where chatnum = ?',chatnum, function(err,results) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if (results.length) {
                            console.log('chatnum exists');
                            io.sockets.socket(socket.id).emit("error", {error: chatnum + ': chatnum exists'});
                            console.log('chatnum exists');
                        }
                        else {
                            console.log('chatnum does not exist');
                            var time = Math.floor(new Date().getTime() / 1000);
                            pool.query('insert into chats (chatid,chattime,userid,chattext, chatnum,medianum) values (?,?,?,?,?,?)',
                                [chatid,time,userid,chattext,chatnum,medianum],
                                function(err,result) {
                                    if (err || !result || !result.insertId) {
                                        console.log('cant insert');
                                    }
                                    else {
                                        chatkey = result.insertId;
                                        var mediaurl = '{chatid}.{userid}.{medianum}'.substitute({chatid: chatid,userid: userid,medianum: medianum});
                                        var chatinfo = [msg.fullname,msg.userpic,chattext,time,chatkey,chatnum,mediaurl];
                                        socket.broadcast.to('c' + chatid).emit('addchat', {chatinfo: chatinfo});
                                        console.log('broadcast chat');
                                    }
                                });
                        }
                    }
                });
            }
            else {
                io.sockets.socket(socket.id).emit("notinroom", {userid: userid, chatid: chatid});
            }
        });

        socket.on('disconnect', function () { // Disconnection of the client
        });
    }
);

