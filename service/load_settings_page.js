const getUser = require("./get_user");
async function loadSettingsPage (req, res) {
    const user = await getUser(req);
    const avatar = user.avatar;
    res.render('settings', {
        username: user.username,
        avatar: avatar.filename ? "/uploads/" + avatar.filename : "/images/avatar.png",
        value: user.notificationInterval,
        checkVal: user.notifications ? `checked='true'`: '',
        tgToken: user.authToken,
        tgID: user.telegramID ? user.telegramID : "Не подключен"
    });
}

module.exports = loadSettingsPage;