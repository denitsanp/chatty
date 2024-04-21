const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const moment = require('moment-timezone');
const session = require('express-session');
const sharedSession = require('express-socket.io-session');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const sessionMiddleware = session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: 'auto' } 
});

app.use(sessionMiddleware);

io.use(sharedSession(sessionMiddleware, {
    autoSave: true
}));

const usersFilePath = path.join(__dirname, 'data', 'users.json');

function getUsers() {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
}

app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const homeRouter = require('./routes/home');
const loginRouter = require('./routes/login');
const chatRouter = require('./routes/chat');
const registerRouter = require('./routes/register');

app.use('/', homeRouter);
app.use('/login', loginRouter);
app.use('/chat', chatRouter);
app.use('/register', registerRouter);

const userConnections = new Map();

io.on('connection', (socket) => {
    console.log(`A user connected with session ID: ${socket.handshake.session.id}`); 
    socket.on('new user', (uuid) => {
        const user = getUsers().find(u => u.id === uuid);
        if (user) {
            userConnections.set(socket.id, uuid);
            console.log(`${user.username} (userID:${uuid}) has joined the chat`);
            const timeZone = process.env.TIMEZONE || 'Europe/Helsinki'; 
            const time = moment().tz(timeZone).format('HH:mm');
            io.emit('chat message', { username: 'System', msg: `${user.username} has joined the chat at ${time}` });
        }
    });

    socket.on('chat message', (msg) => {
        const uuid = userConnections.get(socket.id);
        const user = getUsers().find(u => u.id === uuid);
        if (user) {
            io.emit('chat message', { username: user.username, msg: msg });
        }
    });

    socket.on('disconnect', () => {
        console.log(`A user disconnected with session ID: ${socket.handshake.session.id}`);
        const uuid = userConnections.get(socket.id);
        if (uuid) {
            const users = getUsers();
            const user = users.find(u => u.id === uuid);
            if (user) {
                console.log(`${user.username} (userID:${uuid}) has left the chat.`);
                io.emit('chat message', { username: 'System', msg: `${user.username} has left the chat.` });
            }
        }
        userConnections.delete(socket.id);
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
