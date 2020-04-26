const timeElem = document.getElementById('time');

const prepare = val => val < 10 ? `0${val}` : val;

function update() {
    const date = new Date();

    const hh = prepare(date.getHours());
    const mm = prepare(date.getMinutes());
    const ss = prepare(date.getSeconds());

    timeElem.textContent = `${hh}:${mm}:${ss}`;
}

setInterval(update, 10);
