const jwt = require("jsonwebtoken");
const User = require("../models/User");
const jwtSecret = process.env.SECRET;

async function getUser(req) {
    const token = req.cookies.sessionId;
    const {id: userId} = jwt.verify(token, jwtSecret);

    return await User.findById(userId);
}

module.exports = getUser;