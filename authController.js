const User = require('./models/User')
const Role = require('./models/Role')
const Task = require('./models/Task')
const bcrypt = require('bcryptjs')

class authController {
    async registration(req, res) {
        try {
            const {username, userEmail, password} = req.body
            const candidate = await User.findOne({username})
            if (candidate) {
                return res.statusCode(400).json({message: 'Пользователь с таким именем уже существует'})
            }
            const emailCandidate = await User.findOne({email: userEmail})
            if (emailCandidate) {
                return res.statusCode(400).json({message: 'Пользователь с такой электронной почтой уже существует'})
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

        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'ошибка входа в систему'})
        }
    }

    async getUsers(req, res) {
        try {
            const candidate = await User.findOne({email:'amagooseoj@mail.ru'})
            if (candidate) {
                res.json('i found u')
            } else {
                res.json('okay boomer')
            }
        } catch (e) {

        }
    }
}

module.exports = new authController();