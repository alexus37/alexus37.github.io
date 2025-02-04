precision mediump float;

uniform vec3 materialAmbientColor;
uniform vec3 materialDiffuseColor;
uniform vec3 materialSpecularColor;

uniform vec3 lightPosition[3];
uniform vec3 lightColor[3];
uniform vec3 globalAmbientLightColor;

// this is an example uniform that is connected to the slide bar.
uniform float diffuseReflectionConst;
uniform float roughness;
uniform float n1;
uniform float n2Red;
uniform float n2Green;
uniform float n2Blue;

varying vec2 vTC;
varying vec3 vN;
varying vec4 vP;


void main(void) {
	float F0Red = 0.0;
	float F0Green = 0.0;
	float F0Blue = 0.0;
	float specularReflectionConst = 1.0 - diffuseReflectionConst;
	float localPi = 3.14159265359;
    vec3 vEyeVec = -vec3(vP.xyz);
	vec3 V = normalize(vEyeVec);
	vec3 N = normalize(vN);
	
	//debug
	bool error = false;

    vec3 finalColor = vec3(0,0,0);
    
    //Ambient Term
    //vec3 Ia = globalAmbientLightColor * materialAmbientColor;
	vec3 Ia = materialAmbientColor;

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
		//Lambert's cosine law
		float LdotN = dot(N, L);
		// get the reflaction vector
		vec3 R = reflect(-L, N);
		

		//Diffuse Term
		vec3 Id = vec3(0.0,0.0,0.0);
		Id = materialDiffuseColor * max(0.0, LdotN); //add diffuse term
		Id = diffuseReflectionConst * Id;
		Id = vec3(Id.x * lightColor[i].x, Id.y * lightColor[i].y, Id.z * lightColor[i].z);

         //Specular Term
         vec3 Is = vec3(0.0,0.0,0.0);
		 //check the side
         if(LdotN > 0.0){
			// calculate the angles
			float HdotN = max(dot(H, N), 0.0);
			float VdotN = max(dot(V, N), 0.0);
			float VdotH = max(dot(V, H), 0.0);

			// G is the geometric attenuation term, describing selfshadowing due to the microfacets,
			float G = min(1.0, min(2.0 * HdotN * VdotN / VdotH, 2.0 * HdotN * LdotN / VdotH));
			
			// D is the Beckmann distribution factor
			float d1 = 1.0 / (localPi * roughness * roughness * pow(HdotN, 4.0));
			float d2 = (1.0 - HdotN * HdotN) / (roughness * roughness * HdotN * HdotN);
			float D = d1 * exp(-d2);
			

			// F is the Fresnel term with Schlick approximation
			F0Red = pow((n1 - n2Red)/(n1 + n2Red), 2.0);
			float FRed = F0Red + (1.0 - F0Red) * pow((1.0 - VdotH), 5.0);
			F0Green = pow((n1 - n2Green)/(n1 + n2Green), 2.0);
			float FGreen = F0Green + (1.0 - F0Green) * pow((1.0 - VdotH), 5.0);
			F0Blue = pow((n1 - n2Blue)/(n1 + n2Blue), 2.0);
			float FBlue = F0Blue + (1.0 - F0Blue) * pow((1.0 - VdotH), 5.0);

			float F = FRed * lightColor[i].x + FGreen * lightColor[i].y + FBlue * lightColor[i].z;

			float specular = 0.0;			
			if(VdotN > 0.0) {
				// Cook–Torrance model uses a specular term
				specular = (D * F * G ) / (localPi * VdotN * LdotN);
 			}

			
			// get the specular color
			//Is = materialSpecularColor * specular;  
            //Is = specularReflectionConst * Is;
			vec3 tempLight = lightColor[i] * LdotN * (diffuseReflectionConst + specular * specularReflectionConst);
			
			Is = vec3(materialSpecularColor.x * tempLight.x, materialSpecularColor.y * tempLight.y, materialSpecularColor.z * tempLight.z);
            //Is = vec3(Is.x * lightColor[i].x, Is.y * lightColor[i].y, Is.z * lightColor[i].z);
			
		}

         //Final color
         finalColor = finalColor +  Id + Is;
		
         
    }
    finalColor = finalColor + Ia;

	vec4 color = vec4(finalColor, 1.0);
   

	gl_FragColor = clamp(color, 0., 1.);
}
