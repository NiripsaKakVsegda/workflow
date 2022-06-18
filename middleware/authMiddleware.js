const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }
    try {
        const token = req.cookies?.sessionId;
        if(!token) {
            res.redirect('../auth/login');
            return;
        }
        req.user = jwt.verify(token, 'secret');
        next();
    } catch(e) {
        console.log(e);
        return res.status(403).json({message: "Пользователь не авторизован"});
    }
};