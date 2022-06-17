const Router = require('express');
const router = new Router();
const {check} = require('express-validator')
const controller = require('./authController')
// const authMiddleware = require('./middleware/authMiddleware')
const roleMiddleware = require('./middleware/roleMiddleware')
const express = require("express");

router.use(express.static('public'))

router.post('/register', [
        check('username',  'Имя пользователя не может быть пустым').notEmpty(),
        check('password', 'Пароль должен быть не меньше 3х символов и не больше 15')
            .isLength({min:3, max:15}),
        check('email', 'Электронная почта должна быть валидна').isEmail()],
    controller.registration);
router.get('/register', (req, res) => res.render('registration', {visibility: 'hidden', text: ''}))
router.post('/login', controller.login);
router.get('/login', (req, res) => res.render('login', {visibility: 'hidden', text: ''}))
router.get('/users', roleMiddleware(["ADMIN"]), controller.getUsers);

router.get('/task', controller.getTask);

module.exports = router;