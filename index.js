require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');
const cron = require('node-cron');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const hbs = require('hbs');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/authMiddleware");
const generateAccessToken = require('./public/js/generate_access_token');
const getUser = require('./public/js/get_user');
const createTask = require('./public/js/post_task');
const deleteTask = require('./public/js/delete_task');
const editTask = require('./public/js/edit_task');
const loadMainPage = require('./public/js/load_main_page');
const findNearestDeadlineForUser = require('./public/js/find_nearest_deadline');
const updateTaskProgress = require('./public/js/update_task_progress');
const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');
const transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
}));


const dburl = process.env.DBURL;
const PORT = process.env.PORT || 5000;
const jwtSecret = process.env.SECRET;

const User = require('./models/User');
const Task = require('./models/Task');
const jwt = require("jsonwebtoken");

const { body } = require('express-validator');

const app = express();

app.use(cookieParser());
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));
app.use(express.urlencoded({ extended: false }));

app.set('views', './views');
app.set('view engine', 'hbs');

app.use(express.json());

app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

app.post(
    '/api/tasks',
    authMiddleware,
    body('taskName').exists(),
    body('endTime').exists(),
    body('description').exists(),
    createTask);

app.post(
    '/api/tasks/delete/:taskId',
    authMiddleware,
    deleteTask);

app.post(
    '/api/tasks/:taskId',
    authMiddleware,
    editTask);

app.post(
    '/api/tasks/check/:taskId',
    authMiddleware,
    updateTaskProgress);

app.get('/main', authMiddleware, loadMainPage);

app.get('/groups', authMiddleware, async (req, res) => {
    const user = await getUser(req);
    const avatar = user.avatar;
    let accept = user.roles.includes('TEACHER') || user.roles.includes('ADMIN');
    res.render('groups', {
        username: user.username,
        avatar: avatar? avatar : "images/avatar.png",
        access: accept ? 'true' : 'false'
    });
});

app.get('/settings', authMiddleware, async (req, res) => {
    const user = await getUser(req);
    const avatar = user.avatar;
    res.render('settings', {
        username: user.username,
        avatar: avatar? avatar : "images/avatar.png",
    });
});

app.get('/account', authMiddleware, async (req, res) => {
    const user = await getUser(req);
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
    const {id: userId} = jwt.verify(token, jwtSecret);
    const currentUser = await User.findById(userId);
    currentUser.name = req.body.name;
    currentUser.surname = req.body.surname;
    const newRole = req.body.role.toUpperCase();
    const inverseRoles = {'STUDENT': 'TEACHER', 'TEACHER':'STUDENT'};
    if (currentUser.roles.includes(inverseRoles[newRole])) {
        currentUser.roles[currentUser.roles.length - 1] = newRole;
    } else if(!currentUser.roles.includes(newRole)){
        currentUser.roles.push(newRole);
    }

    currentUser.group = req.body.studentGroup;
    currentUser.avatar = req.body.avatar;

    if (newRole==='TEACHER') {
        currentUser.group = '';
    }

    const newToken = generateAccessToken(currentUser._id, currentUser.roles, currentUser.username);
    await currentUser.save();

    res.cookie('sessionId', newToken, { maxAge: 900000, httpOnly: true });
    res.redirect('main');
})

app.get('/schedule', authMiddleware, async (req, res) => {
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
            const currDate = new Date(weekdays[i].setDate(weekdays[i].getDate() + k*7));
            let currDay = currDate.toLocaleDateString();
            let currDayTasks = [];
            let currDayTasksDone = [];

            for(let j = 0; j < taskArray.length; j++) {
                const currTask = taskArray[j];
                const taskParams = {id: currTask._id.valueOf(), taskName: currTask.taskName,
                    taskTime: currTask.endTime ? formatTime(currTask.endTime) : ''};

                const modalDate = currDay.substring(0,5) + `, ${formatTime(currTask.endTime)}`;
                const modalParams = {id: currTask._id.valueOf(), taskName: currTask.taskName, date: modalDate,
                    taskDescription: currTask.description};

                if (currTask.endTime.toLocaleDateString() === currDay) {
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
});

app.use('/auth', authRouter)
const start = async () => {
    try {
        await mongoose.connect(dburl);
        app.listen(PORT, ()=>console.log(`server started on port ${PORT}`));
        cron.schedule('*/10 * * * *', function() {
            sendNotifications()
            log('notifications sent')
        });
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


function sendEmail(adress, text) {
    const mailOptions = {
        from: "WorkFlow <workflownotificationfiit@gmail.com>",
        to: adress,
        subject: 'Скоро дедлайн',
        text: text
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            console.log(err);
        }
    });
}

async function sendNotifications() {
    const users = await User.find();
    for(const user of users) {
        if(!user.notifications) {
            continue;
        }
        const {taskArray: taskArray} = await findNearestDeadlineForUser(user);
        if (taskArray.length === 0) {
            continue;
        }

        let tasksText = [];

        for (let i = 0; i < taskArray.length; i++) {
            const currentTask = taskArray[i];

            const difference = (currentTask.endTime - new Date())/(1000 * 60 * 60);

            if (difference >= user.notificationInterval) {
                break;
            } else if (user.taskNotificated.filter(e => e._id.equals(currentTask._id)).length > 0) {
                continue;
            }

            const deadline = currentTask.endTime.toLocaleString().substring(0, 5) + `, ${formatTime(currentTask.endTime)}`
            const taskText = formatEmailTask(currentTask.taskName, deadline, currentTask.description);
            tasksText.push(taskText)

            user.taskNotificated.push(currentTask._id)
            await user.save()
        }

        if (tasksText.length > 0) {
            const text = `Привет, это Workflow!
Спешу напомнить про твои задания :)

${tasksText.join('\n\n')}

Осталось совсем немного, поспеши!

Удачи <3`;

            sendEmail(user.email, text)
        }
    }
}

function formatTime(date) {
    return date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes();
}


function formatEmailTask(taskName, deadline, description) {
    return `Название: ${taskName}
Дедлайн: ${deadline}
Описание: ${description};
`
}
start();
