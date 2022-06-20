const getUser = require("./get_user");
async function saveSettings (req, res) {
    const user = await getUser(req)
    user.notificationInterval = +req.body.dropdown;
    user.notifications = Boolean(req.body.checkbox);
    await user.save();
    res.redirect('/main')
}

module.exports = saveSettings;