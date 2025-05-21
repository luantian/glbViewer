import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import GUI from 'lil-gui'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import vertexShader from '../shader/vertex.glsl'
import fragmentShader from '../shader/fragment.glsl'
import hologramVertexShader from '../shader/hologramVertex.glsl'
import hologramFragmentShader from '../shader/hologramFragment.glsl'


/**
 * Base
 */

const gui = new GUI()
const params = {
    wireframe: false,
    rotate: true,
    color: '#858080'
}

const o = {};

// Canvas
const canvas = document.querySelector('canvas.webgl')
canvas.style.background = 'transparent'
// Scene
const scene = new THREE.Scene()

// Loaders
const rgbeLoader = new RGBELoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./static/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Environment map
 */
rgbeLoader.load('/static/aerodynamics_workshop.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    // scene.background = environmentMap
    scene.backgroundBlurriness = 0.5
    scene.environment = environmentMap
})

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Helper
 */

const axesHelper = new THREE.AxesHelper(6);
scene.add(axesHelper);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 8 * 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor(0x000000, 0)
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace
scene.background = null;

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 4)
directionalLight.position.set(6.25, 3, 4)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 30
directionalLight.shadow.normalBias = 0.05
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
scene.add(directionalLight)

const uniforms = {
    uX: new THREE.Uniform(0),
    uY: new THREE.Uniform(0),
    uZ: new THREE.Uniform(0),
    uTime: new THREE.Uniform(0),
}

const patchMap = {
    csm_Slice: {
        '#include <colorspace_fragment>':
        `
            #include <colorspace_fragment>
    
            if(!gl_FrontFacing) {
                gl_FragColor = vec4(0.75, 0.15, 0.3, 1.0);
            }
        `
    }
}

const material = new CustomShaderMaterial({
    baseMaterial: THREE.MeshStandardMaterial,
    vertexShader,
    fragmentShader,
    uniforms,
    patchMap,

    metalness: 0.5,
    roughness: 0.25,
    envMapIntensity: 0.5,
    color: params.color,
    transparent: true,
    // depthWrite: false,
    wireframe: params.wireframe,
    side: THREE.DoubleSide,
})


// Load models

gltfLoader.load('../static/models/fengdongSmall.glb', (gltf) => {

    console.log('gltf', gltf);

    o.model = gltf.scene;

    o.model.traverse((child) => {
        if (child.isMesh) {
            child.material = material;
            child.castShadow = true
            child.receiveShadow = true
        }
    });
    scene.add(o.model);

    const modelFolder = gui.addFolder('模型')

    modelFolder.add(o.model.children[0].material, 'wireframe').name('线框模式');

    boundingBox.generate();

})

const boxParams = {
    color: 0x000000,
}
const boundingBox = {
    material: new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
            uColor: new THREE.Uniform(new THREE.Color(boxParams.color)),
        },
        transparent: true,
        vertexShader: hologramVertexShader,
        fragmentShader: hologramFragmentShader,
        depthWrite: false
    }),
    group: new THREE.Group()
}


const boundingFolder = gui.addFolder('剖切盒');



boundingBox.generateSinglePlane = (params) => {
    const { size, position, rotate, key, name } = params;
    const geometry = new THREE.PlaneGeometry(size.width, size.height);
    const mesh = new THREE.Mesh(geometry, boundingBox.material);

    const _key = 'u' + key.toUpperCase();
    const OFFSET_EPSILON = 0.02;
    const finalPosition = position.clone();
    finalPosition.x = -Math.abs(finalPosition.x) - OFFSET_EPSILON;
    finalPosition.y = -Math.abs(finalPosition.y) - OFFSET_EPSILON;
    finalPosition.z = -Math.abs(finalPosition.z) - OFFSET_EPSILON;
    mesh.position.copy(finalPosition);
    mesh.rotation.set(...rotate);

    uniforms[_key].value = -Math.abs(finalPosition[key]);

    boundingFolder.add(mesh.position, key).min(-Math.abs(finalPosition[key])).max(Math.abs(finalPosition[key])).step(0.001).name(name + `(${key})`).onChange(value => {
        uniforms[_key].value = value;
    });

    scene.add(boundingBox.group.add(mesh));
}


boundingBox.generate = () => {
    const box = new THREE.Box3().setFromObject(o.model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    o.model.position.sub(center);
    // 尺寸和中心
    const { x: w, y: h, z: d } = size;

    const directions = [
        ['前', new THREE.Vector3(0, 0, 0),     new THREE.Vector3(0, 0, -d / 2), 'z'],
        ['右', new THREE.Vector3(0, -Math.PI / 2, 0), new THREE.Vector3(w / 2, 0, 0), 'x'],
        ['下', new THREE.Vector3(Math.PI / 2, 0, 0), new THREE.Vector3(0, -h / 2, 0), 'y'],
    ];

    const params = directions.map(([name, rotate, position, key]) => ({
        name,
        rotate,
        position,
        key,
        size: {
            width: key === 'x' ? d : w,
            height: key === 'y' ? d : h
        },
    }));

    params.forEach(item => boundingBox.generateSinglePlane(item));

    boundingFolder.addColor(boundingBox.material.uniforms.uColor, 'value').name('颜色');
    boundingFolder.add(boundingBox.group, 'visible').name('隐藏');

    // 添加重置按钮
    gui.add({
        reset: () => {
            gui.reset(); // 强制刷新GUI显示
        }
    }, 'reset').name('重置');

}



/**
 * Animate
 */

console.log('scene', scene);

const clock = new THREE.Clock();
const tick = () =>
{

    const elapsedTime = clock.getElapsedTime();
    material.uniforms.uTime.value = elapsedTime;


    // Update controls
    controls.update()

    // Render normal scene
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()