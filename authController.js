const User = require('./models/User')
const Role = require('./models/Role')
const Task = require('./models/Task')
const jwt = require('jsonwebtoken')

const {validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')

const generateAccessToken = require('./public/js/generateAccessToken')

class authController {
    async registration(req, res) {
        try {
            //const errors = validationResult(req)
            // if (!errors.isEmpty()) {
            //     return res.status(400).json({message: 'ошибка при регистрации', errors})
            // }
            const {username, email, password, repeatedPassword} = req.body
            for (let char of [' ', '\'', '"', '@']) {
                if (username.indexOf(char) >= 0) {
                    res.render('registration', {visibility: 'visible', text: 'В никнейме нельзя использовать \', \", @ и пробелы'})
                    return //res.status(400).json({message: 'В никнейме нельзя использовать \', \", @ и пробелы', errors})
                }
            }
            const candidate = await User.findOne({username:username})
            if (candidate) {
                res.render('registration', {visibility: 'visible', text: 'Этот никнейм уже занят'})
                return //res.status(400).json({message: 'Пользователь с таким именем уже существует'})
            }
            const emailCandidate = await User.findOne({email: email})
            if (emailCandidate) {
                res.render('registration', {visibility: 'visible', text: 'Эта электронная почта уже занята'})
                return //res.status(400).json({message: 'Пользователь с такой электронной почтой уже существует'})
            }
            if (password.length < 6) {
                res.render('registration', {visibility: 'visible', text: 'Пароль не может быть короче 6 символов'})
                return
            }
            if (password !== repeatedPassword) {
                res.render('registration', {visibility: 'visible', text: 'Пароли должны совпадать'})
                return //res.status(400).json({message:'Пароли должны совпадать'})
            }

            const hashPassword = bcrypt.hashSync(password, 7)
            const userRole = await Role.findOne({value: 'USER'})
            const user = new User({username, email, password: hashPassword, roles: [userRole.value]})
            await user.save()
            res.redirect('/auth/login')
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'ошибка регистрации'})
        }
    }

    async login(req, res) {
        try {
            const {loginField, password} = req.body;
            const user = await User.findOne({username: loginField.trim()});
            const email = await User.findOne({email: loginField})
            if (!user  && !email) {
                res.render('login', {visibility: 'visible', text: `Пользователь ${loginField.trim()} не найден`})
                return //res.status(400).json({message: `Пользователь ${loginField.trim()} не найден`})
            }
            let validPassword;
            let token;

            if (user) {
                validPassword = bcrypt.compareSync(password, user.password)
                token = generateAccessToken(user._id, user.roles, user.username)
            } else {
                validPassword = bcrypt.compareSync(password, email.password)
                token = generateAccessToken(email._id, email.roles, user.username)
            }

            if (!validPassword) {
                res.render('login', {visibility: 'visible', text: 'Неверный пароль'})
                return // res.status(400).json({message: 'Неверный пароль'})
            }
            res.cookie('sessionId', token, { maxAge: 60 * 60 * 1000, httpOnly: true });
            res.redirect('../main')
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'ошибка входа в систему'})
        }
    }

    async getUsers(req, res) {
        try {
            const users = await User.find()
            res.json(users)
        } catch (e) {
            console.log(e)
        }
    }

    async getTask(req, res) {
        try {
            const token = req.cookies.sessionId;
            const {id: userId} = jwt.verify(token, 'secret')
            const user = await User.findById(userId)
            const newTask = await Task.findById('62ae685d11e0fd50d09c49d8')

            user.tasks.push(newTask)

            await user.save()
            res.send('ok')
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = new authController();