(function() {
    const SECONDS = 'ss';
    const MINUTES = 'mm';
    const HOURS = 'hh';

    const MS_IN = {
        [SECONDS]: 1000,
        [MINUTES]: 60 * 1000,
        [HOURS]: 60 * 60 * 1000,
    };

    const LIMIT = {
        [SECONDS]: 60 * 1000,
        [MINUTES]: 60 * 60 * 1000,
        [HOURS]: 24 * 60 * 60 * 1000,
    };

    const SIZES = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'];

    const [qlockElem] = document.getElementsByClassName('qlock');
    /** @type {HTMLSelectElement} */
    const sizeSelect = document.getElementById('qlock-size');
    const timeElem = document.getElementById('time');
    const prepare = val => val < 10 ? `0${val}` : val;

    let prev = new Date();

    /**
     * @param {Date} date
     */
    function isTimeUpdateNeeded(date) {
        const needUpdate = (
            date.getSeconds() !== prev.getSeconds() ||
            date.getMinutes() !== prev.getMinutes() ||
            date.getHours() !== prev.getHours()
        );

        needUpdate && (prev = date);

        return needUpdate;
    }

    /**
     * @param {Date} date
     */
    function updateTime(date) {
        const hh = prepare(date.getHours());
        const mm = prepare(date.getMinutes());
        const ss = prepare(date.getSeconds());

        timeElem.textContent = `${hh}:${mm}:${ss}`;
    }

    /**
     * @param {Date} date
     */
    function updateProgress(date) {
        const ms = date.getMilliseconds();
        const ss = date.getSeconds();
        const mm = date.getMinutes();
        const hh = date.getHours();

        const ssInMs = ss * MS_IN[SECONDS] + ms;
        const mmInMs = mm * MS_IN[MINUTES] + ssInMs;
        const hhInMs = hh * MS_IN[HOURS] + mmInMs;

        [
            [SECONDS, ssInMs],
            [MINUTES, mmInMs],
            [HOURS, hhInMs],
        ].forEach(([type, val]) => {
            const angle = val / LIMIT[type] * 360;

            let leftAngle = 0;
            let rightAngle = 0;

            if (angle <= 180) {
                rightAngle = angle;
            } else {
                leftAngle = angle - 180;
                rightAngle = 180;
            }

            document.documentElement.style.setProperty(`--qlock-${type}-left-angle`, `${leftAngle}deg`);
            document.documentElement.style.setProperty(`--qlock-${type}-right-angle`, `${rightAngle}deg`);
        });
    }

    function tick() {
        const date = new Date();

        updateProgress(date);

        if (isTimeUpdateNeeded(date)) {
            updateTime(date);
        }
    }

    function updateQuery({ size }) {
        const searchParams = new URLSearchParams(window.location.search);

        size && searchParams.set('size', size);

        window.history.replaceState(window.history.state, '', `?${searchParams.toString()}`);
    }

    function updateSize(size) {
        const sizeCns = qlockElem.className.split(' ').filter(cn => cn.startsWith('qlock_size_'));
        qlockElem.classList.remove(...sizeCns);

        qlockElem.classList.add(`qlock_size_${size}`);
    }

    sizeSelect.addEventListener('change', function() {
        const size = this.selectedOptions[0].value;

        updateSize(size);
        updateQuery({ size });
    });

    function init() {
        const querySize = new URLSearchParams(window.location.search).get('size');
        const size = SIZES.includes(querySize) ? querySize : 'm';

        sizeSelect.value = size;
        updateSize(size);

        updateTime(prev);
        updateProgress(prev);
    }

    init();
    setInterval(tick, 10);
})();
