const getUser = require("./get_user");
const findNearestDeadlineForUser = require("./find_nearest_deadline");
async function loadMainPage (req, res) {
    const user = await getUser(req);
    const avatar = user.avatar;

    let {donePercent: donePercent, taskArray:taskArray} = await findNearestDeadlineForUser(user);
    if (taskArray.length > 0) {
        const nearestTask = taskArray[0];
        const task = nearestTask['taskName'];
        const date = nearestTask['endTime'].toLocaleString().substring(0, 5);
        const time = nearestTask['endTime'].toLocaleString().substring(12, 17);
        res.render('main', {
            deadline: [task, date, time].join(', '),
            percent: donePercent,
            username: user.username,
            avatar: avatar? avatar : "images/avatar.png",
            deadlineTaskId: nearestTask._id
        });
    }
    else res.render('main', {
        deadline: 'нет заданий',
        percent: donePercent,
        username: user.username,
        avatar: avatar? avatar : "images/avatar.png"});
}

module.exports = loadMainPage;