uniform vec3 uColor;

varying vec3 vPosition;
varying vec3 vNormal;

void main()
{
    // Normal
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing)
        normal *= - 1.0;

    // Fresnel
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Holographic
    float holographic = fresnel;

    // Final color
    gl_FragColor = vec4(uColor, holographic);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}