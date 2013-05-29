#ifdef GL_ES
precision highp float;
#endif

// input buffers
uniform sampler2D positionsBuffer;
uniform sampler2D normalsAndDepthBuffer;
uniform sampler2D diffuseTexture;
uniform sampler2D shadowMap;
uniform sampler2D shadowMap1;

// screen properties
uniform float screenWidth;
uniform float screenHeight;

// camera properties
uniform mat4 cameraProjectionM;
uniform mat4 cameraViewMatrix;

// lights properties
uniform mat4 lightsView[2];
uniform mat4 lightsProj[2];
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
	float bias = 0.001;
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
		const float rmax = 1.0;
		float random = rand(vec2(1.0, 4.8));
		
		vec3 directions[numberOfSamples];
		vec3 samplesPosition[numberOfSamples];
		//	vec4 samplesScreenSpacePosition[numberOfSamples];
		vec4 projectionInCamSpaceSample[numberOfSamples];

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
		//	sampleDirection = normal;
	//		sampleDirection = -normal;	
			// random number
			float r4 = rand(vec2(r3,r3))*rmax;
			random = r4; //The random numbers will be different in the next loop
	//		r4 = 0.1;
			samplesPosition[i] = position + r4*sampleDirection;

			//Samples are back projected to the image
			projectionInCamSpaceSample[i] = (cameraProjectionM * cameraViewMatrix * vec4(samplesPosition[i], 1.0));
			vec2 screenSpacePositionSampleNormalized = projectionInCamSpaceSample[i].xy/(projectionInCamSpaceSample[i].w);
			vec2 sampleUV = screenSpacePositionSampleNormalized*0.5 + 0.5;

			//(projectionM*modelViewM*vec4(samplesPosition[i], 1.0)).xy;

			//Determines if the sample is visible or not
			vec4 camSpaceSample = cameraViewMatrix*vec4(samplesPosition[i],1.0);
			float distanceCameraSample = length((camSpaceSample).xyz/camSpaceSample.w);//Normalize with the 4th coordinate

			if(sampleUV.x >= 0.0 && sampleUV.x <= 1.0 && sampleUV.y >= 0.0 && sampleUV.y <= 1.0)
			{
				vec4 sampleProjectionOnSurface =  texture2D(positionsBuffer, sampleUV);
				if (sampleProjectionOnSurface.a == 0.0) // not in the background
				{

					vec4 cameraSpaceSampleProjection = cameraViewMatrix * sampleProjectionOnSurface;

			//		float distanceCameraSampleProjection = length((cameraSpaceSampleProjection).xyz/cameraSpaceSampleProjection.w);
				//	float	distanceCameraSampleProjection = linearizeDepth(texture2D(normalsAndDepthBuffer,sampleUV).a);
				//	distanceCameraSample = 600.0;
					float	distanceCameraSampleProjection = texture2D(normalsAndDepthBuffer,sampleUV).a;
					if(distanceCameraSample > distanceCameraSampleProjection+bias) //if the sample is inside the surface it is an occluder
					{
						samplesVisibility[i] = false; //The sample is an occluder
					//	gl_FragColor += vec4(0.1, 0.1, 0.1,1.0);
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
							vec4 lightSpacePos4 = lightsView[j] * vec4(samplesPosition[i],1.0);
							vec3 lightSpacePos = lightSpacePos4.xyz/lightSpacePos4.w;
							vec3 lightSpacePosNormalized = normalize(lightSpacePos);
							vec4 lightScreenSpacePos = lightsProj[j] * vec4(lightSpacePos, 1.0);
							vec2 lightSSpacePosNormalized = lightScreenSpacePos.xy / lightScreenSpacePos.w;
							vec2 lightUV = lightSSpacePosNormalized * 0.5 + 0.5;

							float lightFar = 1000.0;
							float storedDepth = lightFar;
							vec4 data;
							if (j == 0)
							{
								data = texture2D(shadowMap, lightUV);
							}
							else
							{
								data = texture2D(shadowMap1, lightUV);
							}

							if (data.r == 0.0) // not in the background
							{
								storedDepth = data.a;
							

								float depth = clamp(storedDepth / lightFar, 0.0, 1.0);
								float currentDepth = clamp(length(lightSpacePos) / lightFar, 0.0, 1.0);

								if (lightUV.x >= 0.0 && lightUV.x <= 1.0 && lightUV.y >= 0.0 && lightUV.y <= 1.0) 
								{
									if(currentDepth <= depth + bias)//The light j sees the sample
									{
										incomingRadiance += lightsIntensity[j]*lightsColor[j];
									//	incomingRadiance += max(dot(sampleDirection, -lightDirection),0.0)*lightsIntensity[j]*lightsColor[j];	
					//					gl_FragColor += vec4(0.1, 0.0, 0.1,1.0);
									}
									else
									{ 
					//					incomingRadiance = vec4(0.0, 0.0, 0.0,0.0);
					//					gl_FragColor += vec4(0.1, 0.1, 0.1,1.0);
									}	

								}
							}
						}//End for on lights
						float nombre = 1.0;
						gl_FragColor +=1.0/nombre * 2.0*matDiffusion(gl_FragCoord.xy)*max(dot(normal, sampleDirection),0.0)*incomingRadiance/numberOfSamplesF;
					}	
				}//End 	if (sampleProjectionOnSurface.a == 0.0) not in the background
				else
				{
					gl_FragColor = vec4(1.0,0.0,0.0,1.0);
				}
			}//End SampleUV between  0.0 and 0.1
			else
			{
				gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
			}
		}//End for on samples
	}//End if (currentPos.a == 0.0) // the current point is not in the background
	else
	{
		gl_FragColor = vec4(0.2, 0.3, 0.4, 1.0);
	}
}

