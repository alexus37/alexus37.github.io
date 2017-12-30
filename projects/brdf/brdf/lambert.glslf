precision mediump float;

uniform vec3 materialAmbientColor;
uniform vec3 materialDiffuseColor;
uniform vec3 materialSpecularColor;

uniform vec3 lightPosition[3];
uniform vec3 lightColor[3];
uniform vec3 globalAmbientLightColor;

varying vec2 vTC;
varying vec3 vN;
varying vec4 vP;

void main(void) {
    vec3 color = vec3(0.0, 0.0, 0.0);
	color = globalAmbientLightColor * materialAmbientColor;
    const int limit = 3;
    for(int i = 0; i < limit; i++) {
        // get vector pointing to the first light source
        vec4 lightVec4 = vec4(lightPosition[i], 1.0) - vP;

        // get a 3 D vector out of it
        vec3 lightVec3 = vec3(lightVec4);

        // normalize it
        lightVec3 = normalize(lightVec3);

        //dot product between the Normal and the light direction
        float faktor = max(0.0, dot(lightVec3, vN));

        //multiply with lightintensity elementwise
        vec3 tempColor = vec3(materialDiffuseColor.x * lightColor[i].x, materialDiffuseColor.y * lightColor[i].y, materialDiffuseColor.z * lightColor[i].z);
        // multiply with color
        color = color + (faktor * tempColor);
    }
    color = (1.0 / float(limit)) * color;

	gl_FragColor = clamp(vec4(color, 1.), 0., 1.);
}
