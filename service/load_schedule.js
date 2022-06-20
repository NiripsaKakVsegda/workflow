const getUser = require("./get_user");
const Task = require("../models/Task");
const render = require('./render');
const formatTime = require('./format_time');
async function loadSchedule (req, res) {
    const user = await getUser(req);
    const avatar = user.avatar;

    let modals = [];
    let taskArray = [];
    let tasksNoDate = [];
    let tasksNoDateDoneHTML = [];
    let tasksNoDateDone = [];
    let noDateIndexer = 0;

    let taskDoneArray = [];
    for(let taskId of user.tasksDone) {
        const tempTask = await Task.findById(taskId);
        if (!tempTask.endTime) {
            tasksNoDateDone.push(tempTask);
            tasksNoDateDoneHTML.push(await render('./views/taskModelDone.hbs',
                {id: tempTask._id, taskName: tempTask.taskName}));
            let tempModal = await render('./views/preparedModal.hbs',
                {id: tempTask._id, taskName: tempTask.taskName,
                    taskDescription: tempTask.description, date: 'null'});
            modals.push(tempModal);

            noDateIndexer += 1;
            continue;
        }
        taskDoneArray.push(tempTask);
    }
    taskDoneArray.sort((a, b) => a['endTime'].getTime() >= b['endTime'].getTime() ? 1 : -1);

    for(let taskId of user.tasks) {
        const tempTask = await Task.findById(taskId);
        if (!tempTask.endTime) {
            if (tasksNoDateDone.filter(e => e._id.equals(tempTask._id)).length === 0) {
                tasksNoDate.push(await render('./views/taskModel.hbs',
                    {id: taskId.valueOf(), taskName: tempTask.taskName}));
                let tempModal = await render('./views/preparedModal.hbs',
                    {id: taskId.valueOf(), taskName: tempTask.taskName,
                        date: 'null',
                        taskDescription: tempTask.description});
                modals.push(tempModal);

                noDateIndexer += 1;
            }
            continue;
        }
        taskArray.push(tempTask);
    }
    taskArray.sort((a, b) => a['endTime'].getTime() >= b['endTime'].getTime() ? 1 : -1);

    let params = { username: user.username };

    params['tasksNoTime'] = await render('./views/tasks.hbs',
        {tasks: tasksNoDate.join('\n'),
            tasksDone: tasksNoDateDoneHTML.join('\n')});

    let weekdays = getWeekdays();

    for (let k = 0; k < 4; k++) {
        for (let i = 0; i < 7; i++) {
            const weekday = new Date(weekdays[i]);
            const currDate = new Date(weekday.setDate(weekday.getDate() + k*7));
            let currDay = currDate.toLocaleDateString('ru-RU');
            let currDayTasks = [];
            let currDayTasksDone = [];

            for(let j = 0; j < taskArray.length; j++) {
                const currTask = taskArray[j];
                const taskParams = {id: currTask._id.valueOf(), taskName: currTask.taskName,
                    taskTime: currTask.endTime ? formatTime(currTask.endTime) : ''};

                const modalDate = currDay.substring(0,5) + `, ${formatTime(currTask.endTime)}`;
                const modalParams = {id: currTask._id.valueOf(), taskName: currTask.taskName, date: modalDate,
                    taskDescription: currTask.description};

                if (currTask.endTime.toLocaleDateString('ru-RU') === currDay) {
                    let tempModal = await render('./views/preparedModal.hbs', modalParams);
                    modals.push(tempModal);

                    if (taskDoneArray.filter(e => e._id.equals(currTask._id)).length > 0) {
                        currDayTasksDone.push(await render('./views/taskModelDone.hbs', taskParams));
                    } else {
                        currDayTasks.push(await render('./views/taskModel.hbs', taskParams));
                    }
                }

                params[`tasksDay${k}${i}`] = await render('./views/tasks.hbs', {tasks: currDayTasks.join('\n'),
                    tasksDone: currDayTasksDone.join('\n')});
            }
        }
    }

    params['taskModals'] = modals.join('\n');
    params['avatar'] = avatar ? avatar: "images/avatar.png";

    res.render('scheduler', params);
}

function getWeekdays(curr=new Date) {
    curr = new Date(curr);
    let first;
    if (curr.getDay() === 0)
        first = curr.getDate() - 6;
    else
        first = curr.getDate() - curr.getDay() + 1;
    curr.setDate(first);
    let weekdays = [];
    for (let i = 0; i < 7; i++) {
        curr.setDate(curr.getDate() + 1 * (i != 0));
        weekdays.push(new Date(curr));
    }

    return weekdays;
}

module.exports = loadSchedule;