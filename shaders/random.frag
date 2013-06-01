#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D texture;
varying vec2 vUv;

void main() {
	vec4 fourBytes = texture2D(texture, vec2(gl_FragCoord.x/1366.0, gl_FragCoord.y / 434.0));
	
	gl_FragColor = vec4(fourBytes.x, fourBytes.y, fourBytes.z, fourBytes.a);
}
