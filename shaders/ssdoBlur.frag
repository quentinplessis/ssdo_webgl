#ifdef GL_ES
precision highp float;
#endif

const float MAX_BLUR_SIZE_F = 128.0;
const int MAX_BLUR_SIZE = 128;

// input buffers
uniform sampler2D ssdoBuffer;
uniform sampler2D positionsBuffer;
uniform sampler2D normalsAndDepthBuffer;


// screen properties
uniform vec2 texelOffset;

//Blur properties
uniform float gaussianCoeff[MAX_BLUR_SIZE];
uniform int patchSize;
uniform float patchSizeF;
uniform float sigma;

varying vec2 vUv;

const float PI = 3.141592;

void main()
{
	float halfSize = patchSizeF/2.0;
	vec4 result = vec4(0.0,0.0,0.0,1.0);
	float count = 0.0;
	float offset = 0.0;
	vec4 pixelCenter = texture2D(ssdoBuffer, vUv);
	float pixelCenterDepth = texture2D(normalsAndDepthBuffer, vUv).a;
	int ii = 0;

	if(texture2D(positionsBuffer, vUv).a == 0.0) // not in the Background
	{
		for(float i = 0.0 ; i< MAX_BLUR_SIZE_F ; i++)
		{
			if(i >= patchSizeF)
				break;
			offset = i - halfSize;
			if(texture2D(positionsBuffer, vUv + offset*texelOffset).a == 0.0) // not in the Background
			{ 
				vec4 currentPixel = texture2D(ssdoBuffer, vUv +offset*texelOffset);
				result += gaussianCoeff[ii] * currentPixel;
				count += gaussianCoeff[ii];
			}
			ii++;
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

