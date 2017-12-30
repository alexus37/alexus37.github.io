precision mediump float;

uniform vec3 materialAmbientColor;
uniform vec3 materialDiffuseColor;
uniform vec3 materialSpecularColor;

uniform vec3 lightPosition[3];
uniform vec3 lightColor[3];
uniform vec3 globalAmbientLightColor;

// this is an example uniform that is connected to the slide bar.
uniform float diffuseReflectionConst;
uniform float specularReflectionConst;
uniform float shininess;

varying vec2 vTC;
varying vec3 vN;
varying vec4 vP;
//varying vec3 vEyeVec;

void main(void) {
    vec3 vEyeVec = -vec3(vP.xyz);
    vec4 finalColor = vec4(0,0,0,0);
    
    //Ambient Term
    vec4 Ia = vec4(globalAmbientLightColor * materialAmbientColor, 1.0);

    //iterated over all lights
    const int limit = 3;
    for(int i = 0; i < limit; i++) {

        vec4 lightVec4 = vec4(lightPosition[i], 1.0) - vP;
        vec3 L = normalize(lightVec4.xyz);
        vec3 N = normalize(vN);

         //Lambert's cosine law
         float lambertTerm = clamp(dot(N, L), 0., 1.);


         //Diffuse Term
         vec4 Id = vec4(0.0,0.0,0.0,1.0);

         //Specular Term
         vec4 Is = vec4(0.0,0.0,0.0,1.0);

         if(lambertTerm > 0.0) //only if lambertTerm is positive
         {
              Id =  vec4(materialDiffuseColor * lambertTerm, 1.0); //add diffuse term
              Id = diffuseReflectionConst * Id;
              Id = vec4(Id.x * lightColor[i].x, Id.y * lightColor[i].y, Id.z * lightColor[i].z, 1);
              
              //Calculate the half vector
              vec3 E = normalize(vEyeVec);
              vec3 H = normalize(E + L);
              float specular = pow( max(dot(H, N), 0.0), shininess);
              
              Is = vec4(materialSpecularColor * specular, 1.0); //add specular term 
              Is = specularReflectionConst * Is;
              Is = vec4(Is.x * lightColor[i].x, Is.y * lightColor[i].y, Is.z * lightColor[i].z, 1);
         }

         //Final color
         finalColor = finalColor +  Id + Is;
         
    }
    finalColor = finalColor + Ia;
    finalColor.a = 1.0;


	gl_FragColor = clamp(finalColor, 0., 1.);
}
