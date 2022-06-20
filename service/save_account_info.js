const generateAccessToken = require("../public/js/generate_access_token");
const getUser = require("./get_user");

async function saveAccountInfo (req, res) {
    const currentUser = await getUser(req);
    currentUser.name = req.body.name;
    currentUser.surname = req.body.surname;
    const newRole = req.body.role.toUpperCase();
    const inverseRoles = {'STUDENT': 'TEACHER', 'TEACHER':'STUDENT'};
    if (currentUser.roles.includes(inverseRoles[newRole])) {
        currentUser.roles[currentUser.roles.length - 1] = newRole;
    } else if(!currentUser.roles.includes(newRole)){
        currentUser.roles.push(newRole);
    }

    currentUser.group = req.body.studentGroup;
    currentUser.avatar = req.body.avatar;

    if (newRole==='TEACHER') {
        currentUser.group = '';
    }

    const newToken = generateAccessToken(currentUser._id, currentUser.roles, currentUser.username);
    await currentUser.save();

    res.cookie('sessionId', newToken, { maxAge: 900000, httpOnly: true });
    res.redirect('main');
}

module.exports = saveAccountInfo;