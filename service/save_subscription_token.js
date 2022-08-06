const getUser = require("./get_user");
const webpush = require("web-push");
const publicVapidKey = 'BOKROPhFFsiRxb5VhtAFq9l02gyeagPjtvjA1GSS7jRsXIiYoJt8awHv-AmcdJoy4JacKhb5UMEFLcL5KMzjTdw';
const privateVapidKey = 'iT-KhLcNfmeI073ulihyWmYABaRLuHUY7RrcGMcbw6Y';

//setting vapid keys details
webpush.setVapidDetails('mailto:workflow@workflow.workflow',publicVapidKey, privateVapidKey);


async function saveToken (req, res) {
    const user = await getUser(req)
    user.notificationSubscriptions.push(req.body);
    if (user.notificationSubscriptions.length > 5) user.notificationSubscriptions.shift();
    await user.save();
    webpush.sendNotification(req.body, "Вы подписались на уведомления!").catch(err => console.error(err))
    res.status(200).json({message: 'ok'});
}

module.exports = saveToken;