#ifdef GL_ES
precision highp float;
#endif

//uniform sampler2D texture;

uniform float matDiffuse;
uniform vec4 matDiffuseColor;

// 3D point properties
varying vec4 P;
varying vec3 N;

varying vec2 vUv;

void main() {
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
