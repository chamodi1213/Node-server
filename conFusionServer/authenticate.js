var passport = require('passport');
var LocalStragedy = require('passport-local').Strategy;
var user = require('./models/user');
var jwtStrategy = require('passport-jwt').Strategy;
var extractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign and verify tokens
var config = require('./config');

passport.use(new LocalStragedy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// create a webtoken
exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

var opts = {
    jwtFromRequest : extractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : config.secretKey
};
console.log("secret key:",opts.secretOrKey);
// passport jwt strategy
exports.jwtPassport = passport.use(new jwtStrategy(opts, (jwt_payload, done)=>{
    console.log("JWT payload: ", jwt_payload);
    user.findOne({_id: jwt_payload._id}, (err, user) => {
        if (err) {
            return done(err, false);
        } else if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));

// verify using passport jwt
exports.verifyUser = passport.authenticate('jwt', {session: false});