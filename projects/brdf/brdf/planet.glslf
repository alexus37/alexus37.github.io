#define OCTAVES 8
#define eps 0.0000001

precision mediump float;


uniform vec3 materialAmbientColor;
uniform vec3 materialDiffuseColor;
uniform vec3 materialSpecularColor;
uniform float currentTime;

uniform vec3 lightPosition[3];
uniform vec3 lightColor[3];
uniform vec3 globalAmbientLightColor;

// this is an example uniform that is connected to the slide bar.
uniform float diffuseReflectionConst;
uniform float specularReflectionConst;
uniform float shininess;
uniform float PERSITANCE;
uniform float CLOUDCOVER;
uniform float CLOUDSHARPNESS;
uniform float CLOUDSCALE;
uniform float WATERFREQUENCY;
uniform float WATERAMPLITUDE;
uniform float WATERSCALE;

uniform float NOISEFREQUENCY;
uniform float NOISEAMPLITUDE;
uniform float NORMALFACTOR;
uniform float CLOUDSPEED;

varying vec2 vTC;
varying vec3 vN;
varying vec4 vP;
varying vec4 vtxPos;

vec3 deeps = vec3(0.0 / 255.0, 0.0 / 255.0, 128.0 / 255.0); // -1.0
vec3 shallow = vec3(0.0 / 255.0, 0.0 / 255.0, 225.0 / 255.0); // - 0.25
vec3 shore = vec3(0.0 / 255.0, 128.0 / 255.0, 225.0 / 255.0); //  0.0
vec3 sand = vec3(240.0 / 255.0, 240.0 / 255.0, 64.0 / 255.0); // 0.0625
vec3 grass = vec3(32.0 / 255.0, 160.0 / 255.0, 0.0 / 255.0); // 0.1250
vec3 dirt = vec3(224.0 / 255.0, 224.0 / 255.0, 0.0 / 255.0); // 0.3750
vec3 rock = vec3(128.0 / 255.0, 128.0 / 255.0, 128.0 / 255.0); // 0.75
vec3 snow = vec3(255.0 / 255.0, 255.0 / 255.0, 255.0 / 255.0); // 1.0

vec3 cloudColor = vec3(222.0 / 255.0, 222.0 / 255.0, 222.0 / 255.0);


vec3 skyColor = vec3(0.0 / 255.0, 0.0 / 255.0, 222.0 / 255.0);
vec3 CLOUDSTEP = vec3(0.003, 0.008, 0.07);
vec3 WATERSTEP = vec3(0.003, 0.008, 0.07);


float snoise(vec3 v);
float turbulence(vec3 v);

vec4 createClouds(vec3 position, float time);
vec4 createWater(vec3 Color, vec3 Color2, vec3 position, float time);
vec4 createLandscape(vec3 position, float time);	

vec3 getNormal(vec3 norm, vec4 pos, int kind);
float getnoise(vec3 position);
float getnoise4D(vec4 position);
float snoise(vec4 v);
float CloudExpCurve(float v);
float getNoiseWater(vec3 position);


