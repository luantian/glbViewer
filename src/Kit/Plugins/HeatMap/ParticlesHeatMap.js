import * as THREE from "three";
import vertexShader from './shader/vertex.glsl';
import fragmentShader from './shader/fragment.glsl';
import EventEmitter from '../../Core/EventEmitter.js';

export default class ParticlesHeatMap extends EventEmitter {
    constructor(context, options) {
        super();
        this.name = 'ParticlesHeatMap';
        this.cnName = '粒子热力图插件';
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);

        this.context = context;
        this.scene = context.getScene();
        this.camera = context.getCamera();
        this.cameraInstance = context.getCameraInstance();
        this.renderer = context.getRenderer();
        this.rendererInstance = context.getRendererInstance();

        this.options = options || {};
        this.data = this.options.data || [];

        this.fieldMap = this.options.fieldMap || {};
        this.tooltipFormatter = this.options.tooltipFormatter || this._defaultTooltipFormatter;

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.pixelSize = 30;
        this._tooltipEl = null;
        this._hoverIndex = -1;

        this._pointerDownHandler = null;
        this._pointerMoveHandler = null;

        this._samplingInterval = this.options.samplingInterval ?? 1000; // default 1000ms
        this._lastUpdateTime = 0;

        this.init();
        this._initTooltipStyle();
        this.bindEvents();

    }

    // 插件钩子函数
    onActivate() {
        this.logger.success('onActivate 插件已经激活钩子函数调用');
    }

    init() {
        this.count = this.data.length;
        const positions = new Float32Array(this.count * 3);
        const temperatures = new Float32Array(this.count);
        this.hoverFlags = new Float32Array(this.count);

        const posField = this.fieldMap.position || 'position';
        const tempField = this.fieldMap.temperature || 'temperature';

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;
            const pos = this.data[i][posField];
            positions[i3] = pos.x;
            positions[i3 + 1] = pos.y;
            positions[i3 + 2] = pos.z;
            temperatures[i] = this.data[i][tempField];
        }

        this.particleGeometry = new THREE.BufferGeometry();
        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particleGeometry.setAttribute('aTemperature', new THREE.BufferAttribute(temperatures, 1));
        this.particleGeometry.setAttribute('aHover', new THREE.BufferAttribute(this.hoverFlags, 1));

        const pixelRatio = this.rendererInstance.getPixelRatio();
        this.particleMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: { uSize: new THREE.Uniform(this.pixelSize * pixelRatio) },
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true
        });

        this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
        this.scene.add(this.particles);
    }

    getState() {
        return {
            data: this.data,
            count: this.count,
            fieldMap: this.fieldMap,
            visible: this.particles?.visible,
            pixelSize: this.pixelSize
        };
    }

    setVisible(visible = true) {
        if (this.particles) this.particles.visible = visible;
    }

    setSize(pixelSize = 30) {
        this.pixelSize = pixelSize;
        const pixelRatio = this.rendererInstance.getPixelRatio();
        if (this.particleMaterial?.uniforms?.uSize) {
            this.particleMaterial.uniforms.uSize.value = pixelSize * pixelRatio;
        }
    }

    bindEvents() {
        const canvas = this.rendererInstance.domElement;
        this._pointerDownHandler = (event) => {
            this._updateMouse(event);
            this._checkClick();
        };
        this._pointerMoveHandler = (event) => {
            this._updateMouse(event);
            this._checkHover();
        };
        canvas.addEventListener('pointerdown', this._pointerDownHandler);
        canvas.addEventListener('pointermove', this._pointerMoveHandler);
    }

    unbindEvents() {
        const canvas = this.rendererInstance?.domElement;
        if (canvas && this._pointerDownHandler && this._pointerMoveHandler) {
            canvas.removeEventListener('pointerdown', this._pointerDownHandler);
            canvas.removeEventListener('pointermove', this._pointerMoveHandler);
        }
        this._pointerDownHandler = null;
        this._pointerMoveHandler = null;
    }

    update(newData = null) {
        const now = Date.now();
        if (now - this._lastUpdateTime < this._samplingInterval) return;

        this.logger.warn('update time', now, this._samplingInterval);

        if (!Array.isArray(newData) || newData.length === 0) {
            this.logger.warn('update 调用时数据为空或格式错误');
            return;
        }

        const sameCount = newData.length === this.count;
        this.data = newData;

        if (sameCount) {
            this._updateAttributes();
        } else {
            this._rebuildGeometry();
        }

        this._lastUpdateTime = now;
    }


    destroy() {
        this.logger.warn('销毁 ParticlesHeatMap');
        this.scene.remove(this.particles);
        this.particleGeometry?.dispose();
        this.particleMaterial?.dispose();
        if (this.particleMaterial?.uniforms?.uSize) {
            this.particleMaterial.uniforms.uSize = null;
        }
        this.unbindEvents();
        this._tooltipEl?.remove();
        this.data = null;
        this.hoverFlags = null;
    }

    reactivate(data = null) {
        this.logger.info('重新激活');
        this.destroy();
        this.data = data || this.options?.data || [];
        this.init();
        this.bindEvents();
    }

    _updateMouse(event) {
        this._ensureDependencies();
        const rect = this.rendererInstance.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    _computeThreshold() {
        const cameraInstance = this.cameraInstance;
        const distance = cameraInstance.position.length();
        const visibleHeight = 2 * Math.tan((cameraInstance.fov * 0.5) * Math.PI / 180) * distance;
        return (this.pixelSize * visibleHeight) / window.innerHeight;
    }

    _checkClick() {
        this._ensureDependencies();
        this.raycaster.setFromCamera(this.mouse, this.cameraInstance);
        this.raycaster.params.Points.threshold = this._computeThreshold();
        const intersects = this.raycaster.intersectObject(this.particles, false);
        if (intersects.length > 0) {
            const intersect = intersects[0];
            if (intersect.distanceToRay > this.raycaster.params.Points.threshold) return;
            const index = intersect.index;
            if (index !== undefined && this.data[index]) {
                const result = {
                    index,
                    data: this.data[index],
                    position: {
                        x: this.particleGeometry.attributes.position.getX(index),
                        y: this.particleGeometry.attributes.position.getY(index),
                        z: this.particleGeometry.attributes.position.getZ(index)
                    }
                };
                this.trigger('pointerdown', result);
            }
        }
    }

    _checkHover() {
        this._ensureDependencies();
        this.raycaster.setFromCamera(this.mouse, this.cameraInstance);
        this.raycaster.params.Points.threshold = this._computeThreshold();
        const intersects = this.raycaster.intersectObject(this.particles, false);
        let newIndex = -1;
        if (intersects.length > 0) newIndex = intersects[0].index;
        this._updateHoverAttribute(newIndex);
        if (newIndex !== -1) {
            const pos = this.particleGeometry.attributes.position;
            const position = {
                x: pos.getX(newIndex),
                y: pos.getY(newIndex),
                z: pos.getZ(newIndex)
            };
            this._showTooltip(position, this.data[newIndex]);
        } else {
            this._hideTooltip();
        }
    }

    _updateHoverAttribute(index) {
        if (this._hoverIndex !== -1) this.hoverFlags[this._hoverIndex] = 0;
        if (index !== -1) this.hoverFlags[index] = 1;
        this._hoverIndex = index;
        this.particleGeometry.attributes.aHover.needsUpdate = true;
    }

    _showTooltip(worldPos, data) {
        const tooltipEl = this._getTooltipElement();
        const vector = new THREE.Vector3(worldPos.x, worldPos.y, worldPos.z);
        vector.project(this.cameraInstance);
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (1 - (vector.y * 0.5 + 0.5)) * window.innerHeight;
        tooltipEl.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
        tooltipEl.innerHTML = this.tooltipFormatter(data);
        tooltipEl.style.display = 'block';
    }

    _hideTooltip() {
        const tooltipEl = this._getTooltipElement();
        tooltipEl.style.display = 'none';
    }

    _getTooltipElement() {
        if (!this._tooltipEl) {
            const el = document.createElement('div');
            el.className = '__particle-tooltip';
            el.style.position = 'fixed';
            el.style.pointerEvents = 'none';
            document.body.appendChild(el);
            this._tooltipEl = el;
        }
        return this._tooltipEl;
    }



    _updateAttributes() {
        const posAttr = this.particleGeometry.attributes.position.array;
        const tempAttr = this.particleGeometry.attributes.aTemperature.array;
        const posField = this.fieldMap.position || 'position';
        const tempField = this.fieldMap.temperature || 'temperature';
        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;
            const pos = this.data[i][posField];
            posAttr[i3] = pos.x;
            posAttr[i3 + 1] = pos.y;
            posAttr[i3 + 2] = pos.z;
            tempAttr[i] = this.data[i][tempField];
            this.hoverFlags[i] = 0;
        }
        this.particleGeometry.attributes.position.needsUpdate = true;
        this.particleGeometry.attributes.aTemperature.needsUpdate = true;
        this.particleGeometry.attributes.aHover.needsUpdate = true;
    }

    _rebuildGeometry() {
        this.scene.remove(this.particles);
        this.particleGeometry.dispose();
        this.init();
    }

    _ensureDependencies() {
        if (!this.mouse) this.mouse = new THREE.Vector2();
        if (!this.raycaster) this.raycaster = new THREE.Raycaster();
    }

    _initTooltipStyle() {
        if (document.getElementById('__particle-tooltip-style')) return;
        const styleEl = document.createElement('style');
        styleEl.id = '__particle-tooltip-style';
        styleEl.textContent = `
            .__particle-tooltip {
                position: fixed;
                background: rgba(0, 0, 0, 0.7);
                color: #fff;
                padding: 6px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 999;
                display: none;
                transition: opacity 0.2s ease;
            }
            .__particles_heat_map {
                background: rgba(255, 255, 255, 0.7);
                font-size: 14px;
                color: #333;
                border-radius: 2px;
                padding: 6px 0;
            }
            .__particles_label {
                font-weight: bold;
                font-size: 16px;
                padding: 2px 10px;
            }
            .__particles_value {
                font-size: 16px;
                padding: 2px 10px;
            }
        `;
        document.head.appendChild(styleEl);
    }


    _defaultTooltipFormatter(data) {
        const label = data?.[this.fieldMap.label] ?? data?.label ?? data?.name ?? "未知";
        const temp = data?.[this.fieldMap.temperature] ?? data?.temperature ?? data?.value ?? "N/A";
        return `
            <div class="__particles_heat_map">
                <div class="__particles_label">${label}</div>
                <div class="__particles_value">温度: ${typeof temp === 'number' ? temp.toFixed(1) : temp}</div>
            </div>
        `;
    }


}
