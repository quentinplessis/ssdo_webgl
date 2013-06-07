#ifdef GL_ES
precision highp float;
#endif

uniform float PI;

uniform sampler2D shadowMaps[2];
uniform sampler2D shadowMap;
uniform sampler2D shadowMap1;
uniform int shadowMode;

uniform vec2 texelSize;

// Lights
uniform mat4 lightsView[2];
uniform mat4 lightsProj[2];
uniform vec3 lightsPos[2];
uniform vec4 lightsColor[2];
uniform float lightsIntensity[2];
uniform float lightsAngle[2];
uniform float lightsAttenuation[2];
uniform float skyLightIntensity;
uniform vec2 lightNearFar;

// Material properties
uniform float matSpecular;
uniform float shininess;
uniform sampler2D diffuseTexture;
uniform vec4 matSpecularColor;

// 3D point properties
varying vec4 worldPos;
varying vec3 worldNormal;

vec4 matDiffusion(vec2 screenPos) {
	vec2 uv = screenPos * texelSize;
	return texture2D(diffuseTexture, uv);
}

float attenuation(vec3 dir, float div) {
	float dist = length(dir);
	float radiance = 1.0 / (1.0 + pow(dist * div / 100.0, 2.0));
	return clamp(radiance * 10.0, 0.0, 1.0); // * 10.0
}

float influence(vec3 normal, float coneAngle) {
	float minConeAngle = ((360.0 - coneAngle - 10.0) / 360.0) * PI;
	float maxConeAngle = ((360.0 - coneAngle) / 360.0) * PI;
	return smoothstep(minConeAngle, maxConeAngle, acos(normal.z));
}

float lambert(vec3 surfaceNormal, vec3 lightDirNormal) {
	return max(0.0, dot(surfaceNormal, lightDirNormal));
}

vec3 phong(vec3 p, vec3 n, int i) {
	vec3 v = normalize(cameraPosition - p);
	vec3 l = normalize(lightsPos[i] - p);
	float diffuse = max(dot(l, n), 0.0);
	vec3 r = reflect(-l, n);
	float spec = max(dot(r, v), 0.0);
	spec = pow(spec, shininess);
	spec = max(spec, 0.0);	
	return vec3((diffuse * matDiffusion(gl_FragCoord.xy) + spec * matSpecular * matSpecularColor) * lightsColor[i] * lightsIntensity[i]);
}

vec3 skyLight(vec3 normal) {
	return vec3(smoothstep(0.0, PI, PI - acos(normal.y))) * skyLightIntensity;
}

vec3 gamma(vec3 color) {
	return pow(color, vec3(2.2));
}

float adaptDepth(float z) {
	return (z - lightNearFar.x) / (lightNearFar.y - lightNearFar.x);
}

float linstep(float low, float high, float v){
    return clamp((v-low) / (high-low), 0.0, 1.0);
}

float VSM(sampler2D depths, vec2 uv, float compare){
    vec3 moments = texture2D(depths, uv).yzw;
	float linearizedDepth = adaptDepth(moments.z);
	float p = smoothstep(compare-0.02, compare, linearizedDepth);
	if (shadowMode == 1) {
		float variance = moments.x;
		float d = (compare - linearizedDepth) * 0.1;
		float p_max = linstep(0.2, 1.0, variance / (variance + d*d));
		return clamp(max(p, p_max), 0.0, 1.0);
	}
	return step(compare, linearizedDepth + 0.001);
	//return p;
}

void main() {
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	vec3 p = vec3(worldPos);
	vec3 n = normalize(worldNormal);
	for (int i = 0 ; i < 2 ; i++) {
		vec3 lightSpacePos = (lightsView[i] * worldPos).xyz;
		vec3 lightSpacePosNormalized = normalize(lightSpacePos);
		vec4 lightScreenSpacePos = lightsProj[i] * vec4(lightSpacePos, 1.0);
		vec2 lightSSpacePosNormalized = lightScreenSpacePos.xy / lightScreenSpacePos.w;
		vec2 lightUV = lightSSpacePosNormalized * 0.5 + 0.5;
		
		vec4 data;
		float visibility = 0.0;
		if (i == 0) {
			data = texture2D(shadowMap, lightUV);
			if (data.r == 0.0)
				visibility = VSM(shadowMap, lightUV, adaptDepth(length(lightSpacePos)));
		}
		else {
			data = texture2D(shadowMap1, lightUV);
			if (data.r == 0.0)
				visibility = VSM(shadowMap1, lightUV, adaptDepth(length(lightSpacePos)));
		}
		
		if (lightUV.x >= 0.0 && lightUV.x <= 1.0 && lightUV.y >= 0.0 && lightUV.y <= 1.0) {
			vec3 excident = (
				skyLight(n) +
				phong(p, n, i) *
				influence(lightSpacePosNormalized, lightsAngle[i]) *
				attenuation(lightSpacePos, lightsAttenuation[i]) *
				visibility *
				vec3(1.0, 1.0, 1.0)
			);
			gl_FragColor += vec4(gamma(excident), 1.0);
		}
	}
}
