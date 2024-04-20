const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');

function getUsers() {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
}

function saveUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

router.get('/', (req, res) => {
    let errorMessage = null;
    if (req.query.error === 'usernameExists') {
        errorMessage = 'The username already exists. Please choose another one.';
    } else if (req.query.error === 'usernameDoesNotExist') {
        errorMessage = 'The username does not exist. Please register.';
    }
    res.render('register', { error: errorMessage });
});

router.post('/', (req, res) => {
    const username = req.body.username;
    if (username && username.trim()) {
        let users = getUsers();
        if (!users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
            const newUser = {
                id: uuidv4(),
                username: username
            };
            users.push(newUser);
            saveUsers(users);
            res.redirect('/chat?uuid=' + encodeURIComponent(newUser.id));
        } else {
            res.redirect('/register?error=usernameExists');
        }
    } else {
        res.redirect('/register?error=invalidUsername');
    }
});

module.exports = router;
