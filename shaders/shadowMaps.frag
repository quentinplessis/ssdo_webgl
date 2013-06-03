#ifdef GL_ES
precision highp float;
#endif

// 3D point properties
varying vec4 camSpacePos;
varying vec3 worldNormal;

float adaptDepth(float z) {
	float n = 0.1;
	float f = 1000.0;
	return (z - n) / (f - n);
}

void main() {
	float depth = length(camSpacePos.xyz);
	float d = adaptDepth(depth);
	float dx = dFdx(d);
	float dy = dFdy(d);
	float var = pow(d, 2.0) + 0.25 * (dx*dx + dy*dy);
	gl_FragData[0] = vec4(0.0, 0.0, var, depth);
}
