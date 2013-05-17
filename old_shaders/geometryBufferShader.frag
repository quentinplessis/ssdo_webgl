#ifdef GL_ES
precision mediump float;
#endif

//#extension GL_EXT_separate_shader_objects : enable

//layout(location = 0) out vec4 depth;

// 3D point properties
varying vec4 P;
varying vec3 N;

float linearizeDepth(float z) {
	float n = 0.1;
	float f = 1000.0;
	float num = z - n;
	float den = f - n;
	
	return (2.0 * n) / (f + n - z * (f - n));
}

float encodeN(vec3 n) {
	vec3 bit_shift = vec3(16384.0 * 16384.0, 16384.0, 1.0);
    float res = dot((1.0 + n) * 2.0, bit_shift);
    return res;
    //return (1.0 + n.x) * 2.0 + 256.0 * ((1.0 + n.y) * 2.0 + 256.0 * (1.0 + n.z) * 2.0);
}

void main() {
	gl_FragColor = vec4(linearizeDepth(gl_FragCoord.z), encodeN(N), 1.0, 1.0);
}
