

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
    var userid = 0;
    var username = 0;

    io.sockets.socket(socket.id).emit("connected", {});
        socket.on('join' , function(msg) {
            var chatid = msg.chatid;
            pool.query('select pkey from chattoken where userid = ?? and chatid = ?? and tokenid = ??',
                [userid, msg.chatid,msg.tokenid], function(err,results) {
                    if (!err &&  results.length ) {
                        if (!chatrooms.contains(chatid)) chatrooms.push(chatid);
                        pool.query('delete from chattoken where tokenid = ?', [msg.tokenid]);
                        socket.join('c' + chatid);
                        io.sockets.socket(socket.id).emit("inroom", {userid: userid, chatid: chatid});

                    }
                });
        });

        socket.on('addchat', function(msg) {
            var chatid = msg.chatid;
            var chattext = msg.chattext;
            var chatnum  = msg.chatnum;
            var medianum = msg.medianum;

            var chatkey = 0;
            if (chatrooms.contains(chatid)) {
                async.series([
                    function(callback) {
                        pool.query('select chatnum from chats where chatnum = ??',chatnum, function(err,results) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                if (results.length) {
                                    io.sockets.socket(socket.id).emit("chatnum-exists", {chatnum: chatnum});
                                }
                            }
                        })
                    },
                    function(callback) {
                        var time = Math.floor(new Date().getTime() / 1000);
                        pool.query('insert into chats (chatid,chattime,userid,chattext, chatnum,medianum) values (??,??,??,??,??,??)',
                            [chatid,time,userid,chattext,chatnum,medianum],
                            function(err,result) {
                                if (err || !result || !result.inserId) {
                                    callback(err);
                                }
                                else {
                                    chatkey = result.insertId;
                                    var mediaurl = '{chatid}.{userid}.{medianum}'.substitute({chatid: chatid,userid: userid,medianum: medianum});
                                    var chatinfo = [msg.fullname,msg.userpic,chattext,time,chatkey,chatnum,mediaurl];
                                    io.sockets.socket(socket.id).emit("chatnum-exists", {chatnum: chatnum});
                                    socket.broadcast.to('c' + chatid).emit('add-chat', {chatinfo: chatinfo});
                                }
                            });
                    }
                ],
                    function(err) {
                        console.log(err);
                    });
            }
        });

        socket.on('disconnect', function () { // Disconnection of the client
            users -= 1;
            send_user_count();

        });
    }
);

