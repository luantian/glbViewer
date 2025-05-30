/*#define PI 3.1415926
#define PI2 6.2831852
#define S(a, b, x) smoothstep(a, b, x)

precision mediump float;

uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPos;

void main() {
    // 控制方块的数量（每轴几列）
    float tileCount = 20.0;
    float w_c = 16.0; // 宽方向的个数
    float h_c = 20.0; // 高方向的个数

    // 重复 UV（每 tile 重复）
    float tileUVX = mod(vUv.x * w_c, 1.0);
    float tileUVY = mod(vUv.y * h_c, 1.0);

    // 中心和方块尺寸
    float w = 0.48; // 控制每个 tile 内方块的大小
    float h = 0.02; // 控制每个 tile 内方块的大小
    // 计算是否在方块内
    vec2 dist = abs(vec2(tileUVX, tileUVY) - vec2(0.5));
    float ss = 0.3; // 虚度
    float inside = S(w - ss , w + ss , dist.x) * S(h - ss, h + ss, dist.y);


//    step(dist.x, halfSize.x)
    gl_FragColor = vec4(inside, 0.0, inside, 1.0); // 显示白色方块
}*/

/*
#define PI 3.1415926
#define PI2 6.2831852
#define S(a, b, x) smoothstep(a, b, x)

precision mediump float;

uniform vec2 uResolution;
uniform float uTime; // 可选：用于动态效果

varying vec2 vUv;

// HSV 转 RGB
vec3 hsv2rgb(float h, float s, float v) {
    vec3 c = vec3(h, s, v);
    vec3 k = vec3(1.0, 2.0 / 3.0, 1.0 / 3.0);
    vec3 p = abs(fract(c.xxx + k) * 6.0 - vec3(3.0, 3.0, 3.0));
    return c.z * mix(vec3(1.0), clamp(p - vec3(1.0), 0.0, 1.0), c.y);
}

void main() {
    float w_c = 16.0;
    float h_c = 20.0;
    float tileUVX = mod(vUv.x * w_c, 1.0);
    float tileUVY = mod(vUv.y * h_c, 1.0);

    float w = 0.48;
    float h = 0.02;
    vec2 dist = abs(vec2(tileUVX, tileUVY) - vec2(0.5));
    float ss = 0.3;
    float inside = S(w - ss, w + ss, dist.x) * S(h - ss, h + ss, dist.y);

    // 动态彩虹色
    float hue = fract(tileUVX + uTime * 0.1); // 随时间水平流动
    vec3 color = hsv2rgb(hue, 0.8, 1.0);

    gl_FragColor = vec4(color * inside, 1.0);
}*/
/*


#define PI 3.1415926
#define PI2 6.2831852
#define S(a, b, x) smoothstep(a, b, x)

precision mediump float;

uniform vec2 uResolution;
uniform float uTime; // 必须从 JavaScript 传入时间

varying vec2 vUv;

// HSV 转 RGB 函数
vec3 hsv2rgb(float h, float s, float v) {
    vec3 c = vec3(h, s, v);
    vec3 k = vec3(1.0, 2.0 / 3.0, 1.0 / 3.0);
    vec3 p = abs(fract(c.xxx + k) * 6.0 - vec3(3.0, 3.0, 3.0));
    return c.z * mix(vec3(1.0), clamp(p - vec3(1.0), 0.0, 1.0), c.y);
}

void main() {
    float w_c = 16.0;
    float h_c = 20.0;
    float tileUVX = mod(vUv.x * w_c, 1.0);
    float tileUVY = mod(vUv.y * h_c, 1.0);

    float w = 0.48;
    float h = 0.02;
    vec2 dist = abs(vec2(tileUVX, tileUVY) - vec2(0.5));
    float ss = 0.3;
    float inside = S(w - ss, w + ss, dist.x) * S(h - ss, h + ss, dist.y);

    // 关键修改：色相基于垂直位置和时间流动
    float speed = 0.5; // 控制流动速度（值越大越快）
    float hue = fract(vUv.y + uTime * speed); // 从上到下流动
    vec3 color = hsv2rgb(hue, 0.8, 1.0);     // 高饱和度、高亮度

    gl_FragColor = vec4(color * inside, 1.0);
}*/

#define PI 3.1415926
#define PI2 6.2831852
#define S(a, b, x) smoothstep(a, b, x)

uniform vec2 uResolution;
uniform float uTime;  // 必须传入时间

varying vec2 vUv;

// 伪随机数生成（用于随机颜色）
float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 78.233))) * 43758.5453);
}

// HSV 转 RGB（生成彩虹色）
vec3 hsv2rgb(float h, float s, float v) {
    vec3 c = vec3(h, s, v);
    vec3 k = vec3(1.0, 2.0 / 3.0, 1.0 / 3.0);
    vec3 p = abs(fract(c.xxx + k) * 6.0 - vec3(3.0, 3.0, 3.0));
    return c.z * mix(vec3(1.0), clamp(p - vec3(1.0), 0.0, 1.0), c.y);
}

void main() {
    float w_c = 16.0;  // 水平方向方块数量
    float h_c = 10.0;  // 垂直方向方块数量

    // 垂直流动：时间偏移作用于 tileUVY
    float flowSpeed = 6.0;  // 流动速度（正数向下，负数向上）
    float tileUVX = mod(vUv.x * w_c, 1.0);
    float tileUVY = mod(vUv.y * h_c + uTime * flowSpeed, 1.0);

    // 条形尺寸（交换 w 和 h 以适配垂直方向）
    float w = 0.01;  // 条形的垂直高度（粗细）
    float h = 0.48;  // 条形的水平宽度（长度）
    float smoothness = 0.3;

    // 计算是否在条形内
    vec2 dist = abs(vec2(tileUVX, tileUVY) - vec2(0.5));
    float inside = S(h - smoothness, h + smoothness, dist.x)
    * S(w - smoothness, w + smoothness, dist.y);

    // 关键颜色部分：基于水平位置 (tileUVX) 生成彩虹色
    float hue = fract(tileUVX + uTime * 0.1);  // 色相随时间微移（可选）
    vec3 color = hsv2rgb(hue, 0.8, 1.0);      // 高饱和度、高亮度的彩虹色

    // 输出彩色条形
    gl_FragColor = vec4(color * inside, 1.0);
}