#ifdef GL_ES
precision highp float;
#endif

// Light properties
uniform vec3 lightPos[2];
uniform vec4 lightColor[2];

// Material properties
uniform float matDiffuse;
uniform float matSpecular;
uniform float matEmissive;
uniform float shininess;
uniform vec4 matDiffuseColor;
uniform vec4 matSpecularColor;
uniform vec4 matEmissiveColor;

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
		vec3 r = reflect(-l, n);
		float spec = max(dot(r, v), 0.0);
		spec = pow(spec, shininess);
		spec = max(0.0, spec);
		
		gl_FragColor +=
			(diffuse * matDiffuse * matDiffuseColor
			+ spec * matSpecular * matSpecularColor) * lightColor[i]
			+ matEmissive * matEmissiveColor;
	}
}
