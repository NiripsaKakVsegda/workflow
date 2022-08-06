const Task = require("../models/Task");

async function findNearestDeadlineForUser(user) {
    let taskArray = [];
    let taskAr = [];
    for(let taskId of user.tasks) {
        const tempTask = await Task.findById(taskId);
        if (tempTask.endTime){
            taskArray.push(tempTask);
            taskAr.push(tempTask);
        }

    }

    let taskDoneArray = [];
    let taskDoneAr = [];
    for(let taskId of user.tasksDone) {
        const tempTask = await Task.findById(taskId);
        if (tempTask.endTime) {
            taskDoneArray.push(tempTask);
            taskDoneAr.push(tempTask);
        }
    }

    const curr = new Date();
    let weekday;
    if (curr.getDay() === 0)
        weekday = 7;
    else weekday = curr.getDay();
    let firstW = new Date(curr.setDate(curr.getDate() - (weekday))).toISOString().split('T')[0];
    let lastW = new Date(curr.setDate(curr.getDate() + 7)).toISOString().split('T')[0];

    let currWeekTaskDoneArray = taskDoneArray.filter((el) => firstW <= el['endTime'].toISOString().split('T')[0]
        & el['endTime'].toISOString().split('T')[0] <= lastW);
    let currWeekTaskArray = taskArray.filter((el) => firstW <= el['endTime'].toISOString().split('T')[0]
        & el['endTime'].toISOString().split('T')[0] <= lastW);

    let donePercentW = (currWeekTaskDoneArray.length / currWeekTaskArray.length || 0)  * 100;
    let donePercentW1 = (taskDoneAr.length / taskAr.length || 0)  * 100;

    taskArray = taskArray.filter((el) => el['endTime'].getTime() >= new Date().getTime());
    taskArray = taskArray.filter((el) => taskDoneArray.filter((e) => e._id.equals(el._id)).length === 0);

    taskArray.sort((a, b) => a['endTime'].getTime() >= b['endTime'].getTime() ? 1 : -1);
    return {donePercentW: donePercentW, taskArray:taskArray, taskDoneArray:taskDoneArray, taskAr:taskAr, taskDoneAr:taskDoneAr, donePercentW1: donePercentW1};
}

module.exports = findNearestDeadlineForUser;