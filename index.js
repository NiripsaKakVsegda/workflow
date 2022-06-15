const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter')
const dburl = `mongodb+srv://admin:admin234@cluster0.knt3h.mongodb.net/?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

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