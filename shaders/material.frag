#ifdef GL_ES
precision highp float;
#endif

// Material properties
uniform float matDiffuse;
uniform vec4 matDiffuseColor;
uniform sampler2D texture;
uniform int isTextured;

// 3D point properties
varying vec4 camSpacePos;
varying vec3 worldNormal;
varying vec2 vUv;

void main() {
	gl_FragColor = matDiffuse * matDiffuseColor;
	if (isTextured == 1)
		gl_FragColor *= texture2D(texture, vUv);
}
