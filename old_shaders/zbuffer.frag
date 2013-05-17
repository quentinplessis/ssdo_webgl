#ifdef GL_ES
precision highp float;
#endif

// 3D point properties
varying vec4 P;
varying vec3 N;

//varying vec2 vUv;

float linearizeDepth(float z) {
	float n = 0.1;
	float f = 1000.0;
	float num = z - n;
	float den = f - n;
	
	return (2.0 * n) / (f + n - z * (f - n));
}

void main() {
	gl_FragColor = vec4(vec3(linearizeDepth(gl_FragCoord.z)), 1.0);
}
