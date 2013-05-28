#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D texture;
varying vec2 vUv;

float adaptDepth(float z) {
	float n = 0.1;
	float f = 1000.0;
	return (z - n) / (f - n);
}

void main() {
	float color = adaptDepth(texture2D(texture, vUv).a);
	gl_FragColor = vec4(color, color, color, 1.0);
}
