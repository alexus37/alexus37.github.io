#define OCTAVES 2
#define eps 0.00001


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
uniform float PERSITANCE;
uniform float WOODPARAMETER2;
uniform float WOODPARAMETER3;
uniform float WOODHIGHFREQX;
uniform float WOODHIGHFREQY;
uniform float WOODHIGHFREQZ;

varying vec2 vTC;
varying vec3 vN;
varying vec4 vP;
varying vec4 vtxPos;
varying vec3 vtxNorm;

float snoise(vec3 v);
vec4 createWood(vec3 woodColor, vec3 woodColor2, vec3 position);
vec3 getNormal(vec3 norm, vec4 pos);
float getnoise(vec3 position);

void main(void) {
    vec3 vEyeVec = -vec3(vP.xyz);
    vec4 finalColor = vec4(0,0,0,0);
    vec3 woodColor = vec3(139.0 / 255.0, 69.0 / 255.0,19.0 / 255.0);
	vec3 woodColor2 = vec3(205.0 / 255.0, 133.0 / 255.0,63.0 / 255.0);
	
	vec4 matColor  = createWood(woodColor, woodColor2, vtxPos.xyz);
    //Ambient Term
    vec4 Ia = vec4(globalAmbientLightColor * matColor.xyz, 1.0);

	

    //iterated over all lights
    const int limit = 3;
    for(int i = 0; i < limit; i++) {

        vec4 lightVec4 = vec4(lightPosition[i], 1.0) - vP;
        vec3 L = normalize(lightVec4.xyz);
        vec3 N = getNormal(vN, vtxPos);
		//vec3 N = normalize(vN);
		

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
              
              Is = vec4(matColor.xyz * specular, 1.0); //add specular term 
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

vec3 getNormal(vec3 norm, vec4 pos) {

	vec3 tangent = cross(norm, vec3(1,0,0));
	vec3 bitangent = cross(norm, tangent);

	tangent *= getnoise(pos.xyz) / 10.0;
	bitangent *= getnoise(pos.xyz) / 10.0;

	return normalize(norm + tangent + bitangent);
}

float getnoise(vec3 position) {
	float noise = 0.0;
	
	for(int i = 0; i < OCTAVES; i++) {
		float frequency = pow(2.0,float(i));	
		float amplitude = pow(PERSITANCE,float(i));
		noise +=  snoise(frequency * position) * amplitude;
	
	}
	float g = (noise + 1.0) * WOODPARAMETER2;
	float grain = WOODPARAMETER3 * (g - floor(g));
	grain += snoise(position);
	vec3 highFre = vec3(position.x * WOODHIGHFREQX, position.y* WOODHIGHFREQY, position.z*WOODHIGHFREQZ);
	//float bumps = snoise(highFre);
	/*float bumps = 0.0;
	
	for(int i = 0; i < OCTAVES; i++) {
		float frequency = pow(2.0,float(i));	
		float amplitude = pow(PERSITANCE,float(i));
		bumps +=  snoise(frequency * highFre) * amplitude;
	
	}*/
	float bumps = snoise(highFre);
    if (bumps < 0.5) {
		bumps = 0.0;
	} else {
		grain = bumps;
	}

	return grain;
}
vec4 createWood(vec3 woodColor, vec3 woodColor2, vec3 position) {
	/*
	//new staff
	vec3 noisetxr = position;
	position = (1.0 / 8.0) * position;
	float noise = 0.0;
	for(int i = 0; i < 2; i++)
		noise += ((1.0 / pow(PERSITANCE,float(i))) * ((snoise(position * pow(2.0,float(i)) ) * 2.0 ) - 1.0 ) );

	//float final_noise = abs(noise);
	float final_noise = noise;

	float grain = cos(dot(noisetxr.xy, noisetxr.xy) + final_noise * WOODPARAMETER2);
   	return vec4(woodColor - pow(grain, WOODPARAMETER3) / 2.0 , 1.0); //raising the cosine to higher power
	
	*/
	
	float noise = getnoise(position) ;
	vec4 result = vec4(0.0,0.0,0.0,1.0);
	//float g = (noise + 1.0) * WOODPARAMETER2;
	//float grain = WOODPARAMETER3 * (g - floor(g));
	

	
	//result = vec4(woodColor * grain, 1.0);
	result = vec4(mix(woodColor,woodColor2,  noise), 1.0);
	//return result;
	/*
	vec3 highFre = vec3(position.x*1.0, position.y*50.0, position.z*20.0);
	float bumps = snoise(highFre);
    if (bumps < 0.5) {
		bumps = 0.0;
	} else {
		result = vec4(mix(woodColor,woodColor2,  bumps), 1.0);
	}
	*/
	return result;
	
}



vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
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

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
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
