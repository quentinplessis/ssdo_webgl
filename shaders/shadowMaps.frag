#ifdef GL_ES
precision highp float;
#endif

// 3D point properties
varying vec4 camSpacePos;
varying vec3 worldNormal;

void main() {
	float depth = length(camSpacePos.xyz);
//	float dx = dFdx(depth);
//	float dy = dFdy(depth);
//	float var = pow(depth, 2.0) + 0.25 * (dx*dx + dy*dy);
	float var = 0.0;
	gl_FragData[0] = vec4(0.0, var, 0.0, depth);
}
