const jwt = require('jsonwebtoken')
const secret = process.env.SECRET

generateAccessToken = (id, roles, username) => {
    const payload = {
        id,
        roles,
        username
    };
    return jwt.sign(payload, secret, {expiresIn: "24h"});
}

module.exports = generateAccessToken