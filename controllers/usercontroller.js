const router = require('express').Router();
const User = require('../db').import('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


router.post('/signup', (req,res) => { //POST create new user
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    })
    .then(
        createSuccess = (user) => {
            let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 60*60*24 });

            res.status(200).json({
                user: user,
                sessionToken: token,
                message: 'User Created!'
            });
        },
        createError = (err) => {
            res.status(500).json({ error: err })
        }
    )
});

router.post('/login', (req,res) => { //POST Log in with existing user
    User.findOne({ where: {username: req.body.username }})
    .then(user => {

        if(user) {
            bcrypt.compare(req.body.password, user.password, (err, matches) => {
                if(matches) {
                    let token = jwt.sign({ id: user.id}, process.env.JWT_SECRET, {expiresIn: 60*60*24});

                    res.status(200).json({
                        user: user,
                        sessionToken: token,
                        message: 'User Signed In!'
                    });
                } else {
                    res.status(502).json({ error: "Username or Password did not match!!!"})
                }
            })
        } else {
            res.status(502).json({ error: "Username or Password did not match!!"})
        }
    },
    err => res.status(501).json({ error: "Username or Password did not match!"})
    )
});

module.exports = router;