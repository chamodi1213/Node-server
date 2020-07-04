var passport = require('passport');
var LocalStragedy = require('passport-local').Strategy;
var user = require('./models/user');

passport.use(new LocalStragedy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());