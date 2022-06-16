const Router = require('express');
const router = new Router();
const {query} = require('express-validator')
const controller = require('./authController')
// const authMiddleware = require('./middleware/authMiddleware')
const roleMiddleware = require('./middleware/roleMiddleware')
const express = require("express");

router.use(express.static('public'))

router.post('/register', [
    query('username',  'Имя пользователя не может быть пустым').notEmpty(),
    query('password', 'Пароль должен быть не меньше 2х символов и не больше 10')
        .isLength({min:3, max:10}),
    query('email', 'Электронная почта должна быть валидна').isEmail()],
    controller.registration);
router.get('/register', (req, res) => res.render('registration'))
router.post('/login', controller.login);
router.get('/users', roleMiddleware(["ADMIN"]),controller.getUsers);

module.exports = router;