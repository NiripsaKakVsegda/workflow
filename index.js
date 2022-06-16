const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter')
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

app.get('/main', (req, res) => {
    res.render('main', authMiddleware(req, res));
});


app.get('/account', (req, res) => {
    res.render('account');
});

app.get('/schedule', async (req, res) => {
    const token = req.cookies.sessionId;
    const {id: userId} = jwt.verify(token, 'secret');
    const user = await User.findById(userId)
    let taskArray = new Array();
    for(let taskId of user.tasks) {
        taskArray.push(await Task.findById(taskId))
    }

    res.json(taskArray)
    //res.render('scheduler', authMiddleware(req, res));
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

start();