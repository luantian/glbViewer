import * as THREE from "three";
import vertexShader from './shader/verte.glsl'
import fragmentShader from './shader/fragment.glsl'

export default class Loading {
    constructor(context) {
        this.name = 'Loading';
        this.cnName = '等待加载插件'

        this.scene = context.getScene();
        this.sizes = context.getSizes();
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.info('开始实例化')

        this._loadingEl = null;
        this._timer = null;

        this.controls = context.getOrbitControls();
        this.controls.enabled = false;

        this.init()
    }

    init() {
        this.generatePlane()
    }

    generatePlane() {

        this.geometry = new THREE.PlaneGeometry(10, 10, 1);
        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            uniforms: {
                uResolution: new THREE.Uniform(new THREE.Vector2(this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio)),
                uTime: new THREE.Uniform(0),
            }
        });

        this.plane = new THREE.Mesh(this.geometry, this.material);

        this.scene.add(this.plane);

        this._timer = setInterval(() => {
            this.material.uniforms.uTime.value += 0.001;
        }, 1 / 120)

        this._getLoadingElement();

    }

    _getLoadingElement() {
        if (!this._loadingEl) {
            const el = document.createElement('div');
            el.className = '__loading';
            el.style.position = 'fixed';
            el.style.bottom = '0';
            el.style.right = '0';
            el.style.zIndex = '200';
            el.style.pointerEvents = 'none';
            el.style.fontSize = '3em';
            document.body.appendChild(el);
            this._loadingEl = el;
        }
        return this._loadingEl;
    }

    update(value) {
        const str = Math.ceil(value * 100) + '%'
        // this.material.uniforms.uTime.value = value;
        if (this._loadingEl) {
            this._loadingEl.innerHTML = str;
            if (value == 1) {
                setTimeout(() => {
                    this._loadingEl.innerHTML = '';
                    this._loadingEl = null;
                    clearInterval(this._timer);
                }, 10000)
            }
        }
    }

}
