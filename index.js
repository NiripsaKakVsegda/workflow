const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');
const hbs = require('hbs');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/authMiddleware");

const dburl = `mongodb+srv://admin:admin234@cluster0.knt3h.mongodb.net/?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 5000;

const User = require('./models/User')
const Task = require('./models/Task')
const jwt = require("jsonwebtoken");

const app = express();

app.use(cookieParser());
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));
app.use(express.urlencoded({ extended: false }))

app.set('views', './views');
app.set('view engine', 'hbs');

app.use(express.json());

app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

app.get('/main', authMiddleware, async (req, res) => {
    const token = req.cookies.sessionId;
    const {id: userId} = jwt.verify(token, 'secret');
    const user = await User.findById(userId);

    let taskArray = [];
    for(let taskId of user.tasks) {
        taskArray.push(await Task.findById(taskId));
    }

    let taskDoneArray = [];
    for(let taskId of user.tasksDone) {
        taskDoneArray.push(await Task.findById(taskId));
    }
    let donePercent = taskDoneArray.length / taskArray.length | 0;

    if (taskArray.length > 0) {
        taskArray = taskArray.filter((el) => el['endTime'].getTime() >= new Date().getTime());
        taskArray.sort((a, b) => a['endTime'].getTime() >= b['endTime'].getTime() ? 1 : -1);
        const task = taskArray[0]['taskName'];
        const date = taskArray[0]['endTime'].toLocaleString().substring(0, 5);
        const time = taskArray[0]['endTime'].toLocaleString().substring(12, 17);
        res.render('main', {deadline: [task, date, time].join(', '), percent: donePercent});
    }
    else res.render('main', {deadline: 'нет заданий', percent: donePercent});
});


app.get('/account', authMiddleware, (req, res) => {
    res.render('account');
});

app.get('/schedule', authMiddleware, async (req, res) => {
    const token = req.cookies.sessionId;
    const {id: userId} = jwt.verify(token, 'secret');
    const user = await User.findById(userId)

    let modals = [];
    let taskArray = [];
    let tasksNoDate = [];
    let tasksNoDateDone = [];
    let noDateIndexer = 0;

    let taskDoneArray = [];
    for(let taskId of user.tasksDone) {
        const tempTask = await Task.findById(taskId);
        if (!tempTask.endTime) {
            tasksNoDateDone.push(await render('./views/taskModelDone.hbs',
                {id: `nd${noDateIndexer}`, taskName: tempTask.taskName}))
            let tempModal = await render('./views/modalNoTime.hbs',
                {id: `nd${noDateIndexer}`, taskName: tempTask.taskName,
                taskDescription: tempTask.description});
            modals.push(tempModal);

            noDateIndexer += 1
            continue;
        }
        taskDoneArray.push(tempTask);
    }
    taskDoneArray.sort((a, b) => a['endTime'].getTime() >= b['endTime'].getTime() ? 1 : -1);

    for(let taskId of user.tasks) {
        const tempTask =await Task.findById(taskId);
        if (!tempTask.endTime) {
            if (!(tempTask in tasksNoDateDone)) {
                tasksNoDate.push(await render('./views/taskModel.hbs',
                    {id: `nd${noDateIndexer}`, taskName: tempTask.taskName}))
                let tempModal = await render('./views/modalNoTime.hbs',
                    {id: `nd${noDateIndexer}`, taskName: tempTask.taskName,
                        taskDescription: tempTask.description});
                modals.push(tempModal);
                console.log(modals)

                noDateIndexer += 1
            }
            continue;
        }
        taskArray.push(tempTask)
    }
    taskArray.sort((a, b) => a['endTime'].getTime() >= b['endTime'].getTime() ? 1 : -1);

    let params = { username: user.username }

    params['tasksNoTime'] = await render('./views/tasks.hbs',
        {tasks: tasksNoDate.join('\n'),
            tasksDone: tasksNoDateDone.join('\n')});

    let weekdays = getWeekdays()
    for (let i = 0; i < 7; i++) {
        let currDay = weekdays[i].toLocaleDateString()
        let currDayTasks = []
        let currDayTasksDone = []


        for(let j = 0; j < taskArray.length; j++) {
            const currTask = taskArray[j];
            const taskParams = {id: `${i}${j}`, taskName: currTask.taskName,
                taskTime: currTask.endTime ? currTask.endTime.getHours() + ':' + currTask.endTime.getMinutes() : ''};

            const modalDate = currDay.substring(0,5) + `, ${currTask.endTime.getHours()}:${currTask.endTime.getMinutes()}`
            const modalParams = {id: `${i}${j}`, taskName: currTask.taskName, date: modalDate,
                taskDescription: currTask.description};

            if (currTask.endTime.toLocaleDateString() === currDay) {
                let tempModal = await render('./views/modalWithTime.hbs', modalParams);
                modals.push(tempModal);

                if (currTask in taskDoneArray) {
                    currDayTasksDone.push(await render('./views/taskModelDone.hbs', taskParams))
                } else {
                    currDayTasks.push(await render('./views/taskModel.hbs', taskParams))
                }
            }

            params[`tasksDay${i}`] = await render('./views/tasks.hbs', {tasks: currDayTasks.join('\n'),
                tasksDone: currDayTasksDone.join('\n')});
        }
    }

    params['taskModals'] = modals.join('\n')

    res.render('scheduler', params);
});

app.use('/auth', authRouter)
const start = async () => {
    try {
        await mongoose.connect(dburl);
        app.listen(PORT, ()=>console.log(`server started on port ${PORT}`));
    } catch(e) {
        console.log(e);
    }
};


function getWeekdays() {
    const curr = new Date;
    const first = curr.getDate() - curr.getDay() + 1;

    let weekdays = [];
    for (let i = 0; i < 7; i++) {
        let weekday = new Date(curr.setDate(first + i));
        weekdays.push(weekday);
    }

    return weekdays;
}

async function render(file, params) {
    const content = await readFile(file, 'utf8');
    const template = hbs.compile(content);

    return template(params);
}

start();
