#ifdef GL_ES
precision highp float;
#endif

// 3D point properties
varying vec4 P;
varying vec3 N;

void main() {
	gl_FragData[0] = P;
}
