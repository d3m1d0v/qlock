const isUpdateNeeded = (function() {
    let prev = new Date();

    /**
     * @param {Date} date
     */
    function isUpdateNeeded(date) {
        const needUpdate = (
            date.getSeconds() !== prev.getSeconds() ||
            date.getMinutes() !== prev.getMinutes() ||
            date.getHours() !== prev.getHours()
        );

        needUpdate && (prev = date);

        return needUpdate;
    }

    return isUpdateNeeded;
})();

const update = (function() {
    const timeElem = document.getElementById('time');
    const prepare = val => val < 10 ? `0${val}` : val;

    /**
     * @param {Date} date
     */
    function update(date) {
        const hh = prepare(date.getHours());
        const mm = prepare(date.getMinutes());
        const ss = prepare(date.getSeconds());

        timeElem.textContent = `${hh}:${mm}:${ss}`;

        const angle = ss / 60 * 360;

        document.documentElement.style.setProperty(
            '--qlock-ss-left-angle',
            `${angle <= 180 ? 0 : angle - 180}deg`
        );

        document.documentElement.style.setProperty(
            '--qlock-ss-right-angle',
            `${angle > 180 ? 180 : angle}deg`
        );
    }

    return update;
})();

function tick() {
    const date = new Date();

    if (isUpdateNeeded(date)) {
        update(date);
    }
}

setInterval(tick, 10);
