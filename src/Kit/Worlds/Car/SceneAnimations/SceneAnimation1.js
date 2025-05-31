import gsap from "gsap";
import * as THREE from "three";
import { CustomWiggle } from 'gsap/CustomWiggle';
import { CustomEase } from 'gsap/CustomEase';
import EnvironmentManager from "../Environment/EnvironmentManager.js";
import ModelManager from "../models/ModelManager.js";
import UiManager from "../ui/UiManager.js";

gsap.registerPlugin(CustomEase);
gsap.registerPlugin(CustomWiggle);
// 创建自定义 wiggle
CustomWiggle.create("carBump", {
    wiggles: 30,
    type: "random", // 或 "random", "uniform"
    amplitudeEase: "power2.inOut"
});

/**
 * 场景动画，只用来处理事件
 */
export default class SceneAnimation1 {
    constructor(context, options) {
        this.name = "SceneAnimation1";
        this.cnName = "场景动画1";

        this.context = context;
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.scene = context.getScene();
        this.rendererInstance = context.getRendererInstance();
        this.resources = context.getResources();
        this.time = context.getTime();
        this.canvas = context.getCanvas();
        this.model = this.resources.items.carModel.scene;
        this.camera = context.getCamera();

        this.uiManager = options.uiManager;
        this.modelManager = options.modelManager;
        this.environmentManager = options.environmentManager;


        this.bindEvents();
        this._bindCustomEvents();

    }


    bindEvents() {
        window.addEventListener('pointerdown', this._mouseDown.bind(this));
        window.addEventListener('pointerup', this._mouseUp.bind(this));
    }

    _bindCustomEvents() {

    }

    _mouseDown() {
        this.camera.zoomStartAnimation();
        this.modelManager.carModel.wheelStartAnimation();
        this.modelManager.carModel.carFrontStartAnimation();
        this.environmentManager.roofRectAreaLight.zoomStartAnimation();
        this.modelManager.floor.hide();
        this.uiManager.colorPicker.show();
        this.uiManager.stateTable.show();
        this.uiManager.topInfo.show();

    }

    _mouseUp() {
        this.camera.zoomStopAnimation();
        this.modelManager.carModel.wheelStopAnimation();
        this.modelManager.carModel.carFrontStopAnimation()
        this.environmentManager.roofRectAreaLight.zoomStopAnimation()
        this.modelManager.floor.show();
        this.uiManager.colorPicker.hide();
        this.uiManager.stateTable.hide();
        this.uiManager.topInfo.hide();
    }


    _tick() {

    }

    destroy() {

        this.time.off('tick', this._tick);
        window.removeEventListener('pointerdown', this._mouseDown);
        window.removeEventListener('pointerup', this._mouseUp);

    }
}

