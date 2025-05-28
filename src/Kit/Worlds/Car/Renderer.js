import * as THREE from 'three'
import BaseRenderer from "../Bases/BaseRenderer.js";

export default class Renderer extends BaseRenderer
{
    constructor(context)
    {
        super(context);
        this.context = context;
        this.canvas = context.getCanvas();
        this.sizes = context.getSizes()
        this.scene = context.getScene()
        this.cameraInstance = context.getCameraInstance();

        this.setInstance()
    }

    setInstance()
    {

        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })

        this.instance.toneMapping = THREE.CineonToneMapping
        this.instance.toneMappingExposure = 1.75
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        this.instance.setClearColor('#211d20')
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
        this.context.setRenderer(this);
        this.context.setRendererInstance(this.instance);

    }

    destroy() {
        super.destroy()
    }
}