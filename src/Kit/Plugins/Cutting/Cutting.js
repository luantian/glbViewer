import * as THREE from 'three';
import Drag from './Drag.js';

export default class Cutting {
    constructor(context) {
        this.name = 'Cutting';
        this.cnName = '剖切插件';
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);

        this.context = context;
        this.scene = context.getScene();
        this.rendererInstance = context.getRendererInstance();
        this.canvas = context.getCanvas();

        this.cuttingMeshes = [];
        this.planes = new THREE.Group();
        this.clippingPlanes = [];
        this.size = null;

        this.rendererInstance.localClippingEnabled = true;

        this.planeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.0,
            roughness: 0.6,
            transmission: 1.0,
            thickness: 0.5,
            ior: 1.5,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            envMapIntensity: 1.0
        });

        this.init();
    }

    init() {
        // 收集场景中所有可裁剪的 Mesh
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.geometry && child.material) {
                this.cuttingMeshes.push(child);
            }
        });

        if (this.cuttingMeshes.length === 0) {
            this.logger.warn('未找到可裁剪的 Mesh');
            return;
        }

        this.size = this.getMaxSize(this.cuttingMeshes);
        this.generatePlanes();

        this.cuttingMeshes.forEach((mesh) => {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat) => {
                    mat.clippingPlanes = this.clippingPlanes;
                    mat.clipShadows = true;
                });
            } else {
                mesh.material.clippingPlanes = this.clippingPlanes;
                mesh.material.clipShadows = true;
            }
        });

        // 拖拽初始化
        this.drag = new Drag(this.context, this.planes.children);
        this.drag.onDrag = (mesh) => {
            const axis = mesh.userData.axis;
            const plane = mesh.userData.clippingPlane;
            const direction = mesh.userData.direction || 1;

            plane.constant = -mesh.position[axis] * direction;
        };
    }

    getMaxSize(meshes) {
        const box = new THREE.Box3();
        meshes.forEach((mesh) => box.expandByObject(mesh));
        const size = new THREE.Vector3();
        box.getSize(size);
        return { x: size.x || 1, y: size.y || 1, z: size.z || 1 };
    }

    generatePlanes() {
        const { x: width, y: height, z: depth } = this.size;
        const OFFSET = 0.02;

        const directions = [
            ['z', new THREE.Vector3(0, 0, -depth / 2), [0, 0, 0]],
            ['x', new THREE.Vector3(width / 2, 0, 0), [0, -Math.PI / 2, 0]],
            ['y', new THREE.Vector3(0, -height / 2, 0), [Math.PI / 2, 0, 0]],
        ];

        directions.forEach(([axis, pos, rot]) => {
            const widthSize = axis === 'x' ? depth : width;
            const heightSize = axis === 'y' ? depth : height;

            const geometry = new THREE.PlaneGeometry(widthSize, heightSize);
            const mesh = new THREE.Mesh(geometry, this.planeMaterial);

            pos[axis] = -Math.abs(pos[axis]) - OFFSET;
            mesh.position.copy(pos);
            mesh.rotation.set(...rot);

            mesh.userData.axis = axis;
            mesh.userData.axisRange = {
                min: -this.size[axis] / 2 - OFFSET,
                max: this.size[axis] / 2 + OFFSET,
            };
            mesh.userData.direction = 1;

            const normal = new THREE.Vector3();
            normal[axis] = 1;
            const plane = new THREE.Plane(normal, -mesh.position[axis]);
            mesh.userData.clippingPlane = plane;

            this.clippingPlanes.push(plane);
            this.planes.add(mesh);
        });

        this.scene.add(this.planes);
        this.logger.success(this.name, '剖切面创建成功');
    }

    flipPlaneDirection(axis) {
        const mesh = this.planes.children.find(m => m.userData.axis === axis);
        if (!mesh) return;

        const plane = mesh.userData.clippingPlane;
        mesh.userData.direction *= -1;
        plane.normal.negate();
        plane.constant = -mesh.position[axis] * mesh.userData.direction;
        mesh.scale[axis] *= -1;

        this.logger.info(`${axis} 方向剖切面方向已翻转，方向为 ${mesh.userData.direction}`);
    }

    flipAllPlanesDirection() {
        ['x', 'y', 'z'].forEach(axis => this.flipPlaneDirection(axis));
    }

    destroy() {
        this.logger.info('开始注销 Cutting 插件');

        this.drag?.destroy();
        this.scene.remove(this.planes);

        this.cuttingMeshes.forEach(mesh => {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => mat.dispose());
            } else if (mesh.material) {
                mesh.material.dispose();
            }
        });
        this.planeMaterial.dispose();
        this.cuttingMeshes.length = 0;
        this.clippingPlanes.length = 0;
        this.planes.clear();
    }
}
