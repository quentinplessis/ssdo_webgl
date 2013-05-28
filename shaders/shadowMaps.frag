#ifdef GL_ES
precision highp float;
#endif

// 3D point properties
varying vec4 camSpacePos;
varying vec3 worldNormal;

void main() {
	gl_FragData[0] = vec4(0.0, 0.0, 0.0, length(camSpacePos.xyz));
}
