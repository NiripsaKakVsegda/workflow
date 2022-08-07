const User = require("../models/User");
const findNearestDeadlineForUser = require("./find_nearest_deadline");
const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');
const formatTime = require("./format_time");
const webpush = require('web-push');
//const TelegramBot = require("node-telegram-bot-api");
//const bot = new TelegramBot("5475883590:AAFP098kA9jGiuvxbp6MBeJbeojlfZbopq4", {polling: true});


//storing the keys in variables
const publicVapidKey = 'BOKROPhFFsiRxb5VhtAFq9l02gyeagPjtvjA1GSS7jRsXIiYoJt8awHv-AmcdJoy4JacKhb5UMEFLcL5KMzjTdw';
const privateVapidKey = 'iT-KhLcNfmeI073ulihyWmYABaRLuHUY7RrcGMcbw6Y';

//setting vapid keys details
webpush.setVapidDetails('mailto:workflow@workflow.workflow',publicVapidKey, privateVapidKey);


const transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
}));

async function sendNotification() {
    const users = await User.find();
    for(const user of users) {
        if(!user.notifications) {
            continue;
        }
        const {taskArray: taskArray} = await findNearestDeadlineForUser(user);
        if (taskArray.length === 0) {
            continue;
        }

        let tasksText = [];
        //console.log(user);
        for (let i = 0; i < taskArray.length; i++) {
            const currentTask = taskArray[i];

            const difference = (currentTask.endTime - new Date())/(1000 * 60 * 60);

            if (difference >= user.notificationInterval) {
                break;
            } else if (user.taskNotificated.filter(e => e._id.equals(currentTask._id)).length > 0) {
                continue;
            }

            const deadline = currentTask.endTime.toLocaleString('ru-RU').substring(0, 5) + `, ${formatTime(currentTask.endTime)}`
            const taskText = formatEmailTask(currentTask.taskName, deadline, currentTask.description);
            tasksText.push(taskText);
            console.log(taskText);
            //console.log(taskText);

            //user.taskNotificated.push(currentTask._id);
            //await user.save();
        }

        if (tasksText.length > 0) {
            /*const text =
                `Привет, это Workflow!
                Спешу напомнить про твои задания :)
                
                ${tasksText.join('\n\n')}
                
                Осталось совсем немного, поспеши!
                
                Удачи <3`;
            console.log(text);*/
            if (user.telegramID) await fetch("http://127.0.0.1:1818/send_msg", {
                method: "POST",
                body: JSON.stringify({uid: user.telegramID, msg: tasksText.join('\n\n')}),
                headers: {
                    "content-type": "application/json"
                }
            });
            const payload = JSON.stringify({body: tasksText.join('\n\n')});
            //console.log(payload);
            user.notificationSubscriptions.forEach((s) =>
                webpush.sendNotification(s, payload).catch(err => console.error(err)));
            //sendEmail(user.email, text);
        }
    }
}

function sendEmail(adress, text) {
    const mailOptions = {
        from: "WorkFlow <workflownotificationfiit@gmail.com>",
        to: adress,
        subject: 'Скоро дедлайн',
        text: text
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            console.log(err);
        }
    });
}

function formatEmailTask(taskName, deadline, description) {
    return `Название: ${taskName}
Дедлайн: ${deadline}
Описание: ${description}`;
}

module.exports = sendNotification;