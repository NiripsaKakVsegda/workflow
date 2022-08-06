const getUser = require("./get_user");
async function loadGroupsPage (req, res) {
    const user = await getUser(req);
    const avatar = user.avatar;
    let accept = user.roles.includes('TEACHER') || user.roles.includes('ADMIN');
    res.render('groups', {
        username: user.username,
        avatar: avatar.filename ? "/uploads/" + avatar.filename : "/images/avatar.png",
        access: accept ? 'true' : 'false'
    });
}

module.exports = loadGroupsPage;