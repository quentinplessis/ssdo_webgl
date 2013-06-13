#ifdef GL_ES
precision highp float;
#endif

uniform vec2 texelSize;
uniform sampler2D shadowMap;
uniform int orientation;
uniform float blurSize;

varying vec2 vUv;

void main() {
	float halfBlur = blurSize / 2.0;
	const float MAX_BLUR_SIZE = 50.0;
	
	vec2 texelOffset;
	if (orientation == 0)
		texelOffset = vec2(texelSize.x, 0.0);
	else
		texelOffset = vec2(0.0, texelSize.y);
	
	float count = 0.0;
	vec4 data = vec4(0.0, 0.0, 0.0, 0.0);
	for (float i = 0.0 ; i < MAX_BLUR_SIZE ; i++) {
		if (i >= blurSize)
			break;
		float offset = i - halfBlur;
		vec2 vOffset = vUv + (texelOffset * offset);
		if (vOffset.x >= 0.0 && vOffset.y >= 0.0 && vOffset.x <= 1.0 && vOffset.y <= 1.0) {
			vec4 dataS = texture2D(shadowMap, vOffset);
			if (dataS.r == 0.0) {
				data += dataS;
				count++;
			}
		}
	}
	if (count > 0.0)
		gl_FragData[0] = data / count;
	else
		gl_FragData[0] = texture2D(shadowMap, vUv);
}

