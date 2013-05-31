#ifdef GL_ES
precision highp float;
#endif

varying vec4 worldPos;
varying vec3 worldNormal;
varying vec2 vUv;

void main() {
	worldPos = modelMatrix * vec4(position, 1.0);
	worldNormal = normalize(vec3(modelMatrix * vec4(normal, 0.0)));
	vUv = uv;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}