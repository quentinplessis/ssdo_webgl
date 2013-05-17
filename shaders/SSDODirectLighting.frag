#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D positionsAndNormalsBuffer;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 cameraPosition;
uniform vec3 lightsPos[8];
uniform vec3 lightsColor[8];
uniform float lightsIntensity[8];

uniform float matDiffuse;
uniform vec4 matDiffuseColor;

// 3D point properties
varying vec4 P;
varying vec3 N;

varying vec2 vUv;

void main() 
{
	//Number of samples we use for the SSDO algorithm
	const int numberOfSamples = 8;
	const float rmax = 8.0;

	vec3 directions[numberOfSamples];
	vec3 samplesPosition[numberOfSamples];
	vec2 samplesScreenSpacePosition[numberOfSamples];

	//samplesVisibility[i] = true if sample i is not occulted
	bool samplesVisibility[numberOfSamples];
	

	//Generate numberOfSamples random directions and random samples (uniform distribution)
	//The samples are in the hemisphere oriented by the normal vector	
	for(int i = 0 ; i<numberOfSamples ; i++)
	{
		vec3 sampleDirection = vec3(random(-1.0,1.0), random(-1.0,1.0), random(-1.0,1.0));
		normalize(sampleDirection);
		
		if(dot(sampleDirection, normal) < 0)
		{
			sampleDirection = -sampleDirection;
		}
		directions[i] = sampleDirection;
		samplesPosition[i] = p + random(0.0,rmax)*sampleDirection;

		//Samples are back projected to the image
		samplesScreenSpacePosition[i] = projectionMatrix*modelViewMatrix*samplesPosition[i];
		
		//Determines if the sample is visible or not
		float distanceCameraSample = length(cameraPosition-samplesPosition[i]);
		vec3 sampleProjectionOnSurface = texture2D(positionsAndNormalBuffer, sampleScreenSpacePosition[i]);
		float distanceCameraSampleProjection = length(cameraPosition-sampleProjectionOnSurface);
		
		if(distanceCameraSample > distanceCameraSampleProjection) //if the sample is inside the surface it is an occluder
		{
			samplesVisibility[i] = false; //The sample is an occluder
		}
		else
		{
			//Direct illumination is calculted with visible samples
			samplesVisibility[i] = true; //The sample is visible
			
			//compute the incoming radiance coming in the direction sampleDirection
			vec4 incomingRadiance = vec4(0.0,0.0,0.0,0.0);
			for(int j = O ; j < numberOfLights < j++)
			{
				//Visibility Test...
				incomingRadiance += dot(sampleDirection, p-lightsPos[j])*lightsIntensity[j]*lightsColor[j];
			}
			gl_FragColor += 2*matDiffuse*dot(normal, sampleDirection)/numberOfSamples*incomingRadiance;
		}
	}
	 		
}
