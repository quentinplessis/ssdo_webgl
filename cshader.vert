// switch on high precision floats
#ifdef GL_ES
precision highp float;
#endif

// projectionMatrix
// modelViewMatrix
// position
// normal

varying vec4 P;
varying vec3 N;

void main() {
	//P = vec4(position, 1.0);
	//N = normal;
	P = modelViewMatrix * vec4(position, 1.0);
	N = normalMatrix * normal;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}