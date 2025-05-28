export default class Logger {
    constructor(tag = 'UnnamedLogger') {
        this.tag = tag;
        this.enabled = true;
        this._globalEnabledGetter = null;
    }

    setGlobalEnabledGetter(fn) {
        this._globalEnabledGetter = fn;
    }

    _isEnabled() {
        const globalEnabled = this._globalEnabledGetter ? this._globalEnabledGetter() : true;
        return this.enabled && globalEnabled;
    }

    // 内部打印方法
    _print(label, color, ...args) {
        if (!this._isEnabled()) return;
        console.log(`%c[${this.tag}]%c ${label}`, `color: ${color}; font-weight: bold;`, '', ...args);
    }

    _trace(label, color, ...args) {
        if (!this._isEnabled()) return;
        console.trace(`%c[${this.tag}]%c ${label}`, `color: ${color}; font-weight: bold;`, '', ...args);
    }

    info(...args) {
        this._print('ℹ️', '#007BFF', ...args);
    }

    success(...args) {
        this._print('✅', '#228B22', ...args);
    }

    warn(...args) {
        this._print('⚠️', '#FF7E00', ...args);
    }

    clear(...args) {
        this._print('⚠️资源清理', '#FF7E00', ...args);
    }

    error(...args) {
        this._print('❌', 'red', ...args);
    }

    update(...args) {
        this._print('🔁', '#9900FF', ...args);
    }

    important(...args) {
        this._print('🔥', '#C41E3A', ...args);
    }

    trace(...args) {
        this._trace('🔥', '#C41E3A', ...args)
    }

    group(title) {
        if (this._isEnabled()) console.group(`%c[${this.tag}] ${title}`, 'color: purple; font-weight: bold;');
    }

    groupEnd() {
        if (this._isEnabled()) console.groupEnd();
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}