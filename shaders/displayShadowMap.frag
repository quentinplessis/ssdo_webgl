#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D texture;

// 3D point properties
varying vec4 P;
varying vec3 N;

varying vec2 vUv;

float adaptDepth(float z) {
	float n = 0.1;
	float f = 1000.0;
	return (z - n) / (f - n);
}

void main() {
	vec4 depth = texture2D(texture, vUv);
	if (depth.r == 0.0) { // not in the background
		//if (depth.a >= 0.0) {
		float vx = 0.7;
		//if (vUv.x <= 0.3) {
		//if (!(vUv.x - vx < 0.01 && vUv.x - vx > -0.01)) {
		float color = adaptDepth(depth.a);
		gl_FragColor = vec4(color, color, color, 1.0);
		//}
		//else
			//gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
	}
	else
		gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
