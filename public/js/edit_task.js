const Task = require("../../models/Task");
async function editTask(req, res) {
    const taskId = req.params.taskId.slice(1);
    let task;

    try {
        task = await Task.findById(taskId);
    } catch (e) {
        return res
            .status(400)
            .send({message: 'can not find specified task'});
    }

    let convertedTime;
    try {
        convertedTime = Date.parse(req.body.endTime);
    } catch (e) {
        return res
            .status(400)
            .send({message: 'invalid time'});
    }
    updateTask(task, convertedTime, req.body.description, req.body.taskName);
    res.redirect('/schedule');
}

function updateTask(task, endTime, description, taskName) {
    if (description) {
        task.description = description;
    }
    if (taskName) {
        task.taskName = taskName;
    }
    if (endTime) {
        task.endTime = endTime;
    }
    task.save();
}

module.exports = editTask;