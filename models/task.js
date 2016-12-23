var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskSchema = new Schema({
    task_guid: {
        type: String,
        required: true
    },
    task_description: {
        type: String,
        unique: false,
        required: true
    },
    date_added: {
        type: Date,
        default: Date.now
    },
    compleated: {
        type: Boolean,
        default: false
    },
    owner_username: {
        type: String,
        required: true
    }
});


module.exports = mongoose.model('Task', TaskSchema);
