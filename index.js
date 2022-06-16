const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter')
const dburl = `mongodb+srv://admin:admin234@cluster0.knt3h.mongodb.net/?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));
app.use(express.urlencoded({ extended: false }))

app.set('views', './views');
app.set('view engine', 'hbs');

app.use(express.json());

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/main', (req, res) => {
    res.render('main');
});

app.get('/account', (req, res) => {
    res.render('account');
});

app.get('/schedule', (req, res) => {
    res.render('scheduler');
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