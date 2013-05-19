#ifdef GL_ES
precision highp float;
#endif

varying vec4 P;
varying vec3 N;

void main() {
	float depth = length(P.xyz);
	gl_FragData[0] = vec4(0.0, 0.0, 0.0, depth);
}
