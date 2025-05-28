attribute float aTemperature;
attribute float aHover;

uniform float uSize;

varying float vTemperature;
varying float vHover;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_PointSize = 30.0 * uSize * (1.0 / -viewPosition.z);
    gl_Position = projectionPosition;
    vTemperature = aTemperature;
    vHover = aHover;
}
