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

    const SIZES = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'custom'];
    const THEMES = ['light', 'dark', 'custom'];

    const [qlockElem] = document.getElementsByClassName('qlock');

    /** @type {HTMLSelectElement} */
    const sizeSelect = document.getElementById('qlock-size');
    /** @type {HTMLInputElement} */
    const sizeSlider = document.getElementById('qlock-size-slider');
    /** @type {HTMLSelectElement} */
    const themeSelect = document.getElementById('qlock-theme');

    /** @type {HTMLInputElement} */
    const bgColorPicker = document.getElementById('qlock-bg-color');
    /** @type {HTMLInputElement} */
    const hhColorPicker = document.getElementById('qlock-hh-color');
    /** @type {HTMLInputElement} */
    const mmColorPicker = document.getElementById('qlock-mm-color');
    /** @type {HTMLInputElement} */
    const ssColorPicker = document.getElementById('qlock-ss-color');

    const timeElem = document.getElementById('time');
    const prepare = val => val < 10 ? `0${val}` : val;

    let prev = new Date();

    /**
     * @param {String} name
     * @param {String} val
     * @param {HTMLElement} [elem]
     */
    function setCssVar(name, val, elem = document.documentElement) {
        elem.style.setProperty(name, val);
    }

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

            setCssVar(`--qlock-${type}-left-angle`, `${leftAngle}deg`);
            setCssVar(`--qlock-${type}-right-angle`, `${rightAngle}deg`);
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

    function updateCustomSize(value) {
        setCssVar('--qlock-custom-size', `${value}vmin`);
    }

    sizeSelect.addEventListener('change', function() {
        const size = this.value;

        updateSize(size);
        updateQuery({ size });
    });

    sizeSlider.addEventListener('change', () => updateCustomSize(sizeSlider.value));
    sizeSlider.addEventListener('input', () => updateCustomSize(sizeSlider.value));

    themeSelect.addEventListener('change', function() {
        const theme = this.value;

        updateTheme(theme);
        updateQuery({ theme });
    });

    /**
     * @param {'bg' | 'hh' | 'mm' | 'ss'} type
     * @param {String} color
     */
    function updateCustomColor(type, color) {
        setCssVar(`--qlock-${type}-custom-color`, color);
    }

    bgColorPicker.addEventListener('change', function() {
        const color = this.value;

        updateCustomColor('bg', color);
    });

    hhColorPicker.addEventListener('change', function() {
        const color = this.value;

        updateCustomColor('hh', color);
    });

    mmColorPicker.addEventListener('change', function() {
        const color = this.value;

        updateCustomColor('mm', color);
    });

    ssColorPicker.addEventListener('change', function() {
        const color = this.value;

        updateCustomColor('ss', color);
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

        updateCustomSize(sizeSlider.value);

        [
            ['bg', bgColorPicker],
            ['hh', hhColorPicker],
            ['mm', mmColorPicker],
            ['ss', ssColorPicker],
        ].forEach(([type, picker]) => updateCustomColor(type, picker.value));
    }

    init();
    setInterval(tick, 10);
})();
