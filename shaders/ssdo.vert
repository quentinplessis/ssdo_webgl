#ifdef GL_ES
precision highp float;
#endif

varying vec4 P;
varying vec3 N;

varying mat4 modelViewM;
//varying mat4 projectionM;
varying mat4 fullMatrix;

void main() {
	P = modelViewMatrix * vec4(position, 1.0);
	N = normalMatrix * normal;
	
	modelViewM = modelViewMatrix;
	//projectionM = projectionMatrix;
	fullMatrix = projectionMatrix * modelViewMatrix;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}