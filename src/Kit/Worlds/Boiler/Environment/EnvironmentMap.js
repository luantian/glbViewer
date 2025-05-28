import * as THREE from 'three'

export default class EnvironmentMap {
    constructor(context) {
        this.context = context;
        this.scene = this.context.scene;
        this.resources = this.context.resources;
        this.debug = this.context.debug;
        this.setEnvironmentMap();

        if (this.debug.active) {
            this.setDebugger();
        }
    }

    // 根据需要 更改环境贴图材质
    setEnvironmentMap(targets = []) {
        this.environmentMap = {
            intensity: 0.4,
            texture: this.resources.items.environmentMapTexture
        };

        this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace;

        // 设置场景环境贴图（物理环境光影响）
        this.scene.environment = this.environmentMap.texture;

        // 应用到指定的模型（支持数组或单个）
        const applyTo = Array.isArray(targets) ? targets : [targets];

        this.environmentMap.updateMaterials = () => {
            applyTo.forEach((target) => {
                if (!target) return;

                target.traverse?.((child) => {
                    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                        child.material.envMap = this.environmentMap.texture;
                        child.material.envMapIntensity = this.environmentMap.intensity;
                        child.material.needsUpdate = true;
                    }
                });
            });
        };

        this.environmentMap.updateMaterials();
    }

    setDebugger() {
        this.folder = this.debug.ui.addFolder('Environment Map');
        this.folder.add(this.environmentMap, 'intensity')
            .min(0).max(4).step(0.001)
            .name('Env Map Intensity')
            .onChange(this.environmentMap.updateMaterials);
    }

    destroy() {
        // 1. 清除材质中的 envMap 引用
        this.scene.traverse((child) => {
            if (
                child instanceof THREE.Mesh &&
                child.material instanceof THREE.MeshStandardMaterial
            ) {
                child.material.envMap = null;
                child.material.envMapIntensity = 1; // 可设默认
                child.material.needsUpdate = true;
            }
        });

        // 2. 清除场景的环境贴图引用
        this.scene.environment = null;

        // 3. 销毁贴图资源（如果是动态加载的）
        if (this.environmentMap?.texture?.dispose) {
            this.environmentMap.texture.dispose();
        }

        // 4. 移除调试 UI（如果有）
        if (this.debug.active && this.folder) {
            this.folder.destroy?.(); // .destroy() 是 lil-gui 的销毁方法（如果你用的 lil-gui）
        }

        this.environmentMap = null;
    }



}
