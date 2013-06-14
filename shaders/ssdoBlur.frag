#ifdef GL_ES
precision highp float;
#endif

// input buffers
uniform sampler2D ssdoBuffer;
uniform sampler2D positionsBuffer;

// screen properties
uniform vec2 texelOffset;
uniform vec2 texelSize;

uniform int patchSize;
uniform float patchSizeF;

varying vec2 vUv;

vec4 spacePos(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x * texelSize.x, screenPos.y * texelSize.y);
	return texture2D(positionsBuffer, uv);
}

vec4 ssdoBufferValue(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x * texelSize.x, screenPos.y * texelSize.y);
	return texture2D(ssdoBuffer, uv);
}

void main()
{
	const float MAX_BLUR_SIZE = 32.0;
	float halfSize = patchSizeF/2.0;
	vec4 result = vec4(0.0,0.0,0.0,1.0);
	float count = 0.0;
	float offset = 0.0;
/*	for(int i = 0 ; i < patchSize ; i++)
	{
		for(int j = 0 ; j < patchSize ; j++)
		{
			if(spacePos(gl_FragCoord.xy + vec2(i-patchSize/2,j-patchSize/2)).a == 0.0) // not in the Background
			{	
				result += ssdoBufferValue(gl_FragCoord.xy + vec2(i-patchSize/2,j-patchSize/2));
				count += 1.0;	
			}
		}
	}
*/
	for(float i = 0.0 ; i< MAX_BLUR_SIZE ; i++)
	{
		if(i >= patchSizeF)
			break;
		offset = i - halfSize;
	//	if (vOffset.x >= 0.0 && vOffset.y >= 0.0 && vOffset.x <= 1.0 && vOffset.y <= 1.0) {
		if(texture2D(positionsBuffer, vUv + offset*texelOffset).a == 0.0) // not in the Background
		{
			result += texture2D(ssdoBuffer, vUv +offset*texelOffset);
			count += 1.0;
		}
	//	}
	}

	if(count != 0.0)
	{	
		gl_FragColor = result/count;
	}
	else
	{
		gl_FragColor = result;
	}

}

