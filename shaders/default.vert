#ifdef GL_ES
precision highp float;
#endif

varying vec4 camSpacePos;
varying vec3 worldNormal;

void main() {
	camSpacePos = modelViewMatrix * vec4(position, 1.0);
	worldNormal = normalize(vec3(modelMatrix * vec4(normal, 0.0)));
	//worldNormal = normalMatrix * normal;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
