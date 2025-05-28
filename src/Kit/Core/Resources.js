import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import EventEmitter from './EventEmitter.js';

export default class Resources extends EventEmitter {
    /**
     * @param {Array} sources - 初始资源列表 [{ name, type, path, group? }]
     * @param {Object} options - 可选参数（如 dracoPath, defaultGroup）
     */
    constructor(sources = [], options = {}) {
        super();
        this.sources = [...sources];
        this.loaders = {};
        this.items = {}; // 加载完成的资源项
        this.groups = {}; // 按资源组记录资源名
        this.loadedCount = 0;
        this.maxCount = this.sources.length;

        this.options = Object.assign({
            dracoPath: '/draco/',
            defaultGroup: 'default'
        }, options);

        this.loadersMap = {}; // type -> loader function

        this._initLoaders();
        this._initDefaultLoaders();
        this._startLoading();
    }

    _initLoaders() {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(this.options.dracoPath);

        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);

        this.loaders = {
            gltfLoader,
            textureLoader: new THREE.TextureLoader(),
            cubeTextureLoader: new THREE.CubeTextureLoader()
        };
    }

    _initDefaultLoaders() {
        this.registerLoader('gltfModel', (source, onLoad, onProgress, onError) => {
            this.loaders.gltfLoader.load(source.path, onLoad, onProgress, onError);
        });

        this.registerLoader('texture', (source, onLoad, onProgress, onError) => {
            this.loaders.textureLoader.load(source.path, onLoad, onProgress, onError);
        });

        this.registerLoader('cubeTexture', (source, onLoad, _, onError) => {
            this.loaders.cubeTextureLoader.load(source.path, onLoad, undefined, onError);
        });
    }

    /**
     * 注册自定义资源加载器
     * @param {String} type - 资源类型
     * @param {Function} loaderFn - 加载函数 (source, onLoad, onProgress, onError)
     */
    registerLoader(type, loaderFn) {
        this.loadersMap[type] = loaderFn;
    }

    _startLoading() {
        this.trigger('start');
        for (const source of this.sources) {
            this._loadSource(source);
        }
    }

    _loadSource(source) {
        if (!source.path || !source.name) {
            this.trigger('warning', { type: 'invalid', source });
            return;
        }

        if (this.items[source.name]) {
            this.trigger('warning', { type: 'duplicate', source });
            return;
        }

        const loader = this.loadersMap[source.type];
        if (!loader) {
            this.trigger('warning', { type: 'unknown-type', source });
            return;
        }

        const group = source.group || this.options.defaultGroup;
        if (!this.groups[group]) this.groups[group] = [];

        loader(
            source,
            (file) => this._onLoad(source, file, group),
            (xhr) => this._onProgress(source, xhr.loaded / xhr.total),
            (err) => this._onError(source, err)
        );
    }

    _onLoad(source, file, group) {
        this.items[source.name] = file;
        this.groups[group].push(source.name);
        this.loadedCount++;
        this.trigger('progress', this.loadedCount / this.maxCount);

        if (this.loadedCount === this.maxCount) {
            this.trigger('ready');
        }
    }

    _onProgress(source, ratio) {
        this.trigger('resource-progress', {
            name: source.name,
            ratio
        });
    }

    _onError(source, error) {
        this.trigger('error', { source, error });
    }

    /**
     * 动态添加资源并立即加载
     * @param {Object} source - 单个资源配置对象
     */
    add(source) {
        if (!source.path || !source.name) {
            this.trigger('warning', { type: 'invalid', source });
            return;
        }
        this.sources.push(source);
        this.maxCount++;
        this._loadSource(source);
    }

    /**
     * 判断是否所有资源已加载完成
     * @returns {Boolean}
     */
    isReady() {
        return this.loadedCount === this.maxCount;
    }

    /**
     * 释放资源（可按资源组）
     * @param {String|null} group - 要清理的资源组名，传 null 清除所有
     */
    disposeAll(group = null) {
        const names = group ? this.groups[group] || [] : Object.keys(this.items);
        for (const name of names) {
            const item = this.items[name];
            if (item?.dispose) item.dispose();
            delete this.items[name];
        }
        if (group && this.groups[group]) {
            delete this.groups[group];
        }
    }

    onReady(callback) {
        const once = (...args) => {
            callback(...args);
            this.off('ready', once);
        };
        this.on('ready', once);
    }

    onProgress(callback) {
        this.on('progress', callback);
    }

    onError(callback) {
        this.on('error', callback);
    }
}
