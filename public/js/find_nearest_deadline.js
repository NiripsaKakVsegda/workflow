const Task = require("../../models/Task");

async function findNearestDeadlineForUser(user) {
    let taskArray = [];
    for(let taskId of user.tasks) {
        const tempTask = await Task.findById(taskId);
        if (tempTask.endTime)
            taskArray.push(tempTask);
    }

    let taskDoneArray = [];
    for(let taskId of user.tasksDone) {
        const tempTask = await Task.findById(taskId);
        if (tempTask.endTime)
            taskDoneArray.push(tempTask);
    }

    const curr = new Date();
    let weekday;
    if (curr.getDay() === 0)
        weekday = 7;
    else weekday = curr.getDay();
    let first = new Date(curr.setDate(curr.getDate() - (weekday - 1))).toISOString().split('T')[0];
    let last = new Date(curr.setDate(curr.getDate() + 8)).toISOString().split('T')[0];

    taskDoneArray = taskDoneArray.filter((el) => first <= el['endTime'].toISOString().split('T')[0]
        & el['endTime'].toISOString().split('T')[0] <= last);
    taskArray = taskArray.filter((el) => first <= el['endTime'].toISOString().split('T')[0]
        & el['endTime'].toISOString().split('T')[0] <= last);

    let donePercent = (taskDoneArray.length / taskArray.length || 0)  * 100;
    taskArray = taskArray.filter((el) => el['endTime'].getTime() >= new Date().getTime());
    taskArray = taskArray.filter((el) => taskDoneArray.filter((e) => e._id.equals(el._id)).length === 0);

    taskArray.sort((a, b) => a['endTime'].getTime() >= b['endTime'].getTime() ? 1 : -1);

    return {donePercent: donePercent, taskArray:taskArray, taskDoneArray:taskDoneArray};
}

module.exports = findNearestDeadlineForUser;