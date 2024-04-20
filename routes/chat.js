const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');

function getUsers() { 
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
}

router.get('/', (req, res) => {
    const uuid = req.query.uuid;
    if (uuid) {
        const users = getUsers();
        const user = users.find(u => u.id === uuid);
        if (user) {
            res.render('chat', { 
                roomName: `${user.username.charAt(0).toUpperCase()}${user.username.slice(1)}'s Chatroom`,
                username: user.username,
                uuid: uuid 
            });
        } else {
            res.redirect('/?error=usernameDoesNotExist');
        }
    } else {
        res.redirect('/?error=usernameRequired');
    }
});

router.post('/', (req, res) => {
    const username = req.body.username;
    const users = getUsers();

    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (user) {
        res.redirect(`/chat?uuid=${encodeURIComponent(user.id)}`);
    } else {
        res.redirect('/register');
    }
});

module.exports = router;
