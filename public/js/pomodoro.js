// Credit: Mateusz Rybczonec

const FULL_DASH_ARRAY = 283;

let TIME_LIMIT = 1500; //1500 300 900
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;

document.getElementById("app").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
    timeLeft
)}</span>
</div>
`;

function start_onclick() {
    document.getElementById('start').disabled = true;
    startTimer(1500, 0);
}


// 25 5 25 5 25 5 25 15
function startTimer(seconds, round) {
    timePassed = 0
    if (round % 2 === 0) {
        document.getElementById('round').textContent = `Раунд ${round / 2 + 1}/4`;
        document.getElementById('work').style.background = '#7EBC89';
        document.getElementById('short').style.background= '#d9d9d9';
    } else if (round === 7) {
        document.getElementById('work').style.background = '#d9d9d9';
        document.getElementById('long').style.background= '#7EBC89';
    } else {
        document.getElementById('work').style.background = '#d9d9d9';
        document.getElementById('short').style.background= '#7EBC89';
    }
    timerInterval = setInterval(() => {
        timePassed = timePassed += 1;
        timeLeft = seconds - timePassed;
        document.getElementById("base-timer-label").innerHTML = formatTime(
            timeLeft
        );
        setCircleDasharray();

        if (timeLeft === 0) {
            clearInterval(timerInterval);
            if (seconds !== 900) {
                TIME_LIMIT = seconds === 300 ? 1500 : round === 6 ? 900 : 300;
                startTimer(seconds === 300 ? 1500 : round === 6 ? 900 : 300, round + 1);
            } else
            {
                TIME_LIMIT = 1500;
                document.getElementById('start').disabled = false;
                document.getElementById('long').style.background= '#d9d9d9';
                document.getElementById('round').textContent = `Раунд 1/4`;
            }
        }
    }, 1000);
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
        seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
}


function calculateTimeFraction() {
    const rawTimeFraction = timeLeft / TIME_LIMIT;
    return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
    const circleDasharray = `${(
        calculateTimeFraction() * FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
    document
        .getElementById("base-timer-path-remaining")
        .setAttribute("stroke-dasharray", circleDasharray);
}