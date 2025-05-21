uniform float uTime;

varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

   /* modelPosition.x += uTime;
    modelPosition.y += uTime;*/

//    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz; // 转换为世界坐标
    vUv = uv;
//     csm_Position = projectionMatrix * modelMatrix * viewMatrix * vec4(position, 1.0);
}