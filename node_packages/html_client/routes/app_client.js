/**
 * Created by kobi on 3/3/14.
 */
$(function() {
    socket.on('message', function(msg) {
        appendNewMessage(msg);
    })})
function appendNewMessage(msg) {
    var html;
    html = "<span class='privMsg'>" + msg.source + " (P) : " + msg.message + "</span><br/>"
    $('#msgWindow').append(html);
}