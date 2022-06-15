const User = require('./models/User')
const Role = require('./models/Role')

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
            const
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