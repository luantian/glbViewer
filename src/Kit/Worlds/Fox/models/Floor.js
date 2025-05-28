import * as THREE from 'three'

export default class Floor
{
    constructor(context)
    {
        this.name = 'Floor';
        this.cnName = '地板类';
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.context = context;
        this.scene = context.getScene()
        this.resources = context.getResources()

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        this.geometry = new THREE.CircleGeometry(5, 64)
    }

    setTextures()
    {
        this.textures = {}

        this.textures.color = this.resources.items.grassColorTexture
        this.textures.color.colorSpace = THREE.SRGBColorSpace
        this.textures.color.repeat.set(1.5, 1.5)
        this.textures.color.wrapS = THREE.RepeatWrapping
        this.textures.color.wrapT = THREE.RepeatWrapping

        this.textures.normal = this.resources.items.grassNormalTexture
        this.textures.normal.repeat.set(1.5, 1.5)
        this.textures.normal.wrapS = THREE.RepeatWrapping
        this.textures.normal.wrapT = THREE.RepeatWrapping
    }

    setMaterial()
    {
        this.material = new THREE.MeshStandardMaterial({
            map: this.textures.color,
            normalMap: this.textures.normal,
            side: THREE.DoubleSide
        })
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.rotation.x = - Math.PI * 0.5
        this.mesh.receiveShadow = true
        this.scene.add(this.mesh)
    }

    destroy() {
        // 从场景中移除 Mesh
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();

            // 如果你确定纹理只在这个类中使用，手动释放它们
            if (this.textures?.color) this.textures.color.dispose();
            if (this.textures?.normal) this.textures.normal.dispose();
        }

        // 清空所有引用
        this.mesh = null;
        this.geometry = null;
        this.material = null;
        this.textures = null;
    }

}