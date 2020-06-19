const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages.js');
const {addUser, getUser, removedUser, getUsersInRoom} = require('./utils/users.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server); //we need raw http server so we refactor express routes 

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New WebSocket Connection!');

    socket.on('join', ({username, room}, callback) => {

        const {error, user} = addUser({id: socket.id, username, room});

        if(error) {
            return callback(error);
        }

        socket.join(user.room);

       socket.emit('message', generateMessage('Admin' ,'Welcome'));//send message to the user connected
       socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));//send message to all except the joined user
       
       io.to(user.room).emit('roomData', {
           room: user.room,
           users: getUsersInRoom(user.room)
       })
       
       callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        const filter = new Filter();
        
        if(filter.isProfane(message)) {//check for any bad-words
            return callback('Profanity is not allowed');
        }

        io.to(user.room).emit('message', generateMessage(user.username, message));//Send message to all the client
        callback();
    });
    
    socket.on('sendLocation', ({latitude, longitude}, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`));
        callback();
    })

    socket.on('disconnect', () => {
        const user = removedUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `A ${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            
        }
    });
});
server.listen(port, () => {
    console.log('Server is up on Port ' + port);
})