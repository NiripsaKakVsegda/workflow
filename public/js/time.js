let datetime = new Date().toLocaleString();
document.getElementById("time").textContent = datetime.substring(0, datetime.length - 3);

function refreshTime() {
    const timeDisplay = document.getElementById("time");
    let a = new Date().toLocaleString();
    timeDisplay.textContent = a.substring(0, a.length - 3);
}
setInterval(refreshTime, 1000);