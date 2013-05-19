#ifdef GL_ES
precision highp float;
#endif

varying vec4 P;
varying vec3 N;

void main() {
	P = modelViewMatrix * vec4(position, 1.0);
	N = normalMatrix * normal;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}