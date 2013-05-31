#ifdef GL_ES
precision highp float;
#endif

uniform int isTextured;
uniform sampler2D texture;

varying vec4 camSpacePos;
varying vec3 worldNormal;
varying vec2 vUv;

void main() {
	camSpacePos = modelViewMatrix * vec4(position, 1.0);
	worldNormal = normalize(vec3(modelMatrix * vec4(normal, 0.0)));
	//if (isTextured == 1)
		//vUv = uv;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}