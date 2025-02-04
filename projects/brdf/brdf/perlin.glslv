attribute vec3 vertexPosition;
attribute vec3 vertexNormal;
attribute vec2 textureCoord;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;

varying vec2 vTC;
varying vec3 vN;
varying vec4 vP;

void main(void) {
    //Transformed vertex position
	vP = modelViewMatrix * vec4(vertexPosition, 1.);
    
	
	vTC = textureCoord;
	//Transformed normal position
    vN = normalMatrix * vertexNormal;
    
    
    //Final vertex position
    gl_Position = projectionMatrix * vP;
}
