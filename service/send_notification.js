const User = require("../models/User");
const findNearestDeadlineForUser = require("./find_nearest_deadline");
const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');
const formatTime = require("./format_time");

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

            user.taskNotificated.push(currentTask._id)
            await user.save()
        }

        if (tasksText.length > 0) {
            const text =
                `Привет, это Workflow!
                Спешу напомнить про твои задания :)
                
                ${tasksText.join('\n\n')}
                
                Осталось совсем немного, поспеши!
                
                Удачи <3`;

            sendEmail(user.email, text);
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