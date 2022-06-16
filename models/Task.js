const {Schema, model} = require('mongoose')

const Task = new Schema({
    taskName: {type: String, required: true},
    endTime: {type: Date},
    description: {type: String}
})

//todo

module.exports = model('Task', Task)