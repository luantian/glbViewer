import gsap from "gsap";
import { CustomWiggle } from 'gsap/CustomWiggle';
import { CustomEase } from 'gsap/CustomEase';
import EventManager from "../../../Core/EventManager.js";



export default class Scene1 {
    constructor(context, options) {
        this.name = "Scene1";
        this.cnName = "场景动画1";

        this.context = context;
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.scene = context.getScene();
        this.resources = context.getResources();
        this.time = context.getTime();
        this.canvas = context.getCanvas();
        this.model = this.resources.items.carModel.scene;
        this.camera = context.getCamera();

        this.uiManager = options.uiManager;
        this.modelManager = options.modelManager;
        this.environmentManager = options.environmentManager;

        this.eventManager = new EventManager();

        this.enter();

    }

    enter() {
        this._gsapRegister();
        this.bindEvents();

        this.logger.info("进入场景");
    }

    bindEvents() {
        this._mouseDownHandler = this._mouseDown.bind(this);
        this._mouseUpHandler = this._mouseUp.bind(this);
        // this.eventManager.on('pointerdown', this._mouseDownHandler);
        // this.eventManager.on('pointerup', this._mouseUpHandler);

        this.eventManager.bind(window, 'pointerdown', this._mouseDownHandler);
        this.eventManager.bind(window, 'pointerup', this._mouseUpHandler);
        // window.addEventListener('pointerdown', this._mouseDownHandler)
        // window.addEventListener('pointerdown', this._mouseUpHandler)
    }

    _mouseDown() {
        this.camera.zoomStartAnimation();
        this.modelManager.carModel.play('wheelSpin');
        this.modelManager.carModel.play('carFront');
        this.environmentManager.roofRectAreaLight.zoomStartAnimation();
        this.modelManager.floor.hide();
        this.uiManager.colorPicker.show();
        this.uiManager.stateTable.show();
        this.uiManager.topInfo.show();
    }

    _mouseUp() {
        this.camera.zoomStopAnimation();
        this.modelManager.carModel.stop('wheelSpin');
        this.modelManager.carModel.stop('carFront');
        this.environmentManager.roofRectAreaLight.zoomStopAnimation()
        this.modelManager.floor.show();
        this.uiManager.colorPicker.hide();
        this.uiManager.stateTable.hide();
        this.uiManager.topInfo.hide();
    }

    _gsapRegister() {
        gsap.registerPlugin(CustomEase);
        gsap.registerPlugin(CustomWiggle);
        // 创建自定义 wiggle
        CustomWiggle.create("carBump", {
            wiggles: 30,
            type: "random", // 或 "random", "uniform"
            amplitudeEase: "power2.inOut"
        });
    }

    exit() {

    }

    destroy() {

        this.eventManager.unbind(window, 'pointerdown', this._mouseDownHandler);
        this.eventManager.unbind(window, 'pointerup', this._mouseUpHandler);

    }
}

