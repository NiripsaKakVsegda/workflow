const getUser = require("./get_user");

async function deleteTask(req, res) {
    const user = await getUser(req);
    const taskId = req.params.taskId.slice(1);
    user.tasks = user.tasks.filter(function(e) { return e.valueOf() != taskId });
    user.tasksDone = user.tasksDone.filter(function(e) { return e.valueOf() != taskId });
    user.save();
    res.redirect('/schedule');
}

module.exports = deleteTask;