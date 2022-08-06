const User = require('./models/User');
const Role = require('./models/Role');

const bcrypt = require('bcryptjs');

const generateAccessToken = require('./public/js/generate_access_token');
const {log} = require("util");

class authController {
    async registration(req, res) {
        try {
            const {username, email, password, repeatedPassword} = req.body;
            for (let char of [' ', '\'', '"', '@']) {
                if (username.indexOf(char) >= 0) {
                    res.render('registration', {visibility: 'visible', text: 'В никнейме нельзя использовать \', \", @ и пробелы'});
                    return;
                }
            }

            const candidate = await User.findOne({username:username});
            if (candidate) {
                res.render('registration', {visibility: 'visible', text: 'Этот никнейм уже занят'});
                return;
            }

            const emailCandidate = await User.findOne({email: email});
            if (emailCandidate) {
                res.render('registration', {visibility: 'visible', text: 'Эта электронная почта уже занята'});
                return;
            }

            if (password.length < 6) {
                res.render('registration', {visibility: 'visible', text: 'Пароль не может быть короче 6 символов'});
                return;
            }

            if (password !== repeatedPassword) {
                res.render('registration', {visibility: 'visible', text: 'Пароли должны совпадать'});
                return;
            }

            const hashPassword = bcrypt.hashSync(password, 7);
            const userRole = await Role.findOne({value: 'USER'});
            const user = new User({username, email, password: hashPassword, roles: [userRole.value]});
            await user.save();
            res.redirect('/auth/login');
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'ошибка регистрации'});
        }
    }

    async login(req, res) {
        try {
            const {loginField, password} = req.body;
            const user = await User.findOne({username: loginField.trim()});
            const email = await User.findOne({email: loginField});

            if (user || email) {
                let validPassword;
                let token;
                if (user) {
                    validPassword = bcrypt.compareSync(password, user.password);
                    token = generateAccessToken(user._id, user.roles, user.username);
                } else {
                    validPassword = bcrypt.compareSync(password, email.password);
                    token = generateAccessToken(email._id, email.roles, email.username);
                }

                if (!validPassword) {
                    res.render('login', {visibility: 'visible', text: 'Неверный пароль'});
                    return;
                }
                res.cookie('sessionId', token, { maxAge: 60 * 60 * 1000, httpOnly: true });
                res.redirect('../main');
            } else {
                res.render('login', {visibility: 'visible', text: `Пользователь ${loginField.trim()} не найден`});
                return;
            }


        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'ошибка входа в систему'});
        }
    }
}

module.exports = new authController();