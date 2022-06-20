function formatTime(date) {
    return date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes();
}

module.exports = formatTime;