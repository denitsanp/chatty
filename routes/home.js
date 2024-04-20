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
        if (users.some(user => user.id === uuid)) {
            res.redirect('/chat?uuid=' + encodeURIComponent(uuid));
        } else {
            res.redirect('/register?error=usernameDoesNotExist');
        }
    } else {
        res.render('home');
    }
});

module.exports = router;
