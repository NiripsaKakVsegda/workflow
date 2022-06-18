const jwt = require('jsonwebtoken')

generateAccessToken = (id, roles, username) => {
    const payload = {
        id,
        roles,
        username
    };
    return jwt.sign(payload, 'secret', {expiresIn: "24h"});
}

module.exports = generateAccessToken