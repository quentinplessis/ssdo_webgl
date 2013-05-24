#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D shadowMaps[2];
uniform sampler2D shadowMap;
uniform sampler2D shadowMap1;

// lights
uniform mat4 lightsView[2];
uniform mat4 lightsProj[2];
uniform vec3 lightsPos[2];
uniform mat3 lightsRot[2];
uniform vec4 lightsColor[2];
uniform float lightsIntensity[2];
uniform float lightsAngle[2];
uniform float skyLightIntensity;
uniform float lightsAttenuation[2];

// Material properties
uniform float matDiffuse;
uniform float matSpecular;
uniform float shininess;
uniform vec4 matDiffuseColor;
uniform vec4 matSpecularColor;

uniform float PI;

// 3D point properties
varying vec4 worldPos;
varying vec3 N;

float attenuation(vec3 dir, float div) {
	float dist = length(dir);
	float radiance = 1.0/(1.0+pow(dist * div / 100.0, 2.0));
	return clamp(radiance*10.0, 0.0, 1.0); // * 10.0
}

float influence(vec3 normal, float coneAngle) {
	float minConeAngle = ((360.0-coneAngle-10.0)/360.0)*PI;
	float maxConeAngle = ((360.0-coneAngle)/360.0)*PI;
	return smoothstep(minConeAngle, maxConeAngle, acos(normal.z));
}

float lambert(vec3 surfaceNormal, vec3 lightDirNormal) {
	return max(0.0, dot(surfaceNormal, lightDirNormal));
}

vec3 phong(vec3 p, vec3 n, vec3 lightSpacePos, int i) {
	vec3 v = normalize(cameraPosition-p);
	vec3 l = normalize(-lightSpacePos);
	float diffuse = max(dot(l, n), 0.0);
	vec3 r = reflect(-l, n);
	float spec = max(dot(r, v), 0.0);
	spec = pow(spec, shininess);
	spec = max(0.0, spec);
	spec = 0.0;
				
	return vec3((diffuse * matDiffuse * matDiffuseColor + spec * matSpecular * matSpecularColor) * lightsColor[i] * lightsIntensity[i]);
}

vec3 skyLight(vec3 normal) {
	return vec3(smoothstep(0.0, PI, PI - acos(normal.y))) * skyLightIntensity;
}

vec3 gamma(vec3 color){
	return pow(color, vec3(2.2));
}

void main() {
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	
	vec3 p = vec3(worldPos);
	vec3 n = normalize(N);
	for (int i = 0 ; i < 2 ; i++) {
		// P : position in world space
		vec3 lightSpacePos = (lightsView[i] * worldPos).xyz;
		vec3 lightSpacePosNormalized = normalize(lightSpacePos);
		vec4 lightScreenSpacePos = lightsProj[i] * vec4(lightSpacePos, 1.0);
		vec2 lightSSpacePosNormalized = lightScreenSpacePos.xy / lightScreenSpacePos.w;
		vec2 lightUV = lightSSpacePosNormalized * 0.5 + 0.5;
		
		vec3 lightSurfaceNormal = lightsRot[i] * N;
		
		float lightFar = 1000.0;
		float storedDepth = lightFar;
		vec4 data;
		if (i == 0)
			data = texture2D(shadowMap, lightUV);
		else
			data = texture2D(shadowMap1, lightUV);
		if (data.r == 0.0) // not in the background
			storedDepth = data.a;
			
		float depth = clamp(storedDepth / lightFar, 0.0, 1.0);
		float currentDepth = clamp(length(lightSpacePos) / lightFar, 0.0, 1.0);
		
		if (lightUV.x >= 0.0 && lightUV.x <= 1.0 && lightUV.y >= 0.0 && lightUV.y <= 1.0) {
			float bias = 0.001;
			float illuminated = step(currentDepth, depth+bias);
            vec3 excident = (
				skyLight(N) +
                //lambert(lightSurfaceNormal, -lightSpacePosNormalized) *
                phong(p, n, lightSpacePos, i) *
				influence(lightSpacePosNormalized, lightsAngle[i]) *
				attenuation(lightSpacePos, lightsAttenuation[i]) *
                illuminated *
				vec3(1.0, 1.0, 1.0)
            );
            gl_FragColor += vec4(gamma(excident), 1.0);
		}
	}
}
