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
	// the normal is contained in the RGB channels and the depth in the A channel
	vec4 data = texture2D(texture, vUv);
	
	if (vUv.x < 0.5) {
		float depth = adaptDepth(data.a);
		gl_FragColor = vec4(depth, depth, depth, 1.0);
	}
	else {
		vec3 coloredNormal = data.rgb * 0.5 + 0.5;
		gl_FragColor = vec4(coloredNormal, 1.0);
	}
}
