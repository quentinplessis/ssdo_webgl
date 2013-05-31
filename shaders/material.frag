#ifdef GL_ES
precision highp float;
#endif

// Lights properties
uniform vec3 lightsPos[2];
uniform vec4 lightsColor[2];
uniform float lightsIntensity[2];

// Material properties
uniform float matDiffuse;
uniform vec4 matDiffuseColor;
uniform sampler2D texture;
uniform int isTextured;

// 3D point properties
varying vec4 worldPos;
varying vec3 worldNormal;
varying vec2 vUv;

void main() {
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	vec3 p = vec3(worldPos);
	vec3 n = normalize(worldNormal);
	
	vec3 l = normalize(lightsPos[0] - p);
	float diffuse = max(dot(l, n), 0.0);
	diffuse = 1.0;
	gl_FragColor += diffuse * matDiffuse * matDiffuseColor;
	if (isTextured == 1)
		gl_FragColor *= texture2D(texture, vUv);
}
