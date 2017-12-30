#define OCTAVES 8
attribute vec3 vertexPosition;
attribute vec3 vertexNormal;
attribute vec2 textureCoord;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;

//uniform float NOISEFREQUENCY;
//uniform float NOISEAMPLITUDE;
//uniform float PERSITANCE;
uniform float OFFSET;

varying vec2 vTC;
varying vec3 vN;
//varying vec3 vEye;
varying vec4 vP;
varying vec4 vtxPos;

float snoise(vec3 v);
float getnoise(vec3 position);
float createLandscape(vec3 position);
bool isLandscape(vec3 position);
vec3 getNormal(vec3 norm, vec4 pos);

void main(void) {
    //Transformed vertex position
	vP = modelViewMatrix * vec4(vertexPosition, 1.);
    vtxPos = vec4(vertexPosition, 1.);
	
	vTC = textureCoord;
	//Transformed normal position
    vN = normalMatrix * vertexNormal;

	if (isLandscape(vtxPos.xyz)) {
		vN = getNormal(vN, vtxPos);
	}
    
	//displace the vertex according to the normal
	vP = vP + vec4(vN * createLandscape(vtxPos.xyz) * OFFSET, 0.0);

    
    //Final vertex position
    gl_Position = projectionMatrix * vP;
}


vec3 getNormal(vec3 norm, vec4 pos) {

	vec3 tangent = cross(norm, vec3(1,0,0));
	vec3 bitangent = cross(norm, tangent);

	tangent *= (getnoise(pos.xyz)) / 5.0;
	bitangent *= (getnoise(pos.xyz)) / 5.0;
 
	return normalize(norm + tangent + bitangent);
}



float createLandscape(vec3 position)  {
	float noise = getnoise(position);
	float result = 0.0;

	
	if (-0.25 > noise) {
		//result = vec4(mix(deeps, shallow, noise), 1.0);
		result = 0.0;
	} else if (-0.25 <= noise && 0.0 > noise) {
		result = 0.0;
	} else if (0.0 <= noise && 0.0625 > noise) {
		result = 0.0;
	} else if (0.0625 <= noise && 0.1250 > noise) {
		result = 0.0;
	} else if (0.1250 <= noise && 0.3750 > noise) {
		result = 0.0;
	} else if (0.3750 <= noise && 0.75 > noise) {
		result = noise;
	} else {
		result = noise;
	}

	return result;
}

bool isLandscape(vec3 position)  {
	float noise = getnoise(position);
	float result = 0.0;

	
	if (-0.25 > noise) {
		return false;
	} else if (-0.25 <= noise && 0.0 > noise) {
		return false;
	} else if (0.0 <= noise && 0.0625 > noise) {
		return true;
	} else if (0.0625 <= noise && 0.1250 > noise) {
		return true;
	} else if (0.1250 <= noise && 0.3750 > noise) {
		return true;
	} else if (0.3750 <= noise && 0.75 > noise) {
		return true;
	} else {
		return true;
	}

	return false;
}



float getnoise(vec3 position) {
	float noise = 0.0;
	
	for(int i = 0; i < OCTAVES; i++) {
		float frequency = pow(2.0,float(i)) * 0.9;	
		float amplitude = pow(0.62,float(i));
		noise +=  snoise(frequency * position) * amplitude * 0.85;
	
	}
	return noise;
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
