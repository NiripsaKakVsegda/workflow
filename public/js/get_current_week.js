function getWeekdays(curr=new Date) {
    curr = new Date(curr);
    let first;
    if (curr.getDay() === 0)
        first = curr.getDate() - 6;
    else
        first = curr.getDate() - curr.getDay() + 1;
    curr.setDate(first);
    let weekdays = [];
    for (let i = 0; i < 7; i++) {
        curr.setDate(curr.getDate() + 1 * (i != 0));
        weekdays.push(new Date(curr));
    }

    return weekdays;
}
