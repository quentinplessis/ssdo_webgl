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
	// the normal is contained in the RGB channels and the depth in the A channel
	vec4 data = texture2D(texture, vUv);
	float depth = linearizeDepth(data.a);
	vec3 coloredNormal = (data.rgb) * 2.0;
	
	if (vUv.x < 0.5) {
		gl_FragColor = vec4(depth, depth, depth, 1.0);
	}
	else {
		gl_FragColor = vec4(coloredNormal, 1.0);
	}
}
