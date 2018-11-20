const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const flash = require('connect-flash');
const expressmessages = require ('express-messages');
const expressValidator = require ('express-validator');
const bodyParser = require('body-parser');
const session = require ('express-session');

//Bring in user module
let User = require('../modules/user');

//register form
router.get('/register',function (req,res) {
    res.render('register');
});

//login page
router.get('/login',function (req,res) {
    res.render('login');
});

//login process
router.post('/login', function(req,res,next) {

    passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req,res,next);
});


//Register process
router.post('/register',function (req,res) {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const confirm = req.body.confirm;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('username', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Invalid Email').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('confirm', 'Confirm password is required').notEmpty();
    req.checkBody('confirm', 'Password is not matched').equals(req.body.password);


    let errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors
        });
    }
    else {
        let newUser = new User({
            name: name,
            email: email,
            password: password,
            confirm:confirm,
            username:username
        });
        bcrypt.genSalt(10,function (err,salt) {
            bcrypt.hash(newUser.password,salt,function (err,hash) {
                if(err){
                    console.log(err);
                }
                newUser.password =hash;
                newUser.save(function (err) {
                    if (err) {
                        console.log(err);
                    }else {
                        req.flash('success','Registration Successful');
                        res.redirect('/users/login');

                    }
                });
            });

        });
    }
});
// Logout Process
router.get('/logout',function(req,res){
    req.logOut();
    req.flash('success','You are logged out');
    res.redirect('/users/login');
});
module.exports = router;