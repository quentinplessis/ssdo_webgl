#ifdef GL_ES
precision highp float;
#endif

const float MAX_BLUR_SIZE_F = 128.0;
const int MAX_BLUR_SIZE = 128;

// input buffers
uniform sampler2D ssdoBuffer;
uniform sampler2D positionsBuffer;
uniform sampler2D normalsAndDepthBuffer;

//Coefficients
uniform float gaussianCoeff[26];

// screen properties
uniform vec2 texelOffset;
uniform vec2 texelSize;

uniform int patchSize;
uniform float patchSizeF;

varying vec2 vUv;

const float PI = 3.141592;

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
	const float sigma = 10.0;
	float halfSize = patchSizeF/2.0;
	vec4 result = vec4(0.0,0.0,0.0,1.0);
	float count = 0.0;
	float offset = 0.0;
	vec4 pixelCenter = texture2D(ssdoBuffer, vUv);
	float pixelCenterDepth = texture2D(normalsAndDepthBuffer, vUv).a;
	int ii = 0;
//	float jj = 0.0;

/*	for(int i = 0 ; i < patchSize ; i++)
	{
		for(int j = 0 ; j < patchSize ; j++)
		{
			if(spacePos(gl_FragCoord.xy + vec2(i-patchSize/2,j-patchSize/2)).a == 0.0) // not in the Background
			{	
			//	result += ssdoBufferValue(gl_FragCoord.xy + vec2(i-patchSize/2,j-patchSize/2));
			//	count += 1.0;	
			float offsetX = ii -halfSize;
			float offsetY = jj -halfSize;
			vec4 currentPixel = texture2D(ssdoBuffer, vUv  +vec2(i-patchSize/2,j-patchSize/2));
			float currentPixelDepth = texture2D(normalsAndDepthBuffer, vUv + vec2(i-patchSize/2,j-patchSize/2)).a;
			float depthCoeff = pixelCenterDepth/(0.01+abs(currentPixelDepth-pixelCenterDepth));
		//	float depthCoeff = 1.0/(0.01 + abs(currentPixelDepth-pixelCenterDepth));
			float distanceToCenter = length(pixelCenter.xyz-currentPixel.xyz)/length(vec3(1.0,1.0,1.0));
			result += 1.0/(sqrt(2.0*PI)*sigma)*exp(-(offsetX*offsetX+offsetY*offsetY)/(2.0*pow(sigma,2.0)))*depthCoeff*currentPixel;
			count += 1.0/(sqrt(2.0*PI)*sigma)*exp(-(offsetX*offsetX+offsetY*offsetY)/(2.0*pow(sigma,2.0)))*depthCoeff;

			}
			jj += 1.0;
		}
		ii += 1.0;
	}
*/
	if(texture2D(positionsBuffer, vUv).a == 0.0) // not in the Background
	{
		for(float i = 0.0 ; i< MAX_BLUR_SIZE_F ; i++)
		{
			if(i >= patchSizeF)
				break;
			offset = i - halfSize;
	//		if (vOffset.x >= 0.0 && vOffset.y >= 0.0 && vOffset.x <= 1.0 && vOffset.y <= 1.0) {
			if(texture2D(positionsBuffer, vUv + offset*texelOffset).a == 0.0) // not in the Background
			{ 
				vec4 currentPixel = texture2D(ssdoBuffer, vUv +offset*texelOffset);
			//	float currentPixelDepth = texture2D(normalsAndDepthBuffer, vUv +offset*texelOffset).a;
			//	float depthCoeff = pixelCenterDepth/(0.01+abs(currentPixelDepth-pixelCenterDepth));
			//	float depthCoeff = 1.0/(0.01 + abs(currentPixelDepth-pixelCenterDepth));
			//	float distanceToCenter = length(pixelCenter.xyz-currentPixel.xyz)/length(vec3(1.0,1.0,1.0));
				result += gaussianCoeff[ii] * currentPixel;
				count += gaussianCoeff[ii];
			//	result += currentPixel;
			//	count += 1.0;
			}
			ii++;
	//	}
		}
	}
	else
	{
		result = vec4(0.2,0.3,0.4,1.0);
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

