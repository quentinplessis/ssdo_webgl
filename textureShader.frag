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
	gl_FragColor = texture2D(texture, vUv);
	
	//gl_FragColor = vec4(vec3(linearizeDepth(gl_FragCoord.z)), 1.0);
	
}
