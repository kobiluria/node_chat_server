

var appPort = 8080;

// Librairies

var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var request = require("request");

io.set('log level', 1);

var mysql = require('mysql');
var pool  = mysql.createPool({
    host     : 'localhost',
    user     : 'webuser',
    password : 'APh6ifoo',
    database:  'imsportzdemo'
//
//    database:  'imsportzdemo'
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
        console.log('connected to chatnode:' + socket.id);
    var chatrooms = [];
    var userid = 0;
    var username = 0;

//        io.sockets.socket(socket.id).emit("connected", {});
        socket.emit("connected", {});
        socket.on('join' , function(msg) {
            var chatGroupName = 'c' + msg.chatid;
            console.log('userid: ' + msg.userid + ' ' + socket.id + ' join: ' + chatGroupName + ' token: ' + msg.tokenid);
            var chatid = Number.from(msg.chatid);
            var joinuserid = msg.userid;
//            pool.query('select pkey from chattoken where userid = ? and chatid = ? and tokenid = ?',
            pool.query('select pkey from chattoken where userid = ? and chatid = ? and tokenid = ?',
                [joinuserid, chatid,msg.tokenid], function(err,results) {
                    if (!err &&  results.length ) {
                        userid = joinuserid;
                        if (!chatrooms.contains(chatid)) chatrooms.push(chatid);
//                        pool.query('delete from chattoken where tokenid = ?', [msg.tokenid]);
                        var rooms = io.sockets.manager.roomClients[socket.id];
                        Object.each(rooms, function(value,key) {
                           if (key != '' &&  key != '/' + chatGroupName) {
                               socket.leave(chatGroupName);
                           }
                        });
                        socket.join(chatGroupName);

                        io.sockets.socket(socket.id).emit("inroom", {userid: userid, chatid: chatid});
                        console.log(socket.id + ' joined: ' + chatGroupName);
                        var numusers = io.sockets.clients(chatGroupName).length;
                        if (!numusers) numusers = 0;
                        pool.query("update chatdescription set numusers= ? where pkey= ?",
                            [numusers,chatid],
                            function(err,results){
                                if (err) {
                                    console.log(socket.id + ' errorfound  numusers: ' + numusers + ': ' + chatid + ' ' + err);
                                }
                                else {
                                    console.log(socket.id + '  numusers:' + numusers + ': ' + chatid);
                                }
                        });
                    }
                    else if (!err && results.length) {
                        // sql was successfull, but he's not in the room
                        io.sockets.socket(socket.id).emit("notinroom", {chatid: chatid, message: userid + ',' + chatid + ': inroom error'});
                        console.log("socket: {socket} userid: {userid} chatid: {chatid} tokenid: {tokenid}").substitute({socket: socket.id, userid: userid, chatid: chatid, tokenid: msg.tokenid})
                    }
                    else {
                        io.sockets.socket(socket.id).emit("errorfound", {message: userid + ',' + chatid + ': inroom error'});
                        console.log(socket.id + ' errorfound: ' + chatGroupName + ' ' + err);
                    }
                });
        });
        socket.on('leave' , function(msg) {
            console.log('leave');
            var chatGroupName = 'c' + msg.chatid;
            socket.leave(chatGroupName);
            console.log(socket.id + ' errorfound: ' + chatGroupName);
        });

        socket.on('newchat', function(msg) {
            var chatid =   Number.from(msg.chatid);
            var chattext = msg.chattext;
            var chatnum  = msg.chatnum;
            var medianum = msg.medianum;
            var fullname = msg.fullname;
            var userpic  = msg.userpic;
            var username = msg.username;
            var password = msg.password;
            var newchatuserid = msg.userid;


            console.log('newchat');
            console.log(socket.id + ' newchat received: c' + chatid + ' text: ' + chattext);

            var chatkey = 0;

            function sendNewChat() {
                pool.query('select chatnum from chats where chatnum = ?', chatnum, function (err, results) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if (results.length) {
                            console.log('chatnum exists');
                            io.sockets.socket(socket.id).emit("errorfound", {message: chatnum + ': chatnum exists'});
                            console.log('chatnum exists');
                        }
                        else {
                            console.log('chatnum does not exist');
                            var time = Math.floor(new Date().getTime() / 1000);
                            pool.query('insert into chats (chatid,chattime,userid,chattext, chatnum,medianum) values (?,?,?,?,?,?)',
                                [chatid, time, userid, chattext, chatnum, medianum],
                                function (err, result) {
                                    if (err || !result || !result.insertId) {
                                        console.log('cant insert');
                                    }
                                    else {
                                        chatkey = result.insertId;
                                        var mediaurl =  medianum ? '{chatid}.{userid}.{medianum}'.substitute({chatid: chatid, userid: userid, medianum: medianum}) : '';
                                        var chatinfo = [fullname, userpic, chattext, time, chatkey, chatnum, mediaurl];
                                        io.sockets.in('c' + chatid).emit('addchat', {chatid: chatid,chatinfo: chatinfo});
                                        //socket.broadcast.to('c' + chatid).emit('addchat', {chatid: chatid, chatinfo: chatinfo});
                                        console.log(socket.id + ' broadcast chat: c' + chatid + ' text: ' + chattext);
                                    }
                                });
                        }
                    }
                });
            }
            var inRoom = io.sockets.manager.roomClients[socket.id]['/c' + chatid];
            if (inRoom && userid == newchatuserid) {
//            if (chatrooms.contains(chatid)) {
                sendNewChat();
            }
            else  {

                var requestString = "http://imsportz.com/MEMBERPGMS/getchatAppropriate.php?pass=areqwbrtybybwre&username={username}&password={password}&chatid={chatid}&userid={userid}".substitute({
                    username: username,
                    password: password,
                    chatid: chatid,
                    userid: userid
                });
                console.log('request: ' + requestString);
                request(requestString,
                    function(error, response, body) {
                        console.log('request - error: ' + error + ' response: ' + ' body: ' + body);
                        io.sockets.socket(socket.id).emit("notinroom", {userid: userid, chatid: chatid});

                    if (body == "true") {
                        if (!userid) {
                            userid = newchatuserid;
                        }
                        if (userid == newchatuserid) {
                            sendNewChat();
                        }
                    }

                });
//                    io.sockets.socket(socket.id).emit("notinroom", {userid: userid, chatid: chatid});
            }
            io.sockets.socket(socket.id).emit("chatreceived", {chatnum: chatnum});  // do this in any case so that the client stop sending the chat
        });
        socket.on('disconnect', function () { // Disconnection of the client
            var x12 = 12;
            console.log(socket.id + ' disconnect');
        });
    }
);

//Error handler
process.on('uncaughtException', function (exception) {
    // handle or ignore error
    console.log(exception);
});
