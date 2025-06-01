import * as THREE from 'three';
import Sizes from './Sizes.js';
import Time from './Time.js';
import Debug from './Debug.js';
import Resources from './Resources.js';
import Logger from '../Plugins/Logger.js';
import PluginManager from '../Plugins/PluginManager.js';
import EventEmitter from "./EventEmitter.js";

export default class Context extends EventEmitter {
    constructor({ canvas }) {
        super();
        this.name = 'Context';
        this.cnName = '全局上下文';

        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.sizes = new Sizes();
        this.time = new Time();
        this.debug = new Debug();

        this.camera = null;
        this.cameraInstance = null;
        this.renderer = null;
        this.rendererInstance = null;
        this.orbitControls = null;
        this.updatables = [];
        this.loggerCache = {};
        this.logEnabled = true;

        this.logger = this.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.info('Context 初始化完成');

        // // 全局资源管理器（带日志注入）
        // this.resources = new Resources(sources);

        // 插件管理器
        this.pluginManager = new PluginManager(this);

        this.time.on('tick', ({ delta, elapsed }) => {
            for (const obj of this.updatables) {
                if (typeof obj.tick === 'function') {
                    obj.tick({ delta, elapsed });
                }
            }
        });
    }

    /**
     * 全局日志系统（带 tag 缓存、全局开关）
     */
    getLogger(tag = 'Plugin') {
        if (!this.loggerCache[tag]) {
            const logger = new Logger(tag);
            logger.setGlobalEnabledGetter(() => this.logEnabled);
            this.loggerCache[tag] = logger;
        }
        return this.loggerCache[tag];
    }

    enableLogging() {
        this.logEnabled = true;
    }

    disableLogging() {
        this.logEnabled = false;
    }

    clearLoggers() {
        this.loggerCache = {};
    }

    getPluginManager() {
        return this.pluginManager;
    }

    getCamera() { return this.camera; }
    setCamera(camera) { this.camera = camera; }

    getCameraInstance() { return this.cameraInstance; }
    setCameraInstance(instance) { this.cameraInstance = instance; }

    getOrbitControls() { return this.orbitControls; }
    setOrbitControls(controls) { this.orbitControls = controls; }

    getRenderer() { return this.renderer; }
    setRenderer(renderer) { this.renderer = renderer; }

    getRendererInstance() { return this.rendererInstance; }
    setRendererInstance(instance) { this.rendererInstance = instance; }

    getCanvas() { return this.canvas; }
    getScene() { return this.scene; }
    getSizes() { return this.sizes; }
    getDebug() { return this.debug; }
    getResources() { return this.resources; }
    setResources(resources) { this.resources = resources; }
    getTime() { return this.time; }

    getUpdatables() { return this.updatables; }
    addUpdatable(obj) { this.updatables.push(obj); }
    removeUpdatable(obj) {
        this.updatables = this.updatables.filter(o => o !== obj);
    }
}
