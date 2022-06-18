const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const hbs = require('hbs');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/authMiddleware");
const generateAccessToken = require('./public/js/generateAccessToken')

const dburl = `mongodb+srv://admin:admin234@cluster0.knt3h.mongodb.net/?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 5000;

const User = require('./models/User')
const Task = require('./models/Task')
const jwt = require("jsonwebtoken");
const {c} = require("swig/lib/dateformatter");

const { body, validationResult } = require('express-validator')

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


app.post(
    '/api/tasks',
    body('taskName').exists(),
    body('endTime').exists(),
    body('description').exists(),
    authMiddleware,
    (req, res) => {
        const convertedDate = tryConvertDate(req.body.endTime);
        if (!convertedDate) {
            return res
                .status(400)
                .send({message: "can not convert specified date"});
        }
        const taskData = {
            taskName: req.body.taskName,
            endTime: req.body.endTime,
            description: req.body.description
        }
        task = new Task(taskData);
        task.save()
        taskData['_id'] = task._id;

        return res
            .status(200)
            .send(taskData);
    })
app.delete(
    '/api/tasks/:taskId',
    authMiddleware,
    async (req, res) => {
        const user = await getUser(req);
        const taskId = req.params.taskId;
        user.tasks = user.tasks.filter(function(e) { return e.valueOf() != taskId });
        user.tasksDone = user.tasksDone.filter(function(e) { return e.valueOf() != taskId });
        user.save()

        return res
            .status(200)
            .send(user.tasks);
    })
app.patch(
    '/api/tasks/:taskId',
    authMiddleware,
    async (req, res) => {
        const taskId = req.params.taskId;
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

        return res.status(200).send(task);
    })

app.get('/main', authMiddleware, async (req, res) => {
    const user = await getUser(req)
    const avatar = user.avatar;

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

    let donePercent = (taskDoneArray.length / taskArray || 0) * 100;

    if (taskArray.length > 0) {
        taskArray = taskArray.filter((el) => el['endTime'].getTime() >= new Date().getTime());
        taskArray.sort((a, b) => a['endTime'].getTime() >= b['endTime'].getTime() ? 1 : -1);
        const task = taskArray[0]['taskName'];
        const date = taskArray[0]['endTime'].toLocaleString().substring(0, 5);
        const time = taskArray[0]['endTime'].toLocaleString().substring(12, 17);
        res.render('main', {
            deadline: [task, date, time].join(', '),
            percent: donePercent * 100,
            username: user.username,
            avatar: avatar? avatar : "images/avatar.png"
        });
    }
    else res.render('main', {
        deadline: 'нет заданий',
        percent: donePercent * 100,
        username: user.username,
        avatar: avatar? avatar : "images/avatar.png"});
});


app.get('/account', authMiddleware, async (req, res) => {
    const user = await getUser(req)
    const avatar = user.avatar;
    let roleValue = 'user';
    let roleName = 'Не выбрано';
    if (user.roles.includes('STUDENT')) {
        roleValue='student';
        roleName='Студент';
    } else if (user.roles.includes('TEACHER')) {
        roleValue='teacher';
        roleName='Преподаватель';
    }

    res.render('account', {
        username: user.username,
        name: user.name,
        surname: user.surname,
        value: roleValue,
        status: roleName,
        group: user.group,
        avatar: avatar? avatar :  "images/avatar.png"});
});

app.post('/account', [authMiddleware, upload.single('avatar')], async (req, res) => {
    const token = req.cookies.sessionId;
    const {id: userId} = jwt.verify(token, 'secret');
    const currentUser = await User.findById(userId);
    currentUser.name = req.body.name;
    currentUser.surname = req.body.surname;
    const newRole = req.body.role.toUpperCase();
    const inverseRoles = {'STUDENT': 'TEACHER', 'TEACHER':'STUDENT'}
    if (currentUser.roles.includes(inverseRoles[newRole])) {
        currentUser.roles[currentUser.roles.length - 1] = newRole
    } else if(!currentUser.roles.includes(newRole)){
        currentUser.roles.push(newRole);
    }


    currentUser.group = req.body.studentGroup;
    currentUser.avatar = req.body.avatar;

    const newToken = generateAccessToken(currentUser._id, currentUser.roles, currentUser.username)
    await currentUser.save();

    res.cookie('sessionId', newToken, { maxAge: 900000, httpOnly: true });
    res.redirect('main');
})

app.get('/schedule', authMiddleware, async (req, res) => {
    const user = await getUser(req)
    const avatar = user.avatar

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
            if (tasksNoDateDone.filter(e => e._id.equals(tempTask._id)).length === 0) {
                tasksNoDate.push(await render('./views/taskModel.hbs',
                    {id: `nd${noDateIndexer}`, taskName: tempTask.taskName}))
                let tempModal = await render('./views/modalNoTime.hbs',
                    {id: `nd${noDateIndexer}`, taskName: tempTask.taskName,
                        taskDescription: tempTask.description});
                modals.push(tempModal);

                noDateIndexer += 1
            }
            continue;
        }
        taskArray.push(tempTask)
    }
    taskArray.sort((a, b) => a['endTime'].getTime() >= b['endTime'].getTime() ? 1 : -1);

    let params = { username: user.username }

    // if (user.name && user.surname) {
    //     params.username = `${user.name}<br>${user.surname}`
    // }

    params['tasksNoTime'] = await render('./views/tasks.hbs',
        {tasks: tasksNoDate.join('\n'),
            tasksDone: tasksNoDateDoneHTML.join('\n')});

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


                if (taskDoneArray.filter(e => e._id.equals(currTask._id)).length > 0) {
                    // console.log(currTask._id.valueOf())
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
    params['avatar'] = avatar ? avatar: "images/avatar.png"

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
    let first;
    if (curr.getDay() === 0)
        first = curr.getDate() - 6;
    else
        first = curr.getDate() - curr.getDay() + 1;

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

async function getUser(req) {
    const token = req.cookies.sessionId;
    const {id: userId} = jwt.verify(token, 'secret');

    return await User.findById(userId)
}

function updateTask(task, endTime, description, taskName) {
    if (description) {
        task.description = description;
    }

    if (taskName) {
        task.taskName = taskName;
    }

    if (endTime) {
        task.endTime = endTime
    }

    task.save();
}

function tryConvertDate(date) {
    let convertedDate;
    try {
        convertedDate = Date.parse(date);
    } catch (e) {
        return null;
    }

    return convertedDate;
}

start();
