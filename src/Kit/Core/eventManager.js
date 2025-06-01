// 防抖函数：延迟执行，直到事件停止触发一定时间
function debounce(fn, delay = 200) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// 节流函数：在指定时间内最多只执行一次
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

// 主事件管理类
export default class EventManager {
    constructor(options = {}) {
        // 是否使用事件捕获（默认为 true）
        this.capture = options.capture ?? true;

        // 是否使用 Pointer 事件（默认为 true）
        this.usePointer = options.usePointer ?? true;

        // 是否为触摸设备
        this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // 所有事件监听器缓存
        this.listeners = {}; // { type: [{ selector, fn, original, off, options }] }

        // 元素绑定的监听器缓存，用于解绑
        this.elementListeners = new WeakMap();

        this.window = window;

        // 已绑定的事件类型集合
        this.boundTypes = new Set();

        // 初始化默认监听的事件类型
        this._initDefaultEvents();
    }

    // 初始化默认监听的事件类型
    _initDefaultEvents() {
        // 根据设备支持选择合适的基础事件
        const base = this.usePointer
            ? ['pointerdown', 'pointermove', 'pointerup']
            : this.isTouch
                ? ['touchstart', 'touchmove', 'touchend']
                : ['mousedown', 'mousemove', 'mouseup'];

        // 附加的常规事件
        const more = ['resize', 'scroll', 'click', 'keydown', 'keyup', 'orientationchange'];

        // 绑定所有事件
        [...base, ...more].forEach(e => this._bindNative(e));
    }

    // 绑定原生事件，只绑定一次
    _bindNative(type) {
        if (this.boundTypes.has(type)) return;
        this.boundTypes.add(type);

        window.addEventListener(type, (event) => {
            const handlers = this.listeners[type];
            if (!handlers) return;

            // 根据优先级执行对应的事件处理器
            for (const { selector, fn, options } of [...handlers].sort((a, b) => b.priority - a.priority)) {
                try {
                    // 事件目标是否匹配选择器（若有）
                    if (!selector || event.target.closest(selector)) {
                        fn(event, event.target.closest(selector));

                        // 若配置了 once，则执行完后移除监听器
                        if (options?.once) options.off();
                    }
                } catch (err) {
                    console.error(`[EventManager] Error in handler for ${type}:`, err);
                }
            }
        }, this.capture);
    }

    // 添加事件监听器
    on(type, selectorOrFn, maybeFn, options = {}) {
        const isDelegated = typeof selectorOrFn === 'string';
        const fn = isDelegated ? maybeFn : selectorOrFn;
        const selector = isDelegated ? selectorOrFn : null;

        if (!this.listeners[type]) this.listeners[type] = [];

        // === 新增：支持 direct 模式 ===
        if (options.direct && !selector) {
            // 要求传递绑定元素
            if (!options.element) {
                console.warn(`[EventManager] Missing element for direct event: ${type}`);
                return () => {};
            }

            this.bind(options.element, type, fn, options);
            const off = () => this.unbind(options.element, type, fn);
            return off;
        }

        // 默认绑定方式（事件委托）
        this._bindNative(type);

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

        return entry.off;
    }

    // 只执行一次的事件监听器
    one(type, selectorOrFn, maybeFn, options = {}) {
        return this.on(type, selectorOrFn, maybeFn, { ...options, once: true });
    }

    // 移除指定事件监听器
    off(type, fn, selector = null) {
        if (!this.listeners[type]) return;
        this.listeners[type] = this.listeners[type].filter(h =>
            !(h.original === fn && h.selector === selector)
        );
    }

    // 移除某类或所有事件类型的监听器
    offAll(type) {
        if (type) {
            delete this.listeners[type];
        } else {
            this.listeners = {};
        }
    }

    // 手动触发事件（自定义事件）
    emit(type, detail = {}) {
        const event = new CustomEvent(type, { detail });
        window.dispatchEvent(event);
    }

    // 直接绑定到某个元素
    bind(el, type, fn, options = {}) {
        const config = {
            capture: options.capture ?? false,
            passive: options.passive ?? false,
            once: options.once ?? false
        };

        el.addEventListener(type, fn, config);

        if (!this.elementListeners.has(el)) this.elementListeners.set(el, new Map());
        const map = this.elementListeners.get(el);

        if (!map.has(type)) map.set(type, new Set());
        map.get(type).add(fn);
    }

    // 移除元素上的监听器
    unbind(el, type, fn) {
        el.removeEventListener(type, fn, this.capture);
        const map = this.elementListeners.get(el);
        map?.get(type)?.delete(fn);
    }

    unbindAll(el) {
        const map = this.elementListeners.get(el);
        if (!map) return;

        for (const [type, fns] of map.entries()) {
            fns.forEach(fn => {
                el.removeEventListener(type, fn);
            });
        }

        this.elementListeners.delete(el);
    }

    bindPassive(el, type, fn) {
        this.bind(el, type, fn, { passive: true });
    }

    bindOnce(el, type, fn) {
        this.bind(el, type, fn, { once: true });
    }

    bindCapture(el, type, fn) {
        this.bind(el, type, fn, { capture: true });
    }
    bindPrevent(el, type, fn) {
        const wrapped = (e) => {
            e.preventDefault();
            fn(e);
        };
        this.bind(el, type, wrapped);
    }
    bindStop(el, type, fn) {
        const wrapped = (e) => {
            e.stopPropagation();
            fn(e);
        };
        this.bind(el, type, wrapped);
    }
    bindCombo(el, type, fn, config = {}) {
        const wrapped = (e) => {
            if (config.prevent) e.preventDefault();
            if (config.stop) e.stopPropagation();
            fn(e);
        };
        this.bind(el, type, wrapped, {
            capture: config.capture,
            passive: config.passive,
            once: config.once
        });
    }



    // 销毁所有绑定
    destroy() {
        this.boundTypes.forEach(type => {
            window.removeEventListener(type, this.capture);
        });
        this.listeners = {};
        this.elementListeners = new WeakMap();
        this.boundTypes.clear();
    }
}
