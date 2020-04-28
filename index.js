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
    const THEMES = ['light', 'dark'];

    const [qlockElem] = document.getElementsByClassName('qlock');
    /** @type {HTMLSelectElement} */
    const sizeSelect = document.getElementById('qlock-size');
    /** @type {HTMLSelectElement} */
    const themeSelect = document.getElementById('qlock-theme');
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

    function updateQuery({ size, theme }) {
        const searchParams = new URLSearchParams(window.location.search);

        size && searchParams.set('size', size);
        theme && searchParams.set('theme', theme);

        window.history.replaceState(window.history.state, '', `?${searchParams.toString()}`);
    }

    /**
     * @param {String} mod
     * @param {String} val
     */
    function updateMod(mod, val) {
        const modCns = qlockElem.className.split(' ').filter(cn => cn.startsWith(`qlock_${mod}`));
        qlockElem.classList.remove(...modCns);

        qlockElem.classList.add(`qlock_${mod}_${val}`);
    }

    function updateSize(size) {
        updateMod('size', size);
    }

    function updateTheme(theme) {
        updateMod('theme', theme);
    }

    sizeSelect.addEventListener('change', function() {
        const size = this.value;

        updateSize(size);
        updateQuery({ size });
    });

    themeSelect.addEventListener('change', function() {
        const theme = this.value;

        updateTheme(theme);
        updateQuery({ theme });
    });

    function init() {
        const query = new URLSearchParams(window.location.search);
        const querySize = query.get('size');
        const queryTheme = query.get('theme');

        const size = SIZES.includes(querySize) ? querySize : 'm';
        const theme = THEMES.includes(queryTheme) ? queryTheme : 'light';

        sizeSelect.value = size;
        themeSelect.value = theme;

        updateSize(size);
        updateTheme(theme);

        updateTime(prev);
        updateProgress(prev);
    }

    init();
    setInterval(tick, 10);
})();
