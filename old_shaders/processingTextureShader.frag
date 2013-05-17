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

vec3 decodeN(float n) {
	vec3 bit_shift = vec3(1.0 / (16384.0 * 16384.0), 1.0 / 16384.0, 1.0);
	vec3 bit_mask = vec3(0.0, 16384.0, 16384.0);
	//vec3 res = fract(n * bit_shift);
	//res -= res.xyz * bit_mask;
	vec3 res = floor(n * bit_shift);
	res.y = res.y - 16384.0 * res.x;
	res.z = res.z - 16384.0 * res.y - 16384.0 * 16384.0 * res.x;
	//res -= res * bit_mask;
	return res;
}

void main() {
	vec4 color = texture2D(texture, vUv);
    
	/*if (abs(color.r - 10000.0) +
        abs(color.g - 10000.0) +
        abs(color.b - 10000.0) +
        abs(color.a - 10000.0) < 8.0) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    } else {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }*/
	
	if (vUv.x < 0.5) {
		gl_FragColor = vec4(color.r, color.r, color.r, 1.0);
	}
	else {
		gl_FragColor = vec4(color.gba, 1.0);
	}
	
	
}
