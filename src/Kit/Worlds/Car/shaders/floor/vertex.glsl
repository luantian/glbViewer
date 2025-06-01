varying vec2 vUv;
varying vec3 vPos;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
//        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);


    vUv = uv;
    vPos = position;

}
