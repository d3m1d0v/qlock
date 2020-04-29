(function() {
    const UNIT = {
        SECONDS: 'ss',
        MINUTES: 'mm',
        HOURS: 'hh',
    }

    const MS_IN = {
        [UNIT.SECONDS]: 1000,
        [UNIT.MINUTES]: 60 * 1000,
        [UNIT.HOURS]: 60 * 60 * 1000,
    };

    const LIMIT = {
        [UNIT.SECONDS]: 60 * 1000,
        [UNIT.MINUTES]: 60 * 60 * 1000,
        [UNIT.HOURS]: 24 * 60 * 60 * 1000,
    };

    const SIZES = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'custom'];
    const THEMES = ['light', 'dark', 'custom'];

    class Helper {
        /**
        * @param {String} name
        * @param {String} val
        * @param {HTMLElement} [elem]
        */
        static setCssVar(name, val, elem = document.documentElement) {
            elem.style.setProperty(name, val);
        }

        /**
         * @param {Number} value
         * @returns {String}
         */
        static zeroLead(value) {
            return `${value < 10 ? '0' : ''}${value}`;
        }

        /**
         * @param {Date} prev
         * @param {Date} curr
         * @returns {Boolean}
         */
        static isTimeUpdateNeeded(prev, curr) {
            return (
                curr.getSeconds() !== prev.getSeconds() ||
                curr.getMinutes() !== prev.getMinutes() ||
                curr.getHours() !== prev.getHours()
            );
        }

        /**
         * @param {{ size?: String; theme?: String; }} params
         */
        static updateQuery({ size, theme }) {
            const searchParams = new URLSearchParams(window.location.search);

            size && searchParams.set('size', size);
            theme && searchParams.set('theme', theme);

            window.history.replaceState(window.history.state, '', `?${searchParams.toString()}`);
        }
    }

    class Qlock {
        /**
         * @param {HTMLElement} root
         */
        constructor(root) {
            this.root = root;

            this.timeElem = root.querySelector('.qlock__time');

            /** @type {HTMLInputElement} */
            this.sizeSlider = root.querySelector('#qlock-size-slider');

            /** @type {HTMLSelectElement} */
            this.sizeSelect = root.querySelector('#qlock-size');
            /** @type {HTMLSelectElement} */
            this.themeSelect = root.querySelector('#qlock-theme');

            /** @type {HTMLInputElement} */
            this.bgColorPicker = root.querySelector('#qlock-bg-color');
            /** @type {HTMLInputElement} */
            this.hhColorPicker = root.querySelector('#qlock-hh-color');
            /** @type {HTMLInputElement} */
            this.mmColorPicker = root.querySelector('#qlock-mm-color');
            /** @type {HTMLInputElement} */
            this.ssColorPicker = root.querySelector('#qlock-ss-color');

            this.sizeSlider.addEventListener('input', this.onSizeSliderChange);
            this.sizeSlider.addEventListener('change', this.onSizeSliderChange);

            this.sizeSelect.addEventListener('change', this.onSizeSelectChange);
            this.themeSelect.addEventListener('change', this.onThemeSelectChange);

            this.bgColorPicker.addEventListener('input', this.onBgColorPickerChange);
            this.hhColorPicker.addEventListener('input', this.onHhColorPickerChange);
            this.mmColorPicker.addEventListener('input', this.onMmColorPickerChange);
            this.ssColorPicker.addEventListener('input', this.onSsColorPickerChange);

            this.bgColorPicker.addEventListener('change', this.onBgColorPickerChange);
            this.hhColorPicker.addEventListener('change', this.onHhColorPickerChange);
            this.mmColorPicker.addEventListener('change', this.onMmColorPickerChange);
            this.ssColorPicker.addEventListener('change', this.onSsColorPickerChange);

            this.init();
        }

        init() {
            const query = new URLSearchParams(window.location.search);
            const querySize = query.get('size');
            const queryTheme = query.get('theme');

            const size = SIZES.includes(querySize) ? querySize : 'm';
            const theme = THEMES.includes(queryTheme) ? queryTheme : 'light';

            this.sizeSelect.value = size;
            this.themeSelect.value = theme;

            this.updateSize(size);
            this.updateTheme(theme);

            this.updateCustomSizeValue(this.sizeSlider.value);

            [
                ['bg', this.bgColorPicker],
                ['hh', this.hhColorPicker],
                ['mm', this.mmColorPicker],
                ['ss', this.ssColorPicker],
            ].forEach(([type, picker]) => this.updateCustomColorValue(type, picker.value));

            this.force();
        }

        force() {
            const date = new Date();

            this.prevDate = date;

            this.updateTime(date);
            this.updateProgress(date);
        }

        tick = () => {
            const date = new Date();

            this.updateProgress(date);

            if (Helper.isTimeUpdateNeeded(this.prevDate, date)) {
                this.updateTime(date);
            }

            this.prevDate = date;
        };

        /**
         * @param {Date} date
         */
        updateTime(date) {
            const hh = Helper.zeroLead(date.getHours());
            const mm = Helper.zeroLead(date.getMinutes());
            const ss = Helper.zeroLead(date.getSeconds());

            this.timeElem.textContent = `${hh}:${mm}:${ss}`;
        }

        /**
         * @param {Date} date
         */
        updateProgress(date) {
            const ms = date.getMilliseconds();
            const ss = date.getSeconds();
            const mm = date.getMinutes();
            const hh = date.getHours();

            const ssInMs = ss * MS_IN[UNIT.SECONDS] + ms;
            const mmInMs = mm * MS_IN[UNIT.MINUTES] + ssInMs;
            const hhInMs = hh * MS_IN[UNIT.HOURS] + mmInMs;

            [
                [UNIT.SECONDS, ssInMs],
                [UNIT.MINUTES, mmInMs],
                [UNIT.HOURS, hhInMs],
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

                Helper.setCssVar(`--qlock-${type}-left-angle`, `${leftAngle}deg`, this.root);
                Helper.setCssVar(`--qlock-${type}-right-angle`, `${rightAngle}deg`, this.root);
            });
        }

        /**
         * @param {String} mod
         * @param {String} val
         */
        updateMod(mod, val) {
            const { root } = this;

            const modCns = root.className.split(' ').filter(cn => cn.startsWith(`qlock_${mod}`));
            root.classList.remove(...modCns);

            root.classList.add(`qlock_${mod}_${val}`);
        }

        /**
         * @param {'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl' | 'custom'} size
         */
        updateSize(size) {
            this.updateMod('size', size);
        }

        /**
         * @param {'light' | 'dark' | 'custom'} theme
         */
        updateTheme(theme) {
            this.updateMod('theme', theme);
        }

        /**
         * @param {Number} value
         */
        updateCustomSizeValue(value) {
            Helper.setCssVar('--qlock-custom-size', `${value}vmin`, this.root);
        }

        /**
         * @param {'bg' | 'hh' | 'mm' | 'ss'} type
         * @param {String} color
         */
        updateCustomColorValue(type, color) {
            Helper.setCssVar(`--qlock-${type}-custom-color`, color, this.root);
        }

        onSizeSliderChange = () => this.updateCustomSizeValue(this.sizeSlider.valueAsNumber);

        onSizeSelectChange = () => {
            const size = this.sizeSelect.value;

            this.updateSize(size);
            Helper.updateQuery({ size });
        };

        onThemeSelectChange = () => {
            const theme = this.themeSelect.value;

            this.updateTheme(theme);
            Helper.updateQuery({ theme });
        };

        onBgColorPickerChange = () => this.updateCustomColorValue('bg', this.bgColorPicker.value);
        onHhColorPickerChange = () => this.updateCustomColorValue('hh', this.hhColorPicker.value);
        onMmColorPickerChange = () => this.updateCustomColorValue('mm', this.mmColorPicker.value);
        onSsColorPickerChange = () => this.updateCustomColorValue('ss', this.ssColorPicker.value);
    }

    const qlock = new Qlock(document.querySelector('.qlock'));

    window.qlock = qlock;

    setInterval(qlock.tick, 15);
})();
