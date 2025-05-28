import * as THREE from 'three';

export default class Drag {
    constructor(context, objects) {
        this.name = 'Drag';
        this.context = context;
        this.cameraInstance = context.getCameraInstance();
        this.orbitControls = context.getOrbitControls();
        this.domElement = context.getCanvas();
        this.objects = objects;

        this.enabled = true;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.tempVector = new THREE.Vector3();
        this.intersection = new THREE.Vector3();
        this.offset = new THREE.Vector3();

        this.plane = new THREE.Plane();
        this.selected = null;
        this.dragging = false;

        this.onDragStart = null;
        this.onDrag = null;
        this.onDragEnd = null;

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);

        this._bindEvents();
    }

    _bindEvents() {
        this.domElement.addEventListener('pointerdown', this._onPointerDown);
        this.domElement.addEventListener('pointermove', this._onPointerMove);
        this.domElement.addEventListener('pointerup', this._onPointerUp);
        this.domElement.addEventListener('pointercancel', this._onPointerUp);
        window.addEventListener('keydown', this._onKeyDown);
    }

    _getPlane(axis = 'xy') {
        const axisMap = {
            x: new THREE.Vector3(0, 1, 0),
            y: new THREE.Vector3(1, 0, 0),
            z: new THREE.Vector3(0, 1, 0),
            xy: new THREE.Vector3(0, 0, 1),
            xz: new THREE.Vector3(0, 1, 0),
            yz: new THREE.Vector3(1, 0, 0),
        };
        return new THREE.Plane(axisMap[axis] || new THREE.Vector3(0, 0, 1));
    }

    _onPointerDown(event) {
        if (!this.enabled || event.button !== 0) return;

        this.domElement.setPointerCapture(event.pointerId);

        this._updateMouse(event);
        this.raycaster.setFromCamera(this.mouse, this.cameraInstance);
        const intersects = this.raycaster.intersectObjects(this.objects, true);
        if (intersects.length === 0) return;

        let picked = intersects[0].object;
        while (picked && !this.objects.includes(picked)) {
            picked = picked.parent;
        }
        if (!picked) return;

        const axis = picked.userData.axis || 'xy';
        const hit = this.raycaster.intersectObject(picked, true);
        if (!hit.length) return;

        const clickPoint = hit[0].point;

        this.selected = picked;
        if (this.orbitControls) {
            this.orbitControls.enabled = false;
        }

        this.plane = this._getPlane(axis);
        this.plane.setFromNormalAndCoplanarPoint(this.plane.normal, clickPoint);

        this.raycaster.ray.intersectPlane(this.plane, this.intersection);
        this.offset.copy(this.intersection).sub(this.selected.position);
        this.dragging = true;

        this.onDragStart?.(this.selected);
    }

    _onPointerMove(event) {
        if (!this.dragging || !this.selected) return;

        this._updateMouse(event);
        this.raycaster.setFromCamera(this.mouse, this.cameraInstance);

        if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
            const axis = this.selected.userData.axis || 'xy';
            const range = this.selected.userData.axisRange;
            const direction = this.selected.userData.direction || 1;

            const newPosRaw = this.tempVector.copy(this.intersection).sub(this.offset);
            const adjustedPos = new THREE.Vector3();

            if (axis.length === 1) {
                adjustedPos[axis] = newPosRaw[axis] * direction;
            } else {
                if (axis.includes('x')) adjustedPos.x = newPosRaw.x * direction;
                if (axis.includes('y')) adjustedPos.y = newPosRaw.y * direction;
                if (axis.includes('z')) adjustedPos.z = newPosRaw.z * direction;
            }

            if (range && (
                (axis.length === 1 && (adjustedPos[axis] > range.max || adjustedPos[axis] < range.min)) ||
                (axis.length > 1 && (
                    (axis.includes('x') && (adjustedPos.x > range.max || adjustedPos.x < range.min)) ||
                    (axis.includes('y') && (adjustedPos.y > range.max || adjustedPos.y < range.min)) ||
                    (axis.includes('z') && (adjustedPos.z > range.max || adjustedPos.z < range.min))
                ))
            )) return;

            this._applyAxisConstraint(this.selected.position, adjustedPos.multiplyScalar(1 / direction), axis);

            this.onDrag?.(this.selected);
        }
    }

    _applyAxisConstraint(position, adjustedPos, axis) {
        if (axis.length === 1) {
            position[axis] = adjustedPos[axis];
        } else {
            if (axis.includes('x')) position.x = adjustedPos.x;
            if (axis.includes('y')) position.y = adjustedPos.y;
            if (axis.includes('z')) position.z = adjustedPos.z;
        }
    }

    _onPointerUp(event) {
        if (!this.dragging) return;
        this.domElement.releasePointerCapture(event.pointerId);
        this.dragging = false;

        if (this.selected) {
            const snap = this.selected.userData.snap;
            if (snap) {
                this.selected.position.x = Math.round(this.selected.position.x / snap) * snap;
                this.selected.position.y = Math.round(this.selected.position.y / snap) * snap;
                this.selected.position.z = Math.round(this.selected.position.z / snap) * snap;
            }

            // 分发位置变更事件
            this.selected.dispatchEvent({
                type: 'positionChanged',
                position: this.selected.position.clone(),
            });
        }

        this.selected = null;
        if (this.orbitControls) {
            this.orbitControls.enabled = true;
        }

        this.onDragEnd?.();
    }

    _onKeyDown(event) {
        if (event.key === 'Escape' && this.dragging) {
            this.dragging = false;
            this.selected = null;
            if (this.orbitControls) {
                this.orbitControls.enabled = true;
            }
            this.onDragEnd?.();
        }
    }

    _updateMouse(event) {
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    destroy() {
        this.domElement.removeEventListener('pointerdown', this._onPointerDown);
        this.domElement.removeEventListener('pointermove', this._onPointerMove);
        this.domElement.removeEventListener('pointerup', this._onPointerUp);
        this.domElement.removeEventListener('pointercancel', this._onPointerUp);
        window.removeEventListener('keydown', this._onKeyDown);

        this.objects = null;
        this.selected = null;
        this.orbitControls = null;
        this.cameraInstance = null;
        this.context = null;
    }
}
