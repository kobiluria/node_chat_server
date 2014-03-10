## Demo for PhoneGap Websocket Plugin

This project is a demo which demonstrates how to use the [plugin](https://github.com/mkuklis/phonegap-websocket). The demo is based on socket.io.

## Server Setup

- cd server
- npm install
- node server.js

## Client Setup

Make sure android sdk is installed correctly

- npm -g cordova
- cd client
- cordova platform add android
- cordova plugin add https://github.com/mkuklis/phonegap-websocket
- cordova run android


## Issues

If you are using real device please make sure to add your server's IP address to access tag in /platforms/android/res/xml/config.xml  