#define S(a, b, x) smoothstep(a, b, x)

uniform sampler2D uRoughnessTexture;

varying vec2 vUv;


void main() {

    vec2 uv = vUv; // 翻转 V 轴
    vec3 roughnessTexture = texture(uRoughnessTexture, uv).rgb; // fract 确保 uv 循环
    float alpha = roughnessTexture.b;
    vec3 color = roughnessTexture;
    gl_FragColor = vec4(color, alpha);
//    gl_FragColor = vec4(1.0);

}
