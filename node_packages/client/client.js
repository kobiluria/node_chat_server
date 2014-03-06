/**
 * Created by kobi on 2/26/14.
 */
/**
 * Created by kobi on 2/26/14.
 */



var io = require('socket.io-client');
var socket = io.connect('localhost',{port:8080});
var async = require('async');
var prompt = require('prompt');


socket.on('count', function (msg) {
    console.log(msg.count);
});

async.series([
    function (callback) {
        socket.on('num_of_users',function (msg) {
            console.log("number of users " + msg.num_of_users);
            callback(null,'one')
        });
    }]);

        setInterval(function(){
            socket.emit('req',{room:'kobi'});
        }, 5000);


    /*function(callback){

        var schema = {
            properties: {
                chat_room: {
                    pattern: /^[a-zA-Z\s\-]+$/,
                    message: 'Name must be only letters, spaces, or dashes',
                    required: true
                }
            }
        };

//
// Start the prompt
//
        prompt.start();

//
// Get two properties from the user: email, password
//
        prompt.get(schema, function (err, result) {
            //
            // Log the results.
            //
            console.log('Command-line input received:');
            console.log('  chat room : ' + result.chat_room);
            socket.emit('req', {room : result.chat_room});

            socket.on('count', function (msg) {
                console.log(msg.count);
            })
            callback(null,'two');
        });


    },prompt.pause()*/



