#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D texture;

// 3D point properties
varying vec4 P;
varying vec3 N;

varying vec2 vUv;

float linearizeDepth(float z) {
	float n = 0.1;
	float f = 100.0;
	return (2.0 * n) / (f + n - z * (f  -n));
}

void main() {
	float color = linearizeDepth((texture2D(texture, vUv)).a);
	gl_FragColor = vec4(color, color, color, 1.0);
}
