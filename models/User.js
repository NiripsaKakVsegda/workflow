const {Schema, model} = require('mongoose');

const User = new Schema({
    username: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    roles: [{type: String, ref: 'Role'}],
    tasks: [{type: Schema.Types.ObjectId, ref: 'Task'}],
    tasksDone: [{type: Schema.Types.ObjectId, ref: 'Task'}],
    taskNotificated: [{type: Schema.Types.ObjectId, ref: 'Task'}],
    name: {type:String},
    surname: {type:String},
    group: {type: String},
    avatar: {type: String},
    notifications: {type: Boolean, default:true},
    notificationInterval: {type: Number, default:3},
    notificationSubscriptions: [{type: Object}],
    telegramID: {type: Number},
    authToken: {type: String}
})

module.exports = model('User', User);