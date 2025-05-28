// 粒子温度（传自顶点着色器）
varying float vTemperature;
// Hover 状态（0 或 1）
varying float vHover;

/*
温度范围说明：
  ≤ 20°C     → 绿色      (低温)
  45°C       → 青绿
  65°C       → 黄色      (中温)
  ≥ 80°C     → 红色      (高温)
归一化公式： t = clamp((vTemperature - 20) / 80, 0, 1)
*/

vec3 getHeatColor(float t) {
    vec3 green  = vec3(0.0, 1.0, 0.0);
    vec3 yellow = vec3(1.0, 1.0, 0.0);
    vec3 red    = vec3(1.0, 0.0, 0.0);

    // 绿色 → 黄色过渡
    vec3 color = mix(green, yellow, smoothstep(0.0, 0.5, t));
    // 黄色 → 红色过渡
    color = mix(color, red, smoothstep(0.5, 1.0, t));
    return color;
}

void main() {
    // 计算当前片元到粒子中心的距离
    vec2 uv = gl_PointCoord;
    float dist = length(uv - 0.5);

    // 圆形 alpha 蒙版
    float alpha = 1.0 - smoothstep(0.0, 0.3, dist);

    // 将温度映射为归一化值 t ∈ [0, 1]
    float t = clamp((vTemperature - 20.0) / 80.0, 0.0, 1.0);

    // 基础颜色 = 热力图颜色
    vec3 baseColor = getHeatColor(t);

    // hover 时使用白色高亮
    vec3 highlightColor = vec3(1.0);
    vec3 finalColor = mix(baseColor, highlightColor, vHover);

    // 输出最终颜色（含透明度）
    gl_FragColor = vec4(finalColor, alpha);
}
