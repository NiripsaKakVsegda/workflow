let datetime = new Date().toLocaleString();
document.getElementById("time").textContent = datetime;

function refreshTime() {
    const timeDisplay = document.getElementById("time");
    timeDisplay.textContent = new Date().toLocaleString();
}
setInterval(refreshTime, 1000);