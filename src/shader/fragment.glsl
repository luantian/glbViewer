uniform float uX;
uniform float uY;
uniform float uZ;
uniform float uTime;

varying vec3 vWorldPosition;
varying vec2 vUv;

#include ./random2D.glsl

void main() {
    // 计算点到平面距离

//    float d = -0.01;
//    // 剖切判断（dist > 0 表示在平面正侧）
//    if(uX - vWorldPosition.x > d || uY - vWorldPosition.y > d || uZ - vWorldPosition.z > d) {
//        discard;
//    }

    /*float dist = distance(vUv, vec2(0.5));

    // 控制扫描环的频率和速度
    float scale = 20.0;
    float speed = 5.0;

    // 生成周期性的环形波纹
    float wave = sin(dist * scale - uTime * speed);

    // 将 sin 波变成 0~1 的值，再压缩范围形成窄环
    float ring = smoothstep(0.03, 0.0, abs(wave));

    // 设置颜色（可选发光）
    vec3 color = vec3(1.0, 1.0, 1.0) * ring;
*/

    /*float d = -0.01;
    float smoothEdge = 0.02; // 越大越柔和

    float dx = uX - vWorldPosition.x;
    float dy = uY - vWorldPosition.y;
    float dz = uZ - vWorldPosition.z;

    // 分别计算每个方向的剖切 alpha（越接近边缘，越接近0）
    float alphaX = smoothstep(d + smoothEdge, d, dx);
    float alphaY = smoothstep(d + smoothEdge, d, dy);
    float alphaZ = smoothstep(d + smoothEdge, d, dz);

    // 最终 alpha 是三个方向的最小值（只要有一个方向接近裁剪，就整体变透明）
    float finalAlpha = min(min(alphaX, alphaY), alphaZ);

    // 若透明度极小，仍然可以丢弃
    if (finalAlpha <= 0.01) discard;

    csm_DiffuseColor = vec4(1.0, 1.0, 1.0, finalAlpha);*/

    float d = -0.01;

    // 获取裁切差值（>0 表示应该剖切）
    float dx = uX - vWorldPosition.x;
    float dy = uY - vWorldPosition.y;
    float dz = uZ - vWorldPosition.z;

    // 使用 fwidth 来做边缘过渡宽度（自动适配缩放、斜边）
    float edgeX = fwidth(dx);
    float edgeY = fwidth(dy);
    float edgeZ = fwidth(dz);

    // 对每个方向做平滑抗锯齿处理
    float alphaX = smoothstep(d + edgeX, d, dx);
    float alphaY = smoothstep(d + edgeY, d, dy);
    float alphaZ = smoothstep(d + edgeZ, d, dz);

    // 三个方向取最小值（哪个方向切得最狠就按哪个方向透明）
    float alpha = min(min(alphaX, alphaY), alphaZ);

    // 阈值裁剪
    if (alpha < 0.01) discard;

    // 输出抗锯齿剖切透明色
    csm_DiffuseColor = vec4(1.0, 1.0, 1.0, alpha);

}