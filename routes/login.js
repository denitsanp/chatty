const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');

function getUsers() {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
}

router.post('/login', (req, res) => {
    const { username } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (user) {
        req.session.userId = user.id; 
        res.redirect(`/chat?uuid=${encodeURIComponent(user.id)}`);
    } else {
        res.redirect('/?error=usernameDoesNotExist');
    }
});


module.exports = router;
