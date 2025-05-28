export default class EventEmitter {
    constructor() {
        this.callbacks = {};
        this.callbacks.base = {};
    }

    // 监听事件，支持多事件名，支持指定回调上下文
    on(_names, callback, context = null) {
        if (typeof _names === 'undefined' || _names === '') {
            console.warn('wrong names');
            return false;
        }
        if (typeof callback === 'undefined') {
            console.warn('wrong callback');
            return false;
        }

        const names = this.resolveNames(_names);

        names.forEach((_name) => {
            const name = this.resolveName(_name);

            if (!(this.callbacks[name.namespace] instanceof Object))
                this.callbacks[name.namespace] = {};

            if (!(this.callbacks[name.namespace][name.value] instanceof Array))
                this.callbacks[name.namespace][name.value] = [];

            this.callbacks[name.namespace][name.value].push({ callback, context });
        });

        return this;
    }

    // 监听一次事件，触发后自动移除
    once(_names, callback, context = null) {
        if (typeof _names === 'undefined' || _names === '') {
            console.warn('wrong names');
            return false;
        }
        if (typeof callback === 'undefined') {
            console.warn('wrong callback');
            return false;
        }

        const wrapper = (...args) => {
            callback.apply(context, args);
            this.off(_names, wrapper);
        };

        return this.on(_names, wrapper, null);
    }

    // 移除监听，支持按事件名移除全部，或指定回调移除
    off(_names, callback) {
        if (typeof _names === 'undefined' || _names === '') {
            console.warn('wrong name');
            return false;
        }

        const names = this.resolveNames(_names);

        names.forEach((_name) => {
            const name = this.resolveName(_name);

            if (name.namespace !== 'base' && name.value === '') {
                delete this.callbacks[name.namespace];
            } else {
                if (name.namespace === 'base') {
                    for (const namespace in this.callbacks) {
                        if (
                            this.callbacks[namespace] instanceof Object &&
                            this.callbacks[namespace][name.value] instanceof Array
                        ) {
                            if (callback) {
                                this.callbacks[namespace][name.value] = this.callbacks[namespace][name.value].filter(
                                    (cbObj) => cbObj.callback !== callback
                                );
                            } else {
                                delete this.callbacks[namespace][name.value];
                            }

                            if (Object.keys(this.callbacks[namespace]).length === 0) delete this.callbacks[namespace];
                        }
                    }
                } else if (
                    this.callbacks[name.namespace] instanceof Object &&
                    this.callbacks[name.namespace][name.value] instanceof Array
                ) {
                    if (callback) {
                        this.callbacks[name.namespace][name.value] = this.callbacks[name.namespace][name.value].filter(
                            (cbObj) => cbObj.callback !== callback
                        );
                    } else {
                        delete this.callbacks[name.namespace][name.value];
                    }

                    if (Object.keys(this.callbacks[name.namespace]).length === 0) delete this.callbacks[name.namespace];
                }
            }
        });

        return this;
    }

    // 触发事件，支持多事件名，支持参数为数组或非数组
    trigger(_names, _args) {
        if (typeof _names === 'undefined' || _names === '') {
            console.warn('wrong name');
            return false;
        }

        const names = this.resolveNames(_names);
        let finalResult = null;

        names.forEach((_name) => {
            const name = this.resolveName(_name);
            const args = _args instanceof Array ? _args : _args !== undefined ? [_args] : [];

            if (name.namespace === 'base') {
                for (const namespace in this.callbacks) {
                    if (
                        this.callbacks[namespace] instanceof Object &&
                        this.callbacks[namespace][name.value] instanceof Array
                    ) {
                        this.callbacks[namespace][name.value].forEach(({ callback, context }) => {
                            const result = callback.apply(context || this, args);
                            if (finalResult === null) finalResult = result;
                        });
                    }
                }
            } else if (this.callbacks[name.namespace] instanceof Object) {
                if (name.value === '') {
                    console.warn('wrong name');
                    return;
                }

                if (this.callbacks[name.namespace][name.value] instanceof Array) {
                    this.callbacks[name.namespace][name.value].forEach(({ callback, context }) => {
                        const result = callback.apply(context || this, args);
                        if (finalResult === null) finalResult = result;
                    });
                }
            }
        });

        return finalResult;
    }

    // 判断是否存在某事件监听
    has(_name) {
        if (typeof _name === 'undefined' || _name === '') return false;
        const name = this.resolveName(_name);
        return (
            this.callbacks[name.namespace] &&
            this.callbacks[name.namespace][name.value] &&
            this.callbacks[name.namespace][name.value].length > 0
        );
    }

    // 解析事件名字符串，支持逗号、斜杠、空格分隔，去重
    resolveNames(_names) {
        let names = _names;
        names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '');
        names = names.replace(/[,/]+/g, ' ');
        names = names.split(' ').filter(Boolean);
        return [...new Set(names)];
    }

    // 解析单个事件名，拆分命名空间
    resolveName(name) {
        const newName = {};
        const parts = name.split('.');

        newName.original = name;
        newName.value = parts[0];
        newName.namespace = 'base'; // 默认命名空间

        if (parts.length > 1 && parts[1] !== '') {
            newName.namespace = parts[1];
        }

        return newName;
    }
}
