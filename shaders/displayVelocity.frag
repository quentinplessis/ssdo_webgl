#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D texture;
varying vec2 vUv;

uniform float screenWidth;
uniform float screenHeight;

void main() {
	vec2 velocity = texture2D(texture, vUv).xy * 0.5 + 0.5;
	//velocity = vec2(velocity.x / screenWidth, velocity.y / screenHeight);
	gl_FragData[0] = vec4(velocity, 1.0, 1.0);
}
