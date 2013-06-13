#ifdef GL_ES
precision highp float;
#endif

// input buffers
uniform sampler2D ssdoBuffer;
uniform sampler2D positionsBuffer;

// screen properties
uniform float screenWidth;
uniform float screenHeight;

vec4 spacePos(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x / screenWidth, screenPos.y / screenHeight);
	return texture2D(positionsBuffer, uv);
}

vec4 ssdoBufferValue(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x / screenWidth, screenPos.y / screenHeight);
	return texture2D(ssdoBuffer, uv);
}


void main()
{
	int patchSize = 1;
	vec4 currentPos = spacePos(gl_FragCoord.xy);
	vec3 position = currentPos.xyz;
	vec4 result = vec4(0.0,0.0,0.0,1.0);
	float count = 0.0;

	for(int i = 0 ; i < patchSize ; i++)
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

	if(count != 0.0)
	{	
		gl_FragColor = result/count;
	}
	else
	{
		gl_FragColor = result;
	}
}

