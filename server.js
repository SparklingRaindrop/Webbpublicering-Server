require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const {logHandler} = require('./js/LogHandler');
const EventHandler = require('./js/EventHandler');

const app = express();
const httpServer = createServer(app);

const options = {
    cors: {
        origin: ['http://localhost:3000/chat', 'http://localhost:3000'],
        method: ['GET', 'POST']
    }
};
const PORT = process.env.PORT || 5000;

const io = new Server(httpServer, options);
const eventHandler = new EventHandler(io);

io.use((socket, next) => {
    console.log("\x1b[34m%s\x1b[0m", `ID: ${socket.id} is connected.`);
    next();
});

io.use(logHandler);

io.on('connection', (socket) => {
    
    socket.on('disconnect', () => {
        eventHandler.handleDisconnect(socket.userName);
    });

    socket.on('user:ready', async ({userName}, callback) => {
        // Check if userName is not empty
        console.log('\x1b[34m%s\x1b[0m', `ID: ${socket.id} set username as ${userName}.`);
        // This is used in disconnect.
        socket.userName = userName;

        const response = await eventHandler.handleReady(socket, userName);
        // response ===> status: 400 || status: 200
        callback(response);
    });

    // Optional property: Receiver for direct message 
    socket.on('msg:send', async (data, callback) => {
        const response = await eventHandler.handleSendMsg(socket, data);
        callback(response);
    });

    socket.on('user:join_room', async (roomName, callback) => {
        const response = await eventHandler.handleJoinRoom(socket, roomName);
        callback(response);
    });

    socket.on('room:create', async (newRoom, callback) => {
        const response = await eventHandler.handleCreateRoom(socket, newRoom);
        callback(response);
    });

    socket.on('room:delete', async (roomName, callback) => {
        const response = await eventHandler.handleDeleteRoom(socket, roomName);
        callback(response);
    });

    socket.on('user:typing_start', async (data, callback) => {
        const response = await eventHandler.handleTypingStart(socket, data);
        callback(response);
    });

    socket.on('user:typing_stop', async (data, callback) => {
        const response = await eventHandler.handleTypingStop(socket, data);
        callback(response);
    });
});

httpServer.listen(PORT);
console.log('\x1b[42m%s\x1b[0m', `Server is running on ${PORT}`);
