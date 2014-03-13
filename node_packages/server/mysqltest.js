

var appPort = 8081;

// Librairies

var express = require('express');
var app = express();
var http = require('http')
var mysql = require('mysql');
var pool  = mysql.createPool({
    host     : 'localhost',
    user     : 'webuser',
    password : 'APh6ifoo',
    database:  'imsportzdemo'
});
require('mootools');

var chatrooms = [];
var userid = 234;
var username = 0;
var msg = {};

msg.chatid = '337';
msg.tokenid = '4abc';

function chatpush(err, results) {
    if (!err && results.length) {
        if (!chatrooms.contains(msg.chatid)) chatrooms.push(msg.chatid);
//        pool.query('delete from chattoken where tokenid = ?', [msg.tokenid]);
    }
}
//pool.query('select pkey from chattoken where userid = ? and chatid = ? and tokenid = ?',
//pool.query("select pkey from chattoken",
pool.query("select tokenid from chattoken where userid = '337' and chatid = '234' and tokenid = '4abc'",
    [], function(err,results) {
        chatpush(err, results);
    }
);

/*
pool.query("select pkey from chattoken",
//    [userid, msg.chatid,msg.tokenid], function(err,results) {
    [], function(err,results) {
        chatpush(err, results);
    }
);
*/
/*
pool.query("select pkey from tokens",
    [], function(err,results) {
        tokenpush(err, results);
    }
);
*/
/*

pool.getConnection(function(err, connection) {
    // Use the connection
    connection.query("select pkey from chattoken", function(err, rows) {
//    connection.query("SELECT PKEY FROM CHATTOKEN", function(err, rows) {
        chatpush(err,rows);
        connection.release();

        // Don't use the connection here, it has been returned to the pool.
    });
});
*/

/*
pool.query("select pkey from chattoken",

    [], function(err,results) {
        chatpush(err, results);
    }
);
*/


