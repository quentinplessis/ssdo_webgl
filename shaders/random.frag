#ifdef GL_ES
precision highp float;
#endif

// screen properties
uniform float screenWidth;
uniform float screenHeight;

uniform sampler2D texture;
varying vec2 vUv;

void main() {
	vec4 fourBytes = texture2D(texture, vec2(gl_FragCoord.x/screenWidth, gl_FragCoord.y / screenHeight));
	
	//fourBytes = fourBytes / 510.0;
	
	gl_FragColor = vec4(fourBytes.x, fourBytes.y, fourBytes.z, 1.0);
}
