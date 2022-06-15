const {Schema, model} = require('mongoose')

const Task = new Schema({
    taskName: {type: String, required: true},
    username: {type: String, required: true},
    description: {type: String},
    endTime: {type: Date}
})

module.exports = model('Task', Task)