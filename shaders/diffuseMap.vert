#ifdef GL_ES
precision highp float;
#endif

uniform int isTextured;
uniform sampler2D texture;

varying vec4 P;
varying vec3 N;
varying vec2 vUv;

void main() {
	P = modelViewMatrix * vec4(position, 1.0);
	N = normal;
	if (isTextured == 1)
		vUv = uv;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}