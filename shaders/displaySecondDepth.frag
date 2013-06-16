#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D texture;
uniform vec2 lightNearFar;
varying vec2 vUv;

float adaptDepth(float z) {
	return (z - lightNearFar.x) / (lightNearFar.y - lightNearFar.x);
}

void main() {
	float color = adaptDepth(texture2D(texture, vUv).a);
	gl_FragColor = vec4(color, color, color, 1.0);
}
