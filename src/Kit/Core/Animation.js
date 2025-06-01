import * as THREE from 'three'

export default class Animation {
    constructor(model) {
        this.model = model.scene;
        this.animations = model.animations
        this.mixer = new THREE.AnimationMixer(this.model)
        this.actions = {}
        this.currentAction = null

        this.createActions()
    }

    createActions() {
        this.animations.forEach((clip) => {
            this.actions[clip.name] = this.mixer.clipAction(clip)
        })
    }

    play(name) {

        const newAction = this.actions[name]
        const oldAction = this.currentAction;

        if (!newAction) {
            return console.warn(`Animation "${name}" not found`)
        }

        if (this.currentAction !== newAction) {
            newAction.reset().play()
            if (oldAction) {
                newAction.crossFadeFrom(oldAction, 1)
            }
            this.currentAction = newAction
        }
    }

    getFirstAnimationName() {
        if (this.animations.length === 0) return '';
        return this.animations[0].name;
    }

    getCount() {
        return this.animations.length;
    }

    setDebugger(debugFolder) {
        const debugObject = {}
        if (this.animations.length === 0) return;
        const animationNames = this.animations.map(item => item.name);
        animationNames.forEach(animationName => {
            debugObject[animationName] = () => { this.play(animationName); };
            debugFolder.add(debugObject, animationName)
        })
    }

    update(delta, elapsed) {
        this.mixer.update(delta)
    }
}
