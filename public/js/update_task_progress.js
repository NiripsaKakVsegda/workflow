const getUser = require("./get_user");
const Task = require("../../models/Task");
async function updateTaskProgress (req, res) {
    const taskId = req.params.taskId.slice(1);
    const isDone = req.body.progress === 'true';
    const user = await getUser(req);
    let task;

    try {
        task = await Task.findById(taskId);
    } catch (e) {
        return res
            .status(400)
            .send({message: 'can not find specified task'});
    }

    if (isDone) {
        user.tasksDone.push(task._id);
    } else {
        user.tasksDone = user.tasksDone.filter(function(e) { return e.valueOf() != taskId });
    }
    user.save();
    res.redirect('/schedule');
}

module.exports = updateTaskProgress;