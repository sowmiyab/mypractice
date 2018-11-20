const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash=require('connect-flash');
var expressValidator=require('express-validator');
var expressmessages = require('express-messages');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);
const db = mongoose.connection;

// connecting the Db
const sowmi = require('./modules/mongodb');
const details = require('./modules/detailsdb');

//Load view Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//express message middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
    res.locals.messages=require('express-messages')(req,res);
    next();
});

//express session middleware
app.use(session({
    secret:'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express validator middleware
app.use(expressValidator({
    errorFormatter:function (param,msg,value) {
        var namespace=param.split('.'),
            roor=namespace.shift(),
            formParam=root;
        while(namespace.length){
            formParam+='[' + namespace.shift() + ']';
        }
        return{
            param:formParam,
            msg:msg,
            value:value
        };
    }
}));



//middle ware for body parser
app.use(bodyParser.urlencoded({extended:false}));

//parser application/json
app.use(bodyParser.json());

//passport config
require('./config/passport')(passport);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function (req,res,next) {
    res.locals.user = req.user || null;
    next();
});

app.use(flash());


app.get('/',function(req,res){
    sowmi.find({},function (err,result) {
        
    res.render('index',{title:result});
});
});

app.get('/next',function (req,res) {
   res.render('next'); 
});

app.get('/register',function (req,res) {
    res.render('register');
});
app.get('/details',function (req,res) {
    res.render('form');
});
app.get('/profile',function (req,res) {
    details.find({}, function (err, result) {
        res.render('profile', {details: result});
    });
});

//save profile data
app.post('/details',function (req,res) {


    req.checkBody('UName','Username is required').notEmpty();
    req.checkBody('EMail','Email is required').notEmpty();
    req.checkBody('PW','Password is required').notEmpty();

    let errors = req.validationErrors();
    if(errors){
        res.render('form',{
            title:  ' Add profile',
            errors: errors
        });
    }
    else{
        var db = new details();
        db.UName = req.body.UName;
        db.EMail = req.body.EMail;
        db.PW = req.body.PW;

        db.save(function (err) {
            if(err){
                console.log("err");
            }
            else{
                req.flash('success','Profile Added');
                res.redirect('/profile');
            }
        });
    }

    // console.log(req.body.Uname);
});
app.post('/next',function (req,res) {
    console.log(req.body.Name);
    var db = new sowmi();
    db.name = req.body.Name;
    db.save(function(err){
       if(err){
           console.log("err");
           return;
       }
        else{
           req.flash('success','Your are saved');
           res.redirect('/');
       }
    });
});

//Edit profile page
app.get('/profile/edit/:id',function (req,res) {
    details.findById(req.params.id, function (err,profile) {
        res.render('edit', {
            title:'Edit profile',
            Profile:profile
        });
    });
});

//update profile data
app.post('/profile/edit/:id',function (req,res) {
    var db = {};
    db.UName = req.body.Uname;
    db.EMail = req.body.Email;
    db.PW = req.body.Pw;

    var query={_id:req.params.id};

    details.update(query,db,function (err) {
        if(err){
            console.log("err");
        }
        else{
            req.flash('success','Profile Updated');
            res.redirect('/profile');
        }
    });

});


//Delete profile data
app.get('/delete/:id',function (req,res) {

    var query={_id:req.params.id};

    details.findOneAndDelete(query,function (err) {
        if(err){
            console.log("err");
        }
        else{
            res.redirect('/profile')
        }
    });
});
var users=require('./router/users');
app.use('/users',users);

app.listen(3000, function(){
    console.log('server started on port 3000...');
});

