#ifdef GL_ES
precision highp float;
#endif

// 3D point properties
varying vec4 P;
varying vec3 N;

void main() {
	gl_FragColor += vec4(2.0 * N.x - 1.0, 2.0 * N.y - 1.0, 2. * N.z - 1.0, 1.0);
}
