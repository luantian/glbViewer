// MaterialUtils.js
import * as THREE from 'three';

const MaterialUtils = {
    convertPhysicalToStandard(root, override = {}) {
        root.traverse(child => {
            if (child.isMesh && child.material && child.material.isMeshPhysicalMaterial) {
                const mat = child.material;
                const newMat = new THREE.MeshStandardMaterial({
                    color: mat.color.clone(),
                    map: mat.map,
                    normalMap: mat.normalMap,
                    roughness: mat.roughness,
                    metalness: mat.metalness,
                    transparent: mat.transparent,
                    opacity: mat.opacity,
                    envMap: mat.envMap,
                    side: mat.side,
                    ...override
                });

                mat.dispose();
                child.material = newMat;
            }
        });
    },

    convertStandardToToon(root, gradientMap, override = {}) {
        root.traverse(child => {
            if (child.isMesh && child.material && child.material.isMeshStandardMaterial) {
                const mat = child.material;
                const newMat = new THREE.MeshToonMaterial({
                    color: mat.color.clone(),
                    gradientMap,
                    ...override
                });

                mat.dispose();
                child.material = newMat;
            }
        });
    },

    disposeAllMaterials(root) {
        root.traverse(child => {
            if (child.isMesh && child.material) {
                const mat = child.material;
                if (Array.isArray(mat)) {
                    mat.forEach(m => m.dispose?.());
                } else {
                    mat.dispose?.();
                }
            }
        });
    }
};

export default MaterialUtils;
