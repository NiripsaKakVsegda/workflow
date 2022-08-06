const {Schema, model} = require('mongoose');

const Task = new Schema({
    taskName: {type: String, required: true},
    isUrgent: {type: Boolean, required: true},
    endTime: {type: Date},
    description: {type: String},
    tags: {type: Array}
});

module.exports = model('Task', Task);