var User = require('../models/user');

var jwt = require('jwt-simple');
var config = require('../config/database');

function UserRepository() { };

/**
* user = ['username' => val, 'email' => val, 'password' => val]
* callback accepts a dictionary
*/
UserRepository.addUser = function (user, callback) {
    if (!user['username'] || !user['password'] || !user['email']) {
        callback({
            success: false,
            msg: 'please pass username, email and password'
        });
    } else {
        User({
            username: user.username,
            password: user.password,
            email: user.email
        }).save(function (err) {
            if (err) {
                callback({
                    success: false,
                    msg: 'username taken / email taken / email format wrong'
                });
            } else {
                callback({
                    success: true,
                    msg: 'user created successfully'
                });
            }
        });
    }
};

/**
* username is the username of the user you are searching for
* callback accepts a dictionary
*/
UserRepository.getUserByUsername = function (username, callback) {
    User.findOne({
        username: username
    }).exec(function (err, user) {
        if (err) {
            callback({
                success: false,
                msg: 'there was an error querying the database'
            });
        }
        if (!user) {
            return callback({
                success: false,
                msg: 'no user with provided username found'
            });
        } else {
            callback({
                success: true,
                user: user
            });
        }
    });
};

/**
* email is the email address of the user you are searching for
* callback accepts a dictionary
*/
UserRepository.getUserByEmail = function (email, callback) {
    User.findOne({
        email: email
    }).exec(function (err, user) {
        if (err) {
            callback({
                success: false,
                msg: 'there was an error querying the database'
            });
        }
        if (!user) {
            return callback({
                success: false,
                msg: 'no user with provided email address found'
            });
        } else {
            callback({
                success: true,
                user: user
            });
        }
    });
};

UserRepository.removeUser = function () {
};

UserRepository.updateUser = function () {
};

/**
* credentials = ['username' => val, 'password' => val]
* callback accepts a dictionary
*/
UserRepository.verifyCredentials = function (credentials, callback) {
    User.findOne({
        username: credentials['username']
    }).exec(function (err, user) {
        if (err) {
            callback({
                success: false,
                msg: 'there was an error querying the database'
            });
        }
        if (!user) {
            return callback({
                success: false,
                msg: 'auth failed'
            });
        } else {
            user.comparePassword(credentials['password'], function (err, isMatch) {
                if (isMatch && !err) {
                    var token = jwt.encode(user, config.secret);
                    callback({
                        success: true,
                        token: token
                    });
                } else {
                    callback({
                        success: false,
                        msg: 'auth failed'
                    });
                }
            });
        }
    });
};

module.exports = UserRepository;
