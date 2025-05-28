import gsap from "gsap";
import ScrollHandler from "../../../Utils/ScrollHandler.js";


export default class StateTable {
    constructor(context) {

        this.name = "StateTable";
        this.cnName = "汽车切换场景"
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);

        this.stateTables = [
            { label: "BMW" },
            { label: "车身" },
            { label: "风阻" },
            { label: "雷达" },
            { label: "定制" }
        ];
        this.resources = context.getResources();

        this.act = 'StateTableClick'
        this.activeStateIndex = 0;
        this.activeStateColor = 'rgb(255, 146, 69)';

        this._setStateTableStyle();
        this._setStateTable();
        this.stateEls = document.querySelectorAll('.__item');
        this._setState();
        this._bindEvent();
        this._initScrollHandler();
    }

    _initScrollHandler() {
        this.scrollHandler = new ScrollHandler({ throttle: 1000 });
        this.scrollHandler.on('up', this._scrollUp.bind(this));
        this.scrollHandler.on('down', this._scrollDown.bind(this));
    }

    _scrollUp() {
        this.logger.info('scrollUp');
        if (this.activeStateIndex === 0 ) {
            this.activeStateIndex = this.stateTables.length - 1
        } else {
            this.activeStateIndex --;
        }
        this._switchState();

    }

    _scrollDown() {
        this.logger.info('scrollDown');
        if (this.activeStateIndex < this.stateTables.length - 1 ) {
            this.activeStateIndex ++;
        } else {
            this.activeStateIndex = 0;
        }
        this._switchState();
    }

    _setStateTable() {
        const el = document.createElement("div");
        el.setAttribute("class", "__StateTable-container");


        let stateStr = '';
        this.stateTables.forEach((state, i) => {
            stateStr += `
                <div class="__item">
                    <div class="__item-Line"></div>
                    <div class="__tableName">
                        <div>${ state.label }</div>
                    </div>
                    <div class="__clickBox" data-act="${this.act}" data-index="${i}"></div>
                </div>
            `;
        })

        el.innerHTML = `<div class="__StateTable-content"><div class="__backgroundLine"></div>${ stateStr }</div>`

        document.querySelector('#root').appendChild(el);
    }

    _bindEvent() {
        window.addEventListener('click', this._onClickState.bind(this));
    }

    _onClickState(e) {
        const act = e.target.dataset.act;
        if (act === this.act) {
            this.activeStateIndex = Number(e.target.dataset.index);
            this._switchState();
            // this._onSwitchState();
        }
    }

    _switchState() {
        this.stateEls.forEach(item => {
            item.removeAttribute('style');
            item.querySelector('.__item-Line').style.opacity = "0";
        })
        this._setState();
    }

    _onSwitchState() {

    }

    _setState() {
        this.stateEls[this.activeStateIndex].style.backgroundColor = this.activeStateColor;
        this.stateEls[this.activeStateIndex].querySelector('.__item-Line').style.opacity = 1;
    }

    _setStateTableStyle() {
        if (document.getElementById('__StateTable-container')) return;
        const styleEl = document.createElement('style');
        styleEl.id = '__StateTable-container-ui-style';
        styleEl.textContent = `
            .__StateTable-container {
                position: absolute;
                top: 25vmin;
                right: 0%;
                height: 50vmin;
                width: 3rem;
                margin: 0vmin 2% 0% 0%;
                justify-content: center;
                display: flex;
                align-items: center;
            }
            .__StateTable-container .__StateTable-content {
                position: relative;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
            }
            .__StateTable-container .__StateTable-content .__backgroundLine {
                position: absolute;
                height: 100%;
                width: 1px;
                background-color: #ffffffa0;
            }
            .__StateTable-container .__StateTable-content .__item {
                position: relative;
                right: calc(.25rem - .5px);
                width: .5rem;
                height: .5rem;
                border-radius: 50%;
                background-color: #fff;
            }
            .__StateTable-container .__StateTable-content .__item .__tableName {
                -webkit-user-select: none;
                user-select: none;
                position: relative;
                height: 1rem;
                width: 1rem;
                top: -4px;
                left: -2rem;
                color: #ccc;
                display: flex;
                flex-direction: row-reverse;
                align-items: center;
            }
            
            .__StateTable-container .__StateTable-content .__item .__tableName div {
                font-size: .7rem;
                white-space: nowrap;
                transition: all .3s;
            }
            .__StateTable-container .__StateTable-content .__item .__clickBox {
                cursor: pointer;
                position: absolute;
                top: -1.25rem;
                left: -3.5rem;
                height: 3rem;
                width: 5rem;
            }
            
            .__StateTable-container .__StateTable-content .__item .__item-Line {
                content: "";
                position: absolute;
                top: -3px;
                left: -3px;
                width: calc(.5rem + 6px);
                height: calc(.5rem + 6px);
                border-radius: 50%;
                box-shadow: 0 0 0 1px #ff9245;
                opacity: 0;
            }
        `;
        document.head.appendChild(styleEl);
    }
}

