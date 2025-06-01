import gsap from "gsap";

export default class CarAnimationController {
    constructor(model, context) {
        if (!model?.position) {
            console.warn("[CarAnimationController] model is not valid:", model);
            return;
        }

        this.model = model;
        this.context = context;

        this._state = {
            rotationSpeed: 0,
            animationActive: false,
        };

        this._modelPosition = model.position.clone();
        this._tweens = {};

        // 自动查找车轮
        const wheelNames = [
            '3DWheel_Front_L_265',
            '3DWheel_Front_R_330',
            '3DWheel_Rear_L_397',
            '3DWheel_Rear_R_462'
        ];
        this._wheels = wheelNames
            .map(name => model.getObjectByName(name))
            .filter(Boolean);

        // 所有支持的动画
        this._animations = {
            carFront: {
                play: () => {
                    this._kill('carFront');
                    this._tweens.carFront = gsap.timeline({ repeat: -1 }).to(this.model.position, {
                        x: this._modelPosition.x + 0.003,
                        y: this._modelPosition.y + 0.004,
                        z: this._modelPosition.z + 0.004,
                        duration: 4,
                        ease: "carBump",
                        yoyo: true
                    });
                },
                stop: () => {
                    this._kill('carFront');
                    this._tweens.carFront = gsap.to(this.model.position, {
                        x: this._modelPosition.x,
                        y: this._modelPosition.y,
                        z: this._modelPosition.z,
                        duration: 0.4,
                        ease: "power4.out"
                    });
                }
            },
            wheelSpin: {
                play: () => {
                    this._kill('wheelSpin');
                    this._state.animationActive = true;
                    this._tweens.wheelSpin = gsap.to(this._state, {
                        rotationSpeed: 300,
                        duration: 3,
                        ease: "power2.in",
                        onUpdate: () => this.context?.trigger?.('Tunnel:rotationSpeed', this._state.rotationSpeed)
                    });
                },
                stop: () => {
                    this._kill('wheelSpin');
                    this._tweens.wheelSpin = gsap.to(this._state, {
                        rotationSpeed: 0,
                        duration: 3,
                        ease: "power1.out",
                        onUpdate: () => this.context?.trigger?.('Tunnel:rotationSpeed', this._state.rotationSpeed),
                        onComplete: () => {
                            this._state.animationActive = false;
                        }
                    });
                }
            }
        };
    }

    play(name) {
        this._animations[name]?.play?.();
    }

    stop(name) {
        this._animations[name]?.stop?.();
    }

    _kill(name) {
        if (this._tweens[name]) {
            this._tweens[name].kill();
            this._tweens[name] = null;
        }
    }

    tick(delta) {
        if (!this._state.animationActive) return;
        const rot = this._state.rotationSpeed * delta;
        this._wheels.forEach(w => w.rotation.x += rot);
    }

    isAnimating() {
        return this._state.animationActive;
    }
}