void main(void) {
    vec3 vEyeVec = -vec3(vP.xyz);
    vec4 finalColor = vec4(0,0,0,0);
    
	
	vec4 matColor = createLandscape(vtxPos.xyz, currentTime);

	vec4 cloud = clamp(createClouds(CLOUDSTEP, currentTime), 0.0, 1.0);
	 matColor += cloud;
    //Ambient Term
    vec4 Ia = vec4(globalAmbientLightColor * matColor.xyz, 1.0);

	

    //iterated over all lights
    const int limit = 3;
    for(int i = 0; i < limit; i++) {

        vec4 lightVec4 = vec4(lightPosition[i], 1.0) - vP;
        vec3 L = normalize(lightVec4.xyz);
		
        //vec3 N = getNormal(vN, vtxPos);
		//vec3 N = getNormal(vN, vec4(vtxPos.x, vtxPos.y, currentTime, 1.0), 2);
		vec3 N = vec3(0.0, 0.0, 0.0);
		N = normalize(vN);
		

         //Lambert's cosine law
         float lambertTerm = dot(N, L);


         //Diffuse Term
         vec4 Id = vec4(0.0,0.0,0.0,1.0);

         //Specular Term
         vec4 Is = vec4(0.0,0.0,0.0,1.0);

         if(lambertTerm > 0.0) //only if lambertTerm is positive
         {
              
              Id =  vec4(matColor.xyz * max(0.0, lambertTerm), 1.0); //add diffuse term
              Id = diffuseReflectionConst * Id;
              Id = vec4(Id.x * lightColor[i].x, Id.y * lightColor[i].y, Id.z * lightColor[i].z, 1);
				
              
				
              vec3 E = normalize(vEyeVec);
              vec3 R = reflect(-L, N);
              float specular = pow( max(dot(R, E), 0.0), shininess);
              
              //Is = vec4(matColor.xyz * specular, 1.0); //add specular term
			  Is = vec4(vec3(1., 1., 1.) * specular, 1.0); //add specular term  
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

vec3 getNormal(vec3 norm, vec4 pos, int kind) {

	vec3 tangent = cross(norm, vec3(1,0,0));
	vec3 bitangent = cross(norm, tangent);
	//water
	if(kind == 1) {
		tangent *= getNoiseWater(pos.xyz) / NORMALFACTOR;
		bitangent *= getNoiseWater(pos.xyz) / NORMALFACTOR;
	} 
	//clouds
	if(kind == 2) {
		tangent *= CloudExpCurve(getnoise(pos.xyz)) / NORMALFACTOR;
		bitangent *= CloudExpCurve(getnoise(pos.xyz)) / NORMALFACTOR;
	}
	//landscape
	if(kind == 3) {
		tangent *= (getnoise(pos.xyz)) / NORMALFACTOR;
		bitangent *= (getnoise(pos.xyz)) / NORMALFACTOR;
	}
 
	return normalize(norm + tangent + bitangent);
}

float CloudExpCurve(float v){
	float c = v - CLOUDCOVER;
	if (c < 0.0) c = 0.0;
	
	float CloudDensity = 1.0 - (pow(CLOUDSHARPNESS, c) * 1.0);

	return CloudDensity;
}

float getnoise(vec3 position) {
	float noise = 0.0;
	
	for(int i = 0; i < OCTAVES; i++) {
		float frequency = pow(2.0,float(i)) * NOISEFREQUENCY;	
		float amplitude = pow(PERSITANCE,float(i));
		noise +=  snoise(frequency * position) * amplitude * NOISEAMPLITUDE;
	
	}
	return noise;
}

float getnoise4D(vec4 position) {
	float noise = 0.0;
	
	for(int i = 0; i < OCTAVES; i++) {
		float frequency = pow(2.0,float(i)) * NOISEFREQUENCY;	
		float amplitude = pow(PERSITANCE,float(i));
		noise +=  snoise(frequency * position) * amplitude * NOISEAMPLITUDE;
	
	}
	return noise;
}

vec4 createClouds(vec3 position, float time) {
	//vec3 temp = position * time;
	//float x = temp.x + CLOUDSCALE * vtxPos.x;
	//float y = temp.y + CLOUDSCALE * vtxPos.y;
	//float z = temp.z + CLOUDSCALE * vtxPos.z;
	float x = vtxPos.x;
	float y = vtxPos.y;
	float z = vtxPos.z;
	float t = time * CLOUDSPEED;
	float noise = CloudExpCurve(getnoise4D(vec4(x, y, z, t)));

	if (noise > 0.0) 
		return vec4(cloudColor * noise, noise);
	return vec4(0.0, 0.0, 0.0, 0.0);
}

float getNoiseWater(vec3 position) {
	float noise = 0.0;
	
	for(int i = 1; i < 4; i++) {
		float frequency = pow(2.0, float(i)) * WATERFREQUENCY;	
		float amplitude = pow(PERSITANCE,float(i));
		noise +=  sin(snoise(frequency * vec3(position.x, position.y, position.z))) * amplitude * WATERAMPLITUDE;
	}

	return noise;
}

vec4 createWater(vec3 Color, vec3 Color2, vec3 position, float time)  {
	vec3 temp = position * time;
	float x = temp.x + WATERSCALE * vtxPos.x;
	float y = temp.y + WATERSCALE * vtxPos.y;
	float z = temp.z + WATERSCALE * vtxPos.z;

	float noise = getNoiseWater(vec3(x, y, z));
	vec4 result = vec4(mix(Color2, Color, noise), 1.0);
	return result;
}


float turbulence(vec3 v) { 
	float sum = snoise(v);
    float f = 1.0;
    for(int i = 0; i < 4; i++){
        v *= 2.0;
        f /= 2.0;
        sum += snoise(v) * f;
    }
    return sum;

}


vec4 createLandscape(vec3 position, float time)  {
	float noise = getnoise(position);
	vec4 result = vec4(0.0, 0.0, 0.0, 0.0);

	
	if (-0.25 > noise) {
		//result = vec4(mix(deeps, shallow, noise), 1.0);
		result = createWater(deeps, shallow, WATERSTEP, time);
	} else if (-0.25 <= noise && 0.0 > noise) {
		result = vec4(mix(shallow, shore, noise), 1.0);
	} else if (0.0 <= noise && 0.0625 > noise) {
		result = vec4(mix(shore, sand, noise), 1.0);
	} else if (0.0625 <= noise && 0.1250 > noise) {
		result = vec4(mix(sand, grass, noise), 1.0);
	} else if (0.1250 <= noise && 0.3750 > noise) {
		result = vec4(mix(grass, dirt, noise), 1.0);
	} else if (0.3750 <= noise && 0.75 > noise) {
		result = vec4(mix(dirt, rock, noise), 1.0);
	} else {
		result = vec4(mix(rock, snow, noise), 1.0);
	}

	return result;
}


















































//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
// 

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}


float permute(float x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

float taylorInvSqrt(float r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
  {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
  }

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }

// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451

float snoise(vec4 v)
  {
  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                       -0.447213595499958); // -1 + 4 * G4

// First corner
  vec4 i  = floor(v + dot(v, vec4(F4)) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C.xxxx
  //  x1 = x0 - i1  + 1.0 * C.xxxx
  //  x2 = x0 - i2  + 2.0 * C.xxxx
  //  x3 = x0 - i3  + 3.0 * C.xxxx
  //  x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

// Permutations
  i = mod289(i); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

  }
