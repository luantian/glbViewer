function debounce(fn, delay = 200) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function throttle(fn, delay = 200) {
    let last = 0;
    return function (...args) {
        const now = Date.now();
        if (now - last >= delay) {
            last = now;
            fn.apply(this, args);
        }
    };
}

export default class EventManager {
    constructor(options = {}) {
        this.capture = options.capture ?? true;
        this.usePointer = options.usePointer ?? true;
        this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        this.listeners = {}; // { type: [{ selector, fn, original, off, options }] }
        this.elementListeners = new WeakMap();
        this.window = window;
        this.boundTypes = new Set();

        this._initDefaultEvents();
    }

    _initDefaultEvents() {
        const base = this.usePointer
            ? ['pointerdown', 'pointermove', 'pointerup']
            : this.isTouch
                ? ['touchstart', 'touchmove', 'touchend']
                : ['mousedown', 'mousemove', 'mouseup'];

        const more = ['resize', 'scroll', 'click', 'keydown', 'keyup', 'orientationchange'];
        [...base, ...more].forEach(e => this._bindNative(e));
    }

    _bindNative(type) {
        if (this.boundTypes.has(type)) return;
        this.boundTypes.add(type);

        window.addEventListener(type, (event) => {
            const handlers = this.listeners[type];
            if (!handlers) return;
            for (const { selector, fn, options } of [...handlers].sort((a, b) => b.priority - a.priority)) {
                try {
                    if (!selector || event.target.closest(selector)) {
                        fn(event, event.target.closest(selector));
                        if (options?.once) options.off();
                    }
                } catch (err) {
                    console.error(`[EventManager] Error in handler for ${type}:`, err);
                }
            }
        }, this.capture);
    }

    on(type, selectorOrFn, maybeFn, options = {}) {
        this._bindNative(type);

        const isDelegated = typeof selectorOrFn === 'string';
        const fn = isDelegated ? maybeFn : selectorOrFn;
        const selector = isDelegated ? selectorOrFn : null;

        if (!this.listeners[type]) this.listeners[type] = [];

        const wrapped = options.debounce
            ? debounce(fn, options.wait || 200)
            : options.throttle
                ? throttle(fn, options.wait || 200)
                : fn;

        const entry = {
            selector,
            fn: wrapped,
            original: fn,
            options,
            priority: options.priority ?? 0,
            off: () => {
                this.off(type, fn, selector);
            }
        };

        options.off = entry.off;

        this.listeners[type].push(entry);

        return entry.off; // 返回解绑函数
    }

    one(type, selectorOrFn, maybeFn, options = {}) {
        return this.on(type, selectorOrFn, maybeFn, { ...options, once: true });
    }

    off(type, fn, selector = null) {
        if (!this.listeners[type]) return;
        this.listeners[type] = this.listeners[type].filter(h =>
            !(h.original === fn && h.selector === selector)
        );
    }

    offAll(type) {
        if (type) {
            delete this.listeners[type];
        } else {
            this.listeners = {};
        }
    }

    emit(type, detail = {}) {
        const event = new CustomEvent(type, { detail });
        window.dispatchEvent(event);
    }

    bind(el, type, fn, options = {}) {
        el.addEventListener(type, fn, this.capture);
        if (!this.elementListeners.has(el)) this.elementListeners.set(el, new Map());
        const map = this.elementListeners.get(el);
        if (!map.has(type)) map.set(type, new Set());
        map.get(type).add(fn);
    }

    unbind(el, type, fn) {
        el.removeEventListener(type, fn, this.capture);
        const map = this.elementListeners.get(el);
        map?.get(type)?.delete(fn);
    }

    destroy() {
        this.boundTypes.forEach(type => {
            window.removeEventListener(type, this.capture);
        });
        this.listeners = {};
        this.elementListeners = new WeakMap();
        this.boundTypes.clear();
    }
}
