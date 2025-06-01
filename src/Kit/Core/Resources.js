import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import EventEmitter from './EventEmitter.js';

export default class Resources extends EventEmitter {
    constructor(sources = [], options = {}) {
        super();
        this.sources = [...sources];
        this.items = {};
        this.groups = {};
        this.loadedCount = 0;
        this.maxCount = this.sources.length;

        this.options = Object.assign({
            dracoPath: '/draco/',
            defaultGroup: 'default'
        }, options);

        this.loaders = {};
        this.loadersMap = {};

        this._initLoaders();
        this._initDefaultLoaders();
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
        this.registerLoader('gltfModel', (source) => {
            return new Promise((resolve, reject) => {
                this.loaders.gltfLoader.load(source.path, resolve, undefined, reject);
            });
        });

        this.registerLoader('texture', (source) => {
            return new Promise((resolve, reject) => {
                this.loaders.textureLoader.load(source.path, resolve, undefined, reject);
            });
        });

        this.registerLoader('cubeTexture', (source) => {
            return new Promise((resolve, reject) => {
                this.loaders.cubeTextureLoader.load(source.path, resolve, undefined, reject);
            });
        });
    }

    registerLoader(type, loaderFn) {
        this.loadersMap[type] = loaderFn;
    }

    async load() {
        this.trigger('start');

        const loadTasks = this.sources.map((source) => this._loadSourceAsync(source));
        await Promise.all(loadTasks);

        this.trigger('ready');
    }

    async _loadSourceAsync(source) {
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

        try {
            const file = await loader(source);
            this.items[source.name] = file;
            this.groups[group].push(source.name);
            this.loadedCount++;
            this.trigger('resource-progress', { name: source.name, ratio: 1 });
            this.trigger('progress', this.loadedCount / this.maxCount);
        } catch (error) {
            this.trigger('error', { source, error });
        }
    }

    isReady() {
        return this.loadedCount === this.maxCount;
    }

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

    async add(source) {
        if (!source.path || !source.name) {
            this.trigger('warning', { type: 'invalid', source });
            return;
        }
        this.sources.push(source);
        this.maxCount++;
        await this._loadSourceAsync(source);
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
