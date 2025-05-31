export default class TopInfo {
    constructor(context) {
        this.context = context;
        this.name = "TopInfo";
        this.cnName = "商标";
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);


        this._setTopInfo();
        this._setTopInfoStyle();
    }

    show() {
        this.topInfoEl.setAttribute("__hide", "1");
    }

    hide() {
        this.topInfoEl.removeAttribute("__hide");
    }

    _setTopInfo() {
        const el = document.createElement("div");
        el.setAttribute("class", "__top-info-wrap");

        let author = 'Author'
        let name = '北溟'

        el.innerHTML = `
            <div class="__top-info-content">
                <div class="__logo"><span>${ author }：</span><span class="__name">${name}</span></div>
                <div class="__title">
                    <p>说出你的想法</p>
                    <p>让改变从此刻发生</p>
                </div>
            </div>
        `;
        document.querySelector('#root').appendChild(el);
        this.topInfoEl = el;
    }

    _setTopInfoStyle() {
        if (document.getElementById('__top-info-ui-style')) return;
        const styleEl = document.createElement('style');
        styleEl.id = '__top-info-ui-style';
        styleEl.textContent = `
            .__top-info-wrap {
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                transition: 0.2s 0.3s;
                opacity: 1;
                pointer-events: none;
            }
            
            .__top-info-wrap[__hide] {
                opacity: 0;
            }
            
            .__top-info-content {
                font-size: .8rem;
                margin-top: 10vmin;
                pointer-events: none;
            }
            
            .__top-info-content .__logo {
                display: flex;
                justify-content: right;
                padding-right: 4rem;
                color: #fff;
                transition: .2s;
            }
            
            .__top-info-content .__title {
                color: #fff;
                font-size: 3rem;
                text-align: center;
                letter-spacing: 1rem;
            }
            
            .__top-info-content .__title p {
                margin: 0;
            }
            
            .__top-info-content .__title p:nth-child(2) {
                margin-top: 2vmin;
                font-size: 1.4rem;
                letter-spacing: 0.6rem;
                opacity: 0.7;
            }
            
            .__top-info-content .__logo:hover {
                transform: scale(1.01);
            }
            
            .__top-info-content .__logo .__name {
                color: rgb(255, 141, 26);
            }
        `;
        document.head.appendChild(styleEl);
    }

}