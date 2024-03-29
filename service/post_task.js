const Task = require("../models/Task");
const User = require("../models/User");
const getUser = require('./get_user');

async function createTask(req, res) {
    const convertedDate = tryConvertDate(req.body.endTime);
    if (!convertedDate) {
        return res
            .status(400)
            .send({message: "can not convert specified date"});
    }
    const taskData = {
        taskName: req.body.taskName,
        isUrgent: req.body.isUrgent,
        endTime: req.body.endTime,
        description: req.body.description,
        tags: JSON.parse(req.body.tags)['tags']
    };
    const task = new Task(taskData);
    await task.save();

    taskData['_id'] = task._id;

    const currentUser = await getUser(req);
    if (req.query.groups) {
        const groups = req.query.groups.split(',');
        for(const groupId of groups) {
            const groupUsers = await User.find({group: groupId});
            for (const currentUser of groupUsers) {
                currentUser.tasks.push(taskData['_id']);
                await currentUser.save();
            }
        }
    } else {
        currentUser.tasks.push(taskData['_id']);
        currentUser.save();
    }
    res.redirect('/schedule');
}

function tryConvertDate(date) {
    let convertedDate;
    try {
        convertedDate = new Date(date);
    } catch (e) {
        return null;
    }

    return convertedDate;
}

module.exports = createTask;