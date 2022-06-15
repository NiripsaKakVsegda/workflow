const User = require('./models/User')
const Role = require('./models/Role')
const Task = require('./models/Task')
const jwt = require('jsonwebtoken')

const {validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')

generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
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
            const {username, email, password} = req.body
            const candidate = await User.findOne({username})
            if (candidate) {
                return res.status(400).json({message: 'Пользователь с таким именем уже существует'})
            }
            const emailCandidate = await User.findOne({email: email})
            if (emailCandidate) {
                return res.status(400).json({message: 'Пользователь с такой электронной почтой уже существует'})
            }
            const hashPassword = bcrypt.hashSync(password, 7)
            const userRole = await Role.findOne({value: 'USER'})
            const user = new User({username, email, password: hashPassword, roles: [userRole.value]})
            await user.save()
            return res.json({message: 'Пользователь успешно зарегистрирован'})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'ошибка регистрации'})
        }
    }

    async login(req, res) {
        try {
            const {username, password} = req.body;
            const user = await User.findOne({username});
            if (!user) {
                return res.status(400).json({message: `Пользователь ${username} не найден`})
            }
            const validPassword = bcrypt.compareSync(password, user.password)
            if (!validPassword) {
                return res.status(400).json({message: 'Неверный пароль'})
            }

            const token = generateAccessToken(user._id, user.roles)
            return res.json({token})
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