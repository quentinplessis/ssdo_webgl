#ifdef GL_ES
precision highp float;
#endif

// lights properties
uniform vec3 lightsPos[2];
uniform vec4 lightsColor[2];
uniform float lightsIntensity[2];

// Material properties
uniform float matDiffuse;
uniform float shininess;
uniform vec4 matDiffuseColor;

// 3D point properties
varying vec4 P;
varying vec3 N;

void main (void) {
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	
	vec3 p = vec3(P);
	vec3 n = normalize(N);
	
	for (int i = 0 ; i < 2 ; i++) {
		vec3 l = normalize(lightsPos[i] - p);
		vec3 r = reflect(-l, n);
		vec3 v = normalize(-p);
		float diffuse = max(dot(l, n), 0.0);
		float spec = max(dot(r, v), 0.0);
		spec = pow(spec, shininess);
		spec = max(spec, 0.0);
		
		if (!(dot(n, v) < 0.25 && dot(n, v) > -0.25)) {
			if (spec > 0.5)
				gl_FragColor += lightsColor[i] * lightsIntensity[i];
			else
				gl_FragColor += matDiffuse * matDiffuseColor * lightsColor[i] * lightsIntensity[i];
		}
	}
}
 
