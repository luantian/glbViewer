import * as THREE from "three";
import gsap from "gsap";

export default class ColorPicker {

    constructor(context) {

        this.name = "ColorPicker";
        this.cnName = "汽车颜色选择UI"
        this.looger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.context = context;

        this.resources = context.getResources();

        this.colors = [
            'rgba(0, 168, 184, 1)', "rgba(94, 90, 56, 1)",'rgba(15, 15, 15, 0.95)', 'rgba(132, 132, 132, 1)', 'rgba(76, 70, 95, 1)',
            'rgba(255, 71, 0, 1)', 'rgba(0, 159, 254, 1)', 'rgba(6, 76, 153, 1)', 'rgba(30, 30, 30, 1)'
        ]

        // this.colors = [
        //     'rgba(248, 248, 246, 0.98)', 'rgba(15, 15, 15, 0.95)', 'rgba(0, 120, 215, 0.9)', 'rgba(80, 80, 80, 0.6)', 'rgba(180, 10, 30, 0.97)',
        //     'rgba(140, 220, 190, 0.85)', 'rgba(170, 150, 110, 0.92)', 'rgba(200, 210, 215, 0.9)'
        // ]

        this.disColorPartNames = [
            'Object_301', 'Object_202', 'Object_217', 'Object_124', 'Object_241', 'Object_85', 'Object_142', 'Object_151', 'Object_184', 'Object_172',
            'Object_175', 'Object_244',
        ];  // 需要手动添加了

        this.disColorParts = [];

        this.itemLineStr = '<div class="__color-item-line"></div>'
        this.act = "ColorPickerClick";
        this.currentColor = this.colors[0];

        this._setColorPickerStyle();
        this._setColorPicker();
        this._queryDisColorParts();
        this._setInitColor();
        this._bindEvent();

    }

    _setColorPicker() {

        const el = document.createElement("div");
        el.setAttribute("class", "__color-picker-wrap");

        let colorStr = '';

        for (let i = 0; i < this.colors.length; i++) {
            colorStr += `<div class="__color-item" data-act="${this.act}" data-color="${ this.colors[i] }" style="background-image: url('/images/bmw/icon/b${i + 1}.webp')"></div>`
        }
        el.innerHTML = `
            <div class="__colors"> ${ colorStr } </div>
        `;

        document.querySelector('#root').appendChild(el);
    }

    _setColorPickerStyle() {
        if (document.getElementById('__color-picker-ui-style')) return;
        const styleEl = document.createElement('style');
        styleEl.id = '__color-picker-ui-style';
        styleEl.textContent = `
            .__color-picker-wrap {
                position: fixed;
                left: 0;
                right: 0;
                bottom: 0;
                height: 6rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .__color-picker-wrap .__colors {
                height: 2.8rem;
                display: flex;
                background-color: #ccc3;
                border-radius: 1.5rem;
            }
            
            .__color-picker-wrap .__colors .__color-item {
                position: relative;
                width: 2rem;
                height: 2rem;
                margin: .5rem;
                border-radius: 50%;
                background-size: 100% 100%;
                background-repeat: no-repeat;
                pointer-events: all;
                cursor: pointer;
            }
            
            .__color-picker-wrap .__colors .__color-item .__color-item-line {
                position: absolute;
                top: -3px;
                left: -3px;
                width: calc(2rem + 6px);
                height: calc(2rem + 6px);
                border-radius: 50%;
                box-shadow: 0 0 0 1px #fff;
            }
            
        `;
        document.head.appendChild(styleEl);
    }

    _bindEvent() {
        const colorsEl = document.querySelector('.__colors');

        window.addEventListener('click', this._onClickColor.bind(this));
    }

    _onClickColor(e) {

        const act = e.target.dataset.act;

        if (act === this.act) {
            const color = e.target.dataset.color;
            document.querySelectorAll('.__color-item').forEach(item => {
                item.innerHTML = '';
            })
            this.currentColor = color;
            e.target.innerHTML = this.itemLineStr;
            this._onSetCarModelColor(this.currentColor);
        }
    }

    _queryDisColorParts() {
        const carModel = this.resources.items.carModel;
        this.looger.important('carModel', carModel)
        carModel.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (this.disColorPartNames.includes(child.name)) {
                    this.disColorParts.push(child);
                }
            }
        });
    }

    _onSetCarModelColor(color) {
        this.looger.important('改变模型颜色', color);
        this.disColorParts.forEach(item => {
            const targetColor = this._reversergbaToColor(color);
            item.material.metalness = 0.1;
            // 动画过渡颜色
            gsap.to(item.material.color, {
                r: targetColor.r,
                g: targetColor.g,
                b: targetColor.b,
                duration: 0.4
            });
        })
    }

    _setInitColor() {
        if (this.colors.length > 0) {
            this._onSetCarModelColor(this.currentColor);
            document.querySelector('.__color-item').innerHTML = this.itemLineStr;
        }
    }

    _reversergbaToColor(rgba) {
        // 提取 rgba 值
        const match = rgba.match(/rgba?\((\d+), (\d+), (\d+), ([\d.]+)\)/);
        const [r, g, b, a] = match.slice(1).map(Number);
        return new THREE.Color(r / 255, g / 255, b / 255);
    }

    destroy() {
        window.removeEventListener('click', this._onClickColor.bind(this));
        document.querySelector('__color-picker-wrap').innerHTML = '';
    }

}
