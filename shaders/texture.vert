#ifdef GL_ES
precision highp float;
#endif

varying vec4 P;
varying vec3 N;

varying vec2 vUv;

void main() {
	vUv = uv;
	P = modelViewMatrix * vec4(position, 1.0);
	N = normalMatrix * normal;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}