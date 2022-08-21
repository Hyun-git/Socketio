const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, getRoomUsers, userLeave} = require('./utils/users');

//Set static folder
app.use(express.static(path.join( __dirname, 'public')));

const botName = 'ChatBot';

//Run when a client connects
io.on('connection', (socket) => {

    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcome message
        socket.emit('newMessage', formatMessage(botName, `Welcome to the chat app ${user.username}`));

        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('newMessage', formatMessage(botName, `${user.username} has joined the chat`));

        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    })
    
    //listen for chatMessage
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('newMessage', formatMessage(user.username, message));
    });

    //Run when a client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room)
                .emit('newMessage', formatMessage(botName, `${user.username} has left the chat`));
        }

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () =>  console.log(`Server is running on port ${PORT}`));

