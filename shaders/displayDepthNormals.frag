#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D texture;

// 3D point properties
varying vec4 P;
varying vec3 N;

varying vec2 vUv;

void main() {
	vec4 color = texture2D(texture, vUv);

	if (vUv.x < 0.5) {
		gl_FragColor = vec4(color.r, color.r, color.r, 1.0);
	}
	else {
		gl_FragColor = vec4(color.gba, 1.0);
	}
}
