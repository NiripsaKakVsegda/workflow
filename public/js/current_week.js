function getWeekdays() {
    const curr = new Date;
    const first = curr.getDate() - curr.getDay() + 1;

    let weekdays = [];
    for (let i = 0; i < 7; i++) {
        let weekday = new Date(curr.setDate(first + i));
        weekdays.push(weekday);
    }

    return weekdays;
}

