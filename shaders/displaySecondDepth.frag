#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D texture;
uniform float lightNearFar[2];
varying vec2 vUv;

float adaptDepth(float z) {
	return (z - lightNearFar[0]) / (lightNearFar.[1] - lightNearFar[0]);
}

void main() {
	float color = adaptDepth(texture2D(texture, vUv).a);
	gl_FragColor = vec4(color, color, color, 1.0);
}
