const getUser = require("./get_user");
async function loadAccountPage (req, res){
    const user = await getUser(req);
    const avatar = user.avatar;
    let roleValue = 'user';
    let roleName = 'Не выбрано';
    if (user.roles.includes('STUDENT')) {
        roleValue='student';
        roleName='Студент';
    } else if (user.roles.includes('TEACHER')) {
        roleValue='teacher';
        roleName='Преподаватель';
    }

    res.render('account', {
        username: user.username,
        name: user.name,
        surname: user.surname,
        value: roleValue,
        status: roleName,
        group: user.group,
        avatar: avatar? avatar :  "images/avatar.png"});
}

module.exports = loadAccountPage;