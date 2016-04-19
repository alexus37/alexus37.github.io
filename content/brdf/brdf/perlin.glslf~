#define OCTAVES 8
#define LIGHTS 3
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
uniform float n2;
uniform float noiseMethod;

//noise attributes 
uniform vec2 gradients[256];
uniform sampler2D uSampler;

varying vec2 vTC;
varying vec3 vN;
varying vec4 vP;

float snoise(vec2 v);
vec4 createRust(vec4 color, vec4 rustColor, vec2 textCoord);



void main(void) {
    float F0 = 0.0;
	float specularReflectionConst = 1.0 - diffuseReflectionConst;
	float localPi = 3.14159265359;
    vec3 vEyeVec = -vec3(vP.xyz);
	vec3 V = normalize(vEyeVec);
	vec3 N = normalize(vN);

    vec3 finalColor = vec3(0,0,0);
	vec4 rust = vec4(0.71, 0.25, 0.05, 1.0);
    
    //Ambient Term
    vec3 Ia = globalAmbientLightColor * materialAmbientColor;
	Ia = createRust(vec4(Ia, 1.0), rust, vTC).xyz;

    //iterated over all lights
    for(int i = 0; i < LIGHTS; i++) {
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
		Id = Id;

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
			F0 = pow((n1 - n2)/(n1 + n2), 2.0);
			float F = F0 + (1.0 - F0) * pow((1.0 - VdotH), 5.0);
			float specular = 0.0;
			if(VdotN > 0.0) {
				// Cook–Torrance model uses a specular term
				specular = (D * F * G ) / (localPi * VdotN * LdotN);
 			}
			// get the specular color
			vec3 tempLight = lightColor[i] * LdotN * (diffuseReflectionConst + specular * specularReflectionConst);
			
			Is = vec3(materialSpecularColor.x * tempLight.x, materialSpecularColor.y * tempLight.y, materialSpecularColor.z * tempLight.z);
			
		}
         //Final color
         finalColor = finalColor +  Id + Is;
         
    }
    finalColor = finalColor + Ia;
    vec4 color = vec4(finalColor, 1.0);
	

	//color = createRust(color, rust, vTC);
	    

	gl_FragColor = clamp(color, 0., 1.);
	
}

//cerate noise depending on the selected methode
vec4 createRust(vec4 color, vec4 rustColor, vec2 textCoord){

	float noise = 0.0;
	for(int i = 0; i < OCTAVES; i++) {
		float fac = pow(2.0,float(i));
		if(noiseMethod == 1.0) {
			noise += abs((1.0/fac) * snoise(fac * textCoord));
		}
		if(noiseMethod == 2.0) {
			noise += (1.0/fac) * snoise(fac * textCoord);
		}
		if(noiseMethod == 3.0) {
			noise += (1.0/fac) * abs(snoise(fac * textCoord));
		}
		if(noiseMethod == 4.0) {
			noise += abs((1.0/fac) * snoise(fac * textCoord));
		}
		if(noiseMethod == 5.0) {
			noise += abs((1.0/fac) * snoise(fac * textCoord));
		}
	}
	if(noiseMethod == 4.0) {
		noise = sin(textCoord.x + noise);
	}
	if(noiseMethod == 5.0) {
		noise = 1.0 / noise;
	}
	//vec4 result = (1.0 - noise) * color + noise * rustColor;
	vec4 result = 0.5 * (color + noise * rustColor);	
	return result;
}

//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}




