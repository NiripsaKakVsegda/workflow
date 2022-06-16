const User = require('./models/User')
const Role = require('./models/Role')
const Task = require('./models/Task')
const jwt = require('jsonwebtoken')

const {validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')

generateAccessToken = (id, roles, username) => {
    const payload = {
        id,
        roles,
        username
    };
    return jwt.sign(payload, 'secret', {expiresIn: "24h"});
}

class authController {
    async registration(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'ошибка при регистрации', errors})
            }
            const {username, email, password, repeatedPassword} = req.body
            const candidate = await User.findOne({username})
            if (candidate) {
                return res.status(400).json({message: 'Пользователь с таким именем уже существует'})
            }
            const emailCandidate = await User.findOne({email: email})
            if (emailCandidate) {
                return res.status(400).json({message: 'Пользователь с такой электронной почтой уже существует'})
            }
            if (password !== repeatedPassword) {
                return res.status(400).json({message:'Пароли должны совпадать'})
            }

            const hashPassword = bcrypt.hashSync(password, 7)
            const userRole = await Role.findOne({value: 'USER'})
            const user = new User({username, email, password: hashPassword, roles: [userRole.value]})
            await user.save()
            res.redirect('/auth/login')
            return
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'ошибка регистрации'})
        }
    }

    async login(req, res) {
        try {
            const {loginField, password} = req.body;
            const user = await User.findOne({username: loginField});
            const email = await User.findOne({email: loginField})
            if (!user  && !email) {
                return res.status(400).json({message: `Пользователь ${username} не найден`})
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
                return res.status(400).json({message: 'Неверный пароль'})
            }
            res.cookie('sessionId', token, { maxAge: 900000, httpOnly: true });
            res.redirect('../main')
            return;
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
}

module.exports = new authController();