#ifdef GL_ES
precision highp float;
#endif

// input buffers
uniform sampler2D positionsBuffer;
uniform sampler2D normalsAndDepthBuffer;

// screen properties
uniform float screenWidth;
uniform float screenHeight;

varying vec4 camSpacePos;

vec4 spacePos(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x / screenWidth, screenPos.y / screenHeight);
	return texture2D(positionsBuffer, uv);
}

float spaceDepth(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x / screenWidth, screenPos.y / screenHeight);	
	return normalize(texture2D(normalsAndDepthBuffer, uv).a);
}

bool equals(float number1, float number2, float epsilon)
{
	bool isEqual = number1 < (number2 + epsilon) && number1 > (number2-epsilon);
	return isEqual;
}

void main() 
{
	float zBufferDepth = spaceDepth(gl_FragCoord.xy);
	float currentDepth = length(camSpacePos.xyz);
//	float currentDepth = gl_FragCoord.z;
//	float currentDepth = gl_FragDepth;
	if(equals(currentDepth, zBufferDepth, 0.01))
	{
		discard;
	}
	else
	{
		gl_FragData[0] = vec4(currentDepth, currentDepth, currentDepth, currentDepth);
	}

		
}
