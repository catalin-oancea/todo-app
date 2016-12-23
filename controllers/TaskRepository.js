var Task = require('../models/task');
var config = require('../config/database');

var uuid = require('uuid');

function TaskRepository() { };

TaskRepository.addTask = function (task, viewer_context, callback) {
    task.task_guid = uuid.v4();

    if (!task.task_description || !task.task_guid) {
        callback({
            success: false,
            msg: 'please pass all the task details'
        });
    } else {
        Task({
            task_guid: task.task_guid,
            task_description: task.task_description,
            owner_username: viewer_context.username
        }).save(function (err) {
            if (err) {
                callback({
                    success: false,
                    msg: 'something went wong :('
                });
            } else {
                TaskRepository.getTaskByGUID(task.task_guid, function(rc) {
                    if (rc.success == false) {
                        callback({
                            success: false,
                            msg: 'something went wrong'
                        });
                    } else {
                        callback({
                            success: true,
                            task: rc.task
                        });
                    }

                });
            }
        });
    }
};

TaskRepository.getTaskByGUID = function (task_guid, callback) {
    Task.findOne({
        task_guid: task_guid
    }).exec(function (err, task) {
        if (err) {
            callback({
                success: false,
                msg: 'there was an error querying the database'
            });
        }
        if (!task) {
            return callback({
                success: false,
                msg: 'no task found'
            });
        } else {
            callback({
                success: true,
                task: task
            });
        }
    });
};

TaskRepository.getAllUserTasks = function (viewer_context, callback) {
    Task.find({
        owner_username: viewer_context.username,
        compleated: false
    }).exec(function (err, tasks) {
        if (err) {
            callback({
                success: false,
                msg: 'there was an error querying the database'
            });
        }
        if (!tasks) {
            return callback({
                success: false,
                msg: 'no task found'
            });
        } else {
            callback({
                success: true,
                tasks: tasks
            });
        }
    });
};

TaskRepository.markAsDone = function(task_guid, viewer_context, callback) {
    Task.update(
        { task_guid: task_guid, owner_username: viewer_context.username },
        { $set: {'compleated': true}}).exec(function (err) {
            if (err) {
                callback({
                    success: false,
                    msg: 'there was an error querying the database'
                });
            } else {
                callback({
                    success: true,
                    msg: 'task updated successfully'
                });
            }
        });
}


module.exports = TaskRepository;
