var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var mongoose = require('mongoose');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var socketioJwt = require('socketio-jwt');
var cookieParser = require('cookie-parser');
var jwt = require('jwt-simple');

var config = require('./config/database');
var UserRepository = require('./controllers/UserRepository');
var TaskRepository = require('./controllers/TaskRepository');

var port = 80;
server.listen(port);

app.use('/static/resources/inspinia', express.static(__dirname + '/static/resources/inspinia'));
app.use('/views/angular', express.static(__dirname + '/views/angular'));
app.use(cookieParser());

// get req params
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// Use passport package in application
app.use(passport.initialize());

mongoose.connect(config.database);

require('./config/passport')(passport);

app.post('/register', function(req, res) {
    var user = Array();
    user['username'] = req.body.username;
    user['password'] = req.body.password;
    user['email'] = req.body.email;

    UserRepository.addUser(user, function(rv) {
        return res.json(rv);
    });
});

app.post('/authenticate', function(req, res) {
    var credentials = Array();
    credentials['username'] = req.body.username;
    credentials['password'] = req.body.password;

    UserRepository.verifyCredentials(credentials, function(rv) {
        if (rv['success'] === true) {
            res.cookie('token', rv['token'], {
                httpOnly: false
            });
        }
        return res.json(rv);
    });
});

app.get('/deauthenticate', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    res.clearCookie('token');
    res.json({
        success: true,
        msg: 'logged out successfully'
    });
});

app.get('/', function(req, res) {
    if (!req.cookies.token) {
        res.sendFile(__dirname + '/views/html/index.html');
    } else {
        var user = jwt.decode(req.cookies.token, config.secret);
        try {
            UserRepository.getUserByUsername(user.username, function(rv) {
                if (!rv.success || rv.user.password != user.password) {
                    res.sendFile(__dirname + '/views/html/index.html');
                } else {
                    res.redirect('/task_view');
                }
            });
        } catch (e) {
            res.sendFile(__dirname + '/views/html/index.html');
        }

    }
});

app.get('/register', function(req, res) {
    res.sendFile(__dirname + '/views/html/access_page.html');
});

app.get('/user_info', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    var username = req.user.username;
    UserRepository.getUserByUsername(username, function(rv) {
        res.json(rv);
    });
});

app.get('/task', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    UserRepository.getUserByUsername(req.user.username, function(rv) {
        if (rv.success === true) {
            viewer_context = rv.user;
            TaskRepository.getAllUserTasks(viewer_context, function(rc) {
                res.json(rc);
            })
        } else {
            res.json(rv);
        }
    });
});

app.post('/task/:task_guid/done', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    var task_guid = req.params.task_guid;
    UserRepository.getUserByUsername(req.user.username, function(rv) {
        if (rv.success === true) {
            viewer_context = rv.user;
            TaskRepository.markAsDone(task_guid, viewer_context, function(rc) {
                res.json(rc);
            })
        } else {
            res.json(rv);
        }
    });
});

app.post('/task', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    console.log(req.body);
    var task = {};
    task.task_description = req.body.task_description
    task.compleated = false;

    UserRepository.getUserByUsername(req.user.username, function(rv) {
        if (rv.success === true) {
            viewer_context = rv.user;
            TaskRepository.addTask(task, viewer_context, function(rc) {
                res.json(rc);
            });
        } else {
            res.json(rv);
        }
    });
});

app.get('/task_view', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    res.sendFile(__dirname + '/views/html/task-page.html');
});
