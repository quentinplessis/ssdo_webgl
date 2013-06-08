#ifdef GL_ES
precision highp float;
#endif

// input buffers
uniform sampler2D positionsBuffer;
uniform sampler2D normalsAndDepthBuffer;
uniform sampler2D secondDepthBuffer;
uniform sampler2D randomTexture;
uniform sampler2D shadowMap;
uniform sampler2D shadowMap1;

// screen properties
uniform vec2 texelSize;

// camera properties
uniform mat4 cameraProjectionM;
uniform mat4 cameraViewMatrix;

// lights properties
uniform mat4 lightsView[2];
uniform mat4 lightsProj[2];
uniform vec3 lightsPos[2];
uniform vec4 lightsColor[2];
uniform float lightsIntensity[2];

//3D point properties
varying vec2 vUv;

float randomFloat(float x, float y, float from, float to) 
{
	return texture2D(randomTexture, vec2(x * texelSize.x, y * texelSize.y)).w * (to - from) + from;
}

vec3 randomDirection(float x, float y) 
{
//	vec3 data = texture2D(randomTexture, vec2(x /screenWidth, y / screenHeight)).xyz ;
	vec3 data = texture2D(randomTexture, vec2(x *texelSize.x, y * texelSize.y)).xyz ;
	data.xy = 2.0 * data.xy -1.0;
//	return 2.0 * texture2D(randomTexture, vec2(x / screenWidth, y / screenHeight)).xyz - 1.0;
	return data;
}

void main() 
{
	float bias = 0.01;
	vec4 currentPos = texture2D(positionsBuffer,vUv);
	float visibilityFactor = 0.0;
	if (currentPos.a == 0.0) // the current point is not in the background
	{
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
		vec3 position = currentPos.xyz;
		vec3 normal = normalize(texture2D(normalsAndDepthBuffer, vUv).xyz);
	
		vec3 vector = normalize(vec3(0.0,1.0,1.0));
	//	vec3 tangent = normalize(vector - dot(vector,normal)*normal); //Dans le plan orthogonal à la normale
		vec3 tangent = normalize(cross(vector, normal));
		vec3 bitangent = normalize(cross(normal, tangent));
		mat3 normalSpaceMatrix = mat3(tangent, bitangent, normal);
	
		//Number of samples we use for the SSAO algorithm
		const int numberOfSamples = 8;
		const float numberOfSamplesF = 8.0;
		const float rmax = 5.0;
		
	//	vec3 directions[numberOfSamples];
		vec3 samplesPosition[numberOfSamples];
		vec4 projectionInCamSpaceSample[numberOfSamples];

		//samplesVisibility[i] = true if sample i is not occulted
	//	bool samplesVisibility[numberOfSamples];

		//Generate numberOfSamples random directions and random samples (uniform distribution)
		//The samples are in the hemisphere oriented by the normal vector	
		float ii = 0.0;
		for(int i = 0 ; i<numberOfSamples ; i++)
		{
			// random numbers
			vec3 sampleDirection = vec3(0.0,0.0,0.0);

		//	sampleDirection = normalize(randomDirection(gl_FragCoord.x, (numberOfSamplesF * gl_FragCoord.y + ii) / numberOfSamplesF));
			
			sampleDirection = randomDirection(gl_FragCoord.x, (numberOfSamplesF * gl_FragCoord.y + ii) / numberOfSamplesF);
			sampleDirection = normalize(normalSpaceMatrix * sampleDirection); //Put the sampleDirection in the normal Space (positive half space)
		//	directions[i] = sampleDirection;
		
			float r4 = randomFloat(gl_FragCoord.x, (numberOfSamplesF * gl_FragCoord.y + ii) / numberOfSamplesF, 0.01, rmax);
		
			samplesPosition[i] = position + bias*normal + r4*sampleDirection;

			//Samples are back projected to the image
			vec4 camSpaceSample = cameraViewMatrix*vec4(samplesPosition[i],1.0);
			projectionInCamSpaceSample[i] = (cameraProjectionM * camSpaceSample);
			vec2 screenSpacePositionSampleNormalized = projectionInCamSpaceSample[i].xy/(projectionInCamSpaceSample[i].w);
			vec2 sampleUV = screenSpacePositionSampleNormalized*0.5 + 0.5;

			//Determines if the sample is visible or not
			float distanceCameraSample = length((camSpaceSample).xyz/camSpaceSample.w);//Normalize with the 4th coordinate

			if(sampleUV.x >= 0.0 && sampleUV.x <= 1.0 && sampleUV.y >= 0.0 && sampleUV.y <= 1.0)
			{
				vec4 sampleProjectionOnSurface =  texture2D(positionsBuffer, sampleUV);
				if (sampleProjectionOnSurface.a == 0.0) // not in the background
				{
					float	distanceCameraSampleProjection = texture2D(normalsAndDepthBuffer,sampleUV).a;
					if(distanceCameraSample > distanceCameraSampleProjection+bias) //if the sample is inside the surface it is an occluder
					{
					//	samplesVisibility[i] = false; //The sample is an eventual occluder
						//Depth peeling
						float secondDepth = texture2D(secondDepthBuffer, sampleUV).a;
						if(distanceCameraSample>secondDepth)//The sample is behind an object
						{
							//samplesVisibility[i] = true; //The sample is visible
							visibilityFactor += 1.0/numberOfSamplesF;
						}	
					}
					else
					{
						//Direct illumination is calculted with visible samples
					//	samplesVisibility[i] = true; //The sample is visible
						visibilityFactor += 1.0/numberOfSamplesF;
					}	
				}//End 	if (sampleProjectionOnSurface.a == 0.0) not in the background
				else//If the sample is in the background it is always visible
				{
					visibilityFactor += 1.0/numberOfSamplesF;
				}
			}//End SampleUV between  0.0 and 0.1
			else
			{
			//	gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
			}
		
			ii += 1.0; // rand
		}//End for on samples
	}//End if (currentPos.a == 0.0) // the current point is not in the background
	else
	{
		gl_FragColor = vec4(0.2, 0.3, 0.4, 1.0);
	}
		
	gl_FragColor = vec4(visibilityFactor, visibilityFactor, visibilityFactor, 1.0);
	
}
