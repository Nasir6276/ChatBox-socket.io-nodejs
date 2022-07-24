const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let users = [];

const port = 3000;

// view Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// STatic path
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io connect
io.sockets.on('connection', (socket) => {
    // Set username
    socket.on('set user', (data, callback) => {
        if(users.indexOf(data) != -1) {
            callback(false);
        } else {
            callback(true);
            socket.username = data;
            users.push(socket.username);
            updateUsers();
        }
    })

    socket.on('send message', function (data) {
        io.sockets.emit('show message', {msg: data, user: socket.username});
    });

    socket.on('disconnect', function (data) {
        if(!socket.username) return;
        users.splice(users.indexOf(socket.username), 1);
    });

    function updateUsers() {
        io.sockets.emit('users', users)
    }
})

app.get('/', (req, res, next) => {
    res.render('index')
});

server.listen(port, () => {
    console.log(`Server started on port ${port}...`);
})