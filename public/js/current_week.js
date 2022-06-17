function getWeekdays() {
    const curr = new Date;
    const first = curr.getDate() - curr.getDay();

    let weekdays = new Array;
    for (let i = 0; i < 7; i++) {
        let weekday = new Date(curr.setDate(first + i)).toLocaleString();
        weekdays.push(weekday);
    }

    return weekdays;
}
