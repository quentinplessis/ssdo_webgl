#ifdef GL_ES
precision highp float;
#endif

// Material properties
uniform float matDiffuse;
uniform vec4 matDiffuseColor;

// 3D point properties
varying vec4 P;
varying vec3 N;

void main() {
	gl_FragColor = matDiffuse * matDiffuseColor;
}
