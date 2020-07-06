var passport = require('passport');
var LocalStragedy = require('passport-local').Strategy;
var User = require('./models/user');
var jwtStrategy = require('passport-jwt').Strategy;
var extractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign and verify tokens
var facebookTokenStratedy = require('passport-facebook-token');

var config = require('./config');

passport.use(new LocalStragedy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
    User.findOne({_id: jwt_payload._id}, (err, user) => {
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

exports.verifyAdmin = (req, res, next) => {
    if(req.user.admin==true){
        next();
    }
    else{
        err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}

exports.facebookPassport = passport.use(new facebookTokenStratedy({
    clientID: config.facebook.cliendId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({facebookId: profile.id}, (err, user) => {
        if(err){
            return done(err, false);
        }
        if(!err && user !== null){
            return done(null, user);
        }
        else{
            user = new User({username: profile.displayName});
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if(err){
                    return done(err, false);
                }
                else{
                    return done(null, user);
                }
            })
        }
    });
}
));