const getUser = require("./get_user");
async function loadSettingsPage (req, res) {
    const user = await getUser(req);
    const avatar = user.avatar;
    res.render('settings', {
        username: user.username,
        avatar: avatar? avatar : "images/avatar.png",
        value: user.notificationInterval,
        checkVal: user.notifications ? `checked='true'`: ''
    });
}

module.exports = loadSettingsPage;