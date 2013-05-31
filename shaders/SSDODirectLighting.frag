#ifdef GL_ES
precision highp float;
#endif

// input buffers
uniform sampler2D positionsBuffer;
uniform sampler2D normalsAndDepthBuffer;
uniform sampler2D diffuseTexture;

// screen properties
uniform float screenWidth;
uniform float screenHeight;

// camera properties
uniform mat4 cameraProjectionM;
uniform mat4 cameraViewMatrix;

// lights properties
uniform vec3 lightsPos[2];
uniform vec4 lightsColor[2];
uniform float lightsIntensity[2];

vec4 spacePos(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x / screenWidth, screenPos.y / screenHeight);
	return texture2D(positionsBuffer, uv);
}

vec3 spaceNormal(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x / screenWidth, screenPos.y / screenHeight);	
	return normalize(texture2D(normalsAndDepthBuffer, uv).xyz);
}

vec4 matDiffusion(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x / screenWidth, screenPos.y / screenHeight);
	return texture2D(diffuseTexture, uv);
}

//Pseudo random function
float rand(vec2 co)
{
	return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43.5453);
}

void main() 
{
	vec4 currentPos = spacePos(gl_FragCoord.xy);
	
	if (currentPos.a == 0.0) // the current point is not in the background
	{
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
		vec3 position = currentPos.xyz;
		vec3 normal = spaceNormal(gl_FragCoord.xy);
		normal = normalize(normal);	
		
		//Number of samples we use for the SSDO algorithm
		const int numberOfSamples = 8;
		const float numberOfSamplesF = 8.0;
		const float rmax = 0.5;
		float random = rand(vec2(1.0, 4.8));

		vec3 directions[numberOfSamples];
		vec3 samplesPosition[numberOfSamples];
		vec4 samplesScreenSpacePosition[numberOfSamples];

		//samplesVisibility[i] = true if sample i is not occulted
		bool samplesVisibility[numberOfSamples];

		//Generate numberOfSamples random directions and random samples (uniform distribution)
		//The samples are in the hemisphere oriented by the normal vector	
		for(int i = 0 ; i<numberOfSamples ; i++)
		{
			// random numbers
			float r1 =rand(vec2(random, random));
			float r2 = rand(vec2(r1,r1));
			float r3 = rand(vec2(r2,r2));
			vec3 sampleDirection = vec3(r1, r2, r3);
			sampleDirection = normalize(sampleDirection);

			if(dot(sampleDirection, normal) < 0.0)
			{
				sampleDirection = -sampleDirection;
			}
			directions[i] = sampleDirection;
		
			// random number
			float r4 = rand(vec2(r3,r3))*rmax;
			random = r4; //The random numbers will be different in the next loop
			samplesPosition[i] = position.xyz + r4*(sampleDirection.xyz);

			//Samples are back projected to the image
			samplesScreenSpacePosition[i] = (cameraProjectionM * cameraViewMatrix * vec4(samplesPosition[i], 1.0));
			vec2 sampleScreenSpacePositionNormalized = samplesScreenSpacePosition[i].xy/(samplesScreenSpacePosition[i].w);
			vec2 sampleUV = sampleScreenSpacePositionNormalized*0.5 + 0.5;
		
			//(projectionM*modelViewM*vec4(samplesPosition[i], 1.0)).xy;

			//Determines if the sample is visible or not
			vec4 currentSampleInCameraSpace = cameraViewMatrix*vec4(samplesPosition[i],1.0);
			float distanceCameraSample = length((currentSampleInCameraSpace).xyz/currentSampleInCameraSpace.w);//Normalize with the 4th coordinate
			vec4 sampleScreenPosTo3DSpace =  texture2D(positionsBuffer, sampleUV);
			if (sampleScreenPosTo3DSpace.a == 0.0) // not in the background
			{
				
				vec4 sampleProjectionInCameraSpace = cameraViewMatrix * sampleScreenPosTo3DSpace;
	
				float distanceCameraSampleProjection = length((sampleProjectionInCameraSpace).xyz/sampleProjectionInCameraSpace.w);
				if(distanceCameraSample > (distanceCameraSampleProjection+0.01)) //if the sample is inside the surface it is an occluder
				{
					samplesVisibility[i] = false; //The sample is an occluder
				}
				else
				{
					//Direct illumination is calculted with visible samples
					samplesVisibility[i] = true; //The sample is visible

					//compute the incoming radiance coming in the direction sampleDirection
					vec4 incomingRadiance = vec4(0.0,0.0,0.0,0.0);
					for(int j = 0 ; j < 2 ; j++)
					{
						//Visibility Test...
						vec3 lightDirection = position - lightsPos[j];
						lightDirection = normalize(lightDirection);
						//Radiance is positive :  in the dot product we use -lightDirection
						incomingRadiance += lightsIntensity[j]*lightsColor[j];
					}
				float nombre = 1.0;
				gl_FragColor +=1.0/nombre * 2.0*matDiffusion(gl_FragCoord.xy)*max(dot(normal, sampleDirection),0.0)*incomingRadiance/numberOfSamplesF;
				}	
			}
			else
			{
				gl_FragColor += vec4(1.0,0.0,0.0,1.0);
			}
		}
	}
	else
	{
		gl_FragColor = vec4(0.2, 0.3, 0.4, 1.0);
	}
}

