#ifdef GL_ES
precision highp float;
#endif

// Light properties
uniform vec3 lightPos[2];
uniform vec4 lightColor[2];

// Material properties
uniform float matDiffuse;
uniform vec4 matDiffuseColor;

// 3D point properties
varying vec4 P;
varying vec3 N;

void main() {
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	
	vec3 p = vec3(P);
	vec3 n = normalize(N);
	vec3 v = normalize(-p);
	
	// for each light
	for (int i = 0 ; i < 2 ; i++) {
		vec3 l = normalize(lightPos[i] - p);
		float diffuse = max(dot(l, n), 0.0);
	
		gl_FragColor += diffuse * matDiffuse * matDiffuseColor * lightColor[i];
	}
}
