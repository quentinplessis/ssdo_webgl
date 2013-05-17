#ifdef GL_ES
precision highp float;
#endif

// 3D point properties
varying vec4 P;
varying vec3 N;

float linearizeDepth(float z) {
	float n = 0.1;
	float f = 100.0;
	return (2.0 * n) / (f + n - z * (f  -n));
}

void main() {
	vec3 n = (1.0 + N) * 2.0;
	gl_FragColor = vec4(linearizeDepth(gl_FragCoord.z), N);
}
