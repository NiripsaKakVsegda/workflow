require('dotenv').config();

const express = require('express');
const { body } = require('express-validator');

const mongoose = require('mongoose');
const cron = require('node-cron');
const multer  = require('multer');
const cookieParser = require("cookie-parser");

const authRouter = require('./authRouter');

const authMiddleware = require("./middleware/authMiddleware");

const createTask = require('./service/post_task');
const deleteTask = require('./service/delete_task');
const editTask = require('./service/edit_task');
const loadMainPage = require('./service/load_main_page');
const updateTaskProgress = require('./service/update_task_progress');
const loadGroupsPage = require('./service/load_groups_page');
const loadSettingsPage = require('./service/load_settings_page');
const saveSettings = require('./service/save_settings');
const loadAccountPage = require('./service/load_account_page');
const saveAccountInfo = require('./service/save_account_info');
const loadSchedule = require('./service/load_schedule');
const sendNotification = require('./service/send_notification');

const upload = multer({ dest: 'uploads/' });

const dburl = process.env.DBURL;
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cookieParser());
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));
app.use(express.urlencoded({ extended: false }));
app.use('/auth', authRouter);
app.use(express.json());

app.set('views', './views');
app.set('view engine', 'hbs');

app.get('/',
    (req, res) => res.redirect('/auth/login'));

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

app.get('/main',
    authMiddleware,
    loadMainPage);

app.get('/groups',
    authMiddleware,
    loadGroupsPage);

app.get('/settings',
    authMiddleware,
    loadSettingsPage);


app.post('/settings',
    authMiddleware,
    saveSettings);

app.get('/account',
    authMiddleware,
    loadAccountPage);

app.post('/account',
    [authMiddleware, upload.single('avatar')],
    saveAccountInfo);

app.get('/schedule',
    authMiddleware,
    loadSchedule);


const start = async () => {
    try {
        await mongoose.connect(dburl);
        app.listen(PORT, ()=>console.log(`server started on port ${PORT}`));
        cron.schedule('*/10 * * * *', function() {
            sendNotification()
            log('notifications sent')
        });
    } catch(e) {
        console.log(e);
    }
};



start();
