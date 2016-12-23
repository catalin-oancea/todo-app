var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var User = require('../models/user');
var config = require('../config/database');

module.exports = function(passport) {
    var opts = {};
    opts.secretOrKey = config.secret;
    opts.jwtFromRequest = function(req) {
        if (req && req.cookies) {
            return req.cookies['token'];
        }
        return null;
    };

    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        User.findOne({username: jwt_payload.username}, function(err, user) {
            if(err) {
                return done(err, false);
            }
            if(user){
                done(null, user);
            } else {
                done(null, false);
            }
        });
    }));
};
