const getUser = require("./get_user");
async function loadPomodoroPage (req, res) {
    const user = await getUser(req);
    const avatar = user.avatar;
    res.render('pomodoro', {
        username: user.username,
        avatar: avatar.filename ? "/uploads/" + avatar.filename : "/images/avatar.png",
        value: user.notificationInterval,
        checkVal: user.notifications ? `checked='true'`: ''
    });
}

module.exports = loadPomodoroPage;