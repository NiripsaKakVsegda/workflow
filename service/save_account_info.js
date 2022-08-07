const generateAccessToken = require("../public/js/generate_access_token");
const getUser = require("./get_user");

async function saveAccountInfo (req, res) {
    // console.log(req)
    const currentUser = await getUser(req);
    currentUser.name = req.body.name;
    currentUser.surname = req.body.surname;
    //console.log()


    const newRole = req.body.role.toUpperCase();
    currentUser.roles = ['USER', newRole];
    currentUser.group = req.body.studentGroup;

    if (newRole === 'TEACHER') {
        currentUser.group = '';
    }

    const newToken = generateAccessToken(currentUser._id, currentUser.roles, currentUser.username);
    await currentUser.save();

    res.cookie('sessionId', newToken, { maxAge: 900000, httpOnly: true });
    res.redirect('main');
}

module.exports = saveAccountInfo;