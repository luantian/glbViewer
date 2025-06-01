#define S(a, b, x) smoothstep(a, b, x)

uniform sampler2D uTexture;

uniform float uOffset;
uniform float uAlpha;

varying vec2 vUv;


void main() {
    vec2 uv = vec2(vUv.y, vUv.x); // 翻转 V 轴
    uv.x += uOffset; // 随时间偏移 x 轴
    vec3 t = texture(uTexture, fract(uv)).rgb; // fract 确保 uv 循环
    vec3 color = t;
    gl_FragColor = vec4(color, uAlpha);
//    gl_FragColor = vec4(1.0);
}
