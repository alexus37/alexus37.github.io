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
uniform float alphaX;
uniform float alphaY;
uniform float base;

varying vec2 vTC;
varying vec3 vN;
varying vec4 vP;
//varying vec3 vEyeVec;

void main(void) {

    vec3 vEyeVec = -vec3(vP.xyz);
	vec3 V = normalize(vEyeVec);
	vec3 N = normalize(vN);
	// get a tangent direction depending on the base
	vec3 T;
	if(base == 1.0) {
		T = normalize(cross(N, vec3(1, 0, 0)));
	}
	if(base == 2.0) {
		T = normalize(cross(N, vec3(0, 1, 0)));
	}
	if(base == 3.0) {
		T = normalize(cross(N, vec3(0, 0, 1)));
	}
	// get a bitangent direction	
	vec3 B = normalize(cross(N, T));
    vec3 finalColor = vec3(0,0,0);
    
    //Ambient Term
    vec3 Ia = globalAmbientLightColor * materialAmbientColor;

    //iterated over all lights
    const int limit = 3;
    for(int i = 0; i < limit; i++) {
		// get a vector pointing to the lightsource
        vec4 lightVec4 = vec4(lightPosition[i], 1.0) - vP;
		// get the length
		float dist = length(lightVec4.xyz);
		// normalize the light vector
        vec3 L = normalize(lightVec4.xyz);
		// get the halfway vector
		vec3 H = normalize(V + L);
		// get the reflaction vector
		vec3 R = reflect(-L, N);
		//Lambert's cosine law
		float LdotN = dot(N, L);

		//Diffuse Term
		vec3 Id = vec3(0.0,0.0,0.0);
		Id = materialDiffuseColor * max(0.0, LdotN); //add diffuse term
		Id = diffuseReflectionConst * Id;
		Id = vec3(Id.x * lightColor[i].x, Id.y * lightColor[i].y, Id.z * lightColor[i].z);

         //Specular Term
         vec3 Is = vec3(0.0,0.0,0.0);
		 //check the side
         if(LdotN > 0.0){
			float HdotN = dot(H, N);
			float VdotN = dot(V, N);
			float HdotTAX = dot(H, T) / alphaX;
			float HdotBAY = dot(H, B) / alphaY;

			float specular = sqrt(max(0.0, LdotN / VdotN)) * 
							 exp(-2.0 * (HdotTAX * HdotTAX  + HdotBAY * HdotBAY) / (1.0 + HdotN));

			Is = vec3(materialSpecularColor * specular); //add specular term 
            Is = specularReflectionConst * Is;
            Is = vec3(Is.x * lightColor[i].x, Is.y * lightColor[i].y, Is.z * lightColor[i].z);
			
		}

         //Final color
         finalColor = finalColor +  Id + Is;
         
    }
    finalColor = finalColor + Ia;
    vec4 color = vec4(finalColor, 1.0);
    


	gl_FragColor = clamp(color, 0., 1.);
}
