#ifdef GL_ES
precision highp float;
#endif

// input buffers
uniform sampler2D directLightBuffer;
uniform sampler2D positionsBuffer;
uniform sampler2D normalsAndDepthBuffer;
uniform sampler2D diffuseTexture;
uniform sampler2D randomTexture;
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
	return texture2D(normalsAndDepthBuffer, uv).xyz;
}

vec4 matDiffusion(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x / screenWidth, screenPos.y / screenHeight);
	return texture2D(diffuseTexture, uv);
}

vec4 directLighting(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x / screenWidth, screenPos.y / screenHeight);
	return texture2D(directLightBuffer, uv);
}

//Pseudo random function
float rand(vec2 co)
{
	return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43.5453);
}

float randomFloat(float x, float y, float from, float to) {
	return texture2D(randomTexture, vec2(x / screenWidth, y / screenHeight)).w * (to - from) + from;
}

vec3 randomDirection(float x, float y) {
	return 2.0 * texture2D(randomTexture, vec2(x / screenWidth, y / screenHeight)).xyz - 1.0;
}

void main() 
{
	float bias = 0.01;
	vec4 currentPos = spacePos(gl_FragCoord.xy);

	if (currentPos.a == 0.0) // the current point is not in the background
	{
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
		vec3 position = currentPos.xyz;
		vec3 normal = spaceNormal(gl_FragCoord.xy);
		normal = normalize(normal);
	
		float random = rand(position.xy);
		float rand1 =2.0*rand(vec2(random,position.z))-1.0; //Random number between -1.0 and 1.0
		float rand2 = 2.0*rand(vec2(rand1,position.x))-1.0; //Random number between -1.0 and 1.0
		float rand3 = 2.0*rand(vec2(rand2,position.y))-1.0;

		vec3 vector = normalize(vec3(1.0,1.0,1.0));
	//	vec3 vector = normalize(vec3(rand1,rand2,rand3));
		vec3 tangent = normalize(vector - dot(vector,normal)*normal); //Dans le plan orthogonal à la normale
		vec3 bitangent = normalize(cross(normal, tangent));
		mat3 normalSpaceMatrix = mat3(tangent, bitangent, normal);
		//	mat3 normalSpaceMatrixInverse = transpose(normalSpaceMatrix); Transpose does not exist in GLSL 1.1
		mat3 normalSpaceMatrixInverse;
		//Transpose normalSpaceMatrix
		normalSpaceMatrixInverse [0][0] = normalSpaceMatrix [0][0];
		normalSpaceMatrixInverse [1][1] = normalSpaceMatrix [1][1];
		normalSpaceMatrixInverse [2][2] = normalSpaceMatrix [2][2];
		normalSpaceMatrixInverse [0][1] = normalSpaceMatrix [1][0];
		normalSpaceMatrixInverse [0][2] = normalSpaceMatrix [2][0];
		normalSpaceMatrixInverse [1][0] = normalSpaceMatrix [0][1];
		normalSpaceMatrixInverse [1][2] = normalSpaceMatrix [2][1];
		normalSpaceMatrixInverse [2][0] = normalSpaceMatrix [0][2];
		normalSpaceMatrixInverse [2][1] = normalSpaceMatrix [1][2];

		//Number of samples we use for the SSDO algorithm
		const int numberOfSamples = 8;
		const float numberOfSamplesF = 8.0;
		const float rmax = 100.0;
//		float random = rand(vec2(3.8,7.9));

		vec3 directions[numberOfSamples];
		vec3 samplesPosition[numberOfSamples];
		vec4 projectionInCamSpaceSample[numberOfSamples];

		//samplesVisibility[i] = true if sample i is not occulted
		bool samplesVisibility[numberOfSamples];

		//Generate numberOfSamples random directions and random samples (uniform distribution)
		//The samples are in the hemisphere oriented by the normal vector	
		float ii = 0.0;
		for(int i = 0 ; i<numberOfSamples ; i++)
		{
			// random numbers
			float r1 =2.0*rand(vec2(random,position.x))-1.0; //Random number between -1.0 and 1.0
			float r2 = 2.0*rand(vec2(r1,position.y))-1.0; //Random number between -1.0 and 1.0
			float r3 = rand(vec2(r2,position.z));
		//	float r1 =rand(vec2(random,random));
		//	float r2 = rand(vec2(r1,r1));
		//	float r3 = rand(vec2(r2,r2));

			vec3 sampleDirection = vec3(r1, r2, r3);
			sampleDirection = normalize(sampleDirection);
			sampleDirection = normalize(randomDirection(gl_FragCoord.x, (numberOfSamplesF * gl_FragCoord.y + ii) / numberOfSamplesF));
			sampleDirection = normalize(normalSpaceMatrixInverse * sampleDirection); //Put the sampleDirection in the normal Space (positive half space)
		/*	if(dot(sampleDirection, normal) < 0.0)
>>>>>>> 25514e8ad76524f7742446cd9e53856e0eb73ba8
			{
				sampleDirection = -sampleDirection;
			}*/
			directions[i] = sampleDirection;
			// random number
			float r4 = rand(vec2(r3,position.z))*rmax;
		//	float r4 = rand(vec2(r3,r3))*rmax;
			random = r4;
	//		sampleDirection = normal;
			r4 = randomFloat(gl_FragCoord.x, (numberOfSamplesF * gl_FragCoord.y + ii) / numberOfSamplesF, 0.01, rmax);
			
		//	sampleDirection = normalize(normal);
		//	r4 = 1.0;
			samplesPosition[i] = position + r4*sampleDirection;

			//Samples are back projected to the image
			projectionInCamSpaceSample[i] = (cameraProjectionM * cameraViewMatrix * vec4(samplesPosition[i], 1.0));
			vec2 screenSpacePositionSampleNormalized = projectionInCamSpaceSample[i].xy/(projectionInCamSpaceSample[i].w);
			vec2 sampleUV = screenSpacePositionSampleNormalized*0.5 + 0.5; //UV coordinates

			//samplesScreenSpacePosition[i] = (projectionM*modelViewM*vec4(samplesPosition[i], 1.0)).xy;

			//Determines if the sample is visible or not
			vec4 camSpaceSample = cameraViewMatrix*vec4(samplesPosition[i],1.0);
		//	float distanceCameraSample = length((camSpaceSample).xyz);//Normalize with the 4th coordinate
			float distanceCameraSample = length((camSpaceSample).xyz/camSpaceSample.w);//Normalize with the 4th coordinate
			if(sampleUV.x >= 0.0 && sampleUV.x <= 1.0 && sampleUV.y >= 0.0 && sampleUV.y <= 1.0)
			{
				vec4 sampleProjectionOnSurface =  texture2D(positionsBuffer, sampleUV);

				if (sampleProjectionOnSurface.a == 0.0) // not in the background
				{
					vec4 cameraSpaceProjection = cameraViewMatrix * sampleProjectionOnSurface;
					//vec3 sampleProjectionOnSurface = sampleScreenPosTo3DSpace.xyz/sampleScreenPosTo3DSpace.w;
					vec3 sampleNormalOnSurface = normalize(spaceNormal(sampleUV));//Normal

					//	float distanceCameraSampleProjection = length((sampleProjectionInCameraSpace).xyz/sampleProjectionInCameraSpace.w);

					float distanceCameraSampleProjection = texture2D(normalsAndDepthBuffer,sampleUV).a;
					//The distance between the sender and the receiver is clamped to 1.0 to avoid singularity problems
					vec3 transmittanceDirection =	position - sampleProjectionOnSurface.xyz;
					float distanceSenderReceiver = length(transmittanceDirection);
				//	float distanceSenderReceiver = length(samplesPosition[i]-position);
					transmittanceDirection = normalize(transmittanceDirection);

					if(distanceSenderReceiver >1.0)
					{
						distanceSenderReceiver = 1.0;
					}

					if(distanceCameraSample > distanceCameraSampleProjection+bias) //if the sample is inside the surface it is an occluder
					{
						samplesVisibility[i] = false; //The sample is an occluder
						vec4 directLightingVector = texture2D(directLightBuffer,sampleUV);
						vec4 diffusion = texture2D(diffuseTexture, sampleUV);

						vec3 normalSpaceSampleProjectionOnSurface = normalSpaceMatrixInverse * sampleProjectionOnSurface.xyz;
					//	if(true)
						if( normalSpaceSampleProjectionOnSurface.z >= 0.0) //Consider samples projections that are in the positive half space
						{
							gl_FragColor += directLightingVector;
						//	gl_FragColor += pow(rmax, 2.0)/(numberOfSamplesF *pow(distanceSenderReceiver, 2.0) )* max(dot(transmittanceDirection, sampleNormalOnSurface), 0.0) *max(dot(transmittanceDirection, normal), 0.0) * directLightingVector;
						//	gl_FragColor += diffusion*pow(rmax,2.0)*dot(-transmittanceDirection, normal)*max(dot(transmittanceDirection, sampleNormalOnSurface),0.0)/(numberOfSamplesF*pow(distanceSenderReceiver,2.0))*directLightingVector;
						//	gl_FragColor += matDiffusion(gl_FragCoord.xy)*pow(rmax,2.0)*max(dot(transmittanceDirection, normal),0.0)*max(dot(transmittanceDirection, sampleNormalOnSurface),0.0)/(numberOfSamplesF*pow(distanceSenderReceiver,2.0))*directLightingVector;
						//	gl_FragColor += pow(rmax,1.0)*max(dot(-transmittanceDirection, normal),0.0)*max(dot(transmittanceDirection, sampleNormalOnSurface),0.0)/(numberOfSamplesF*pow(distanceSenderReceiver,2.0))*directLightingVector;
						//		gl_FragColor += matDiffusion(gl_FragCoord.xy)*pow(rmax,2.0)*max(dot(sampleDirection, normal),0.0)*max(dot(sampleDirection, sampleNormalOnSurface),0.0)/(numberOfSamplesF*pow(distanceSenderReceiver,2.0))*directLightingVector;
						//	gl_FragColor += diffusion*pow(rmax,2.0)*max(dot(sampleDirection, normal),0.0)*max(dot(sampleDirection, sampleNormalOnSurface),0.0)/(numberOfSamplesF*pow(distanceSenderReceiver,2.0))*directLightingVector;
						//		gl_FragColor = vec4(1.0,0.0,1.0,1.0);
						}
					}
					else
					{
						//Direct illumination is calculted with visible samples
						samplesVisibility[i] = true; //The sample is visible

					//	gl_FragColor += vec4(1.0/numberOfSamplesF, 0.0, 1.0/numberOfSamplesF, 1.0);
					}
				}//End if (sampleProjectionOnSurface.a == 0.0) not in the backgound
				else
				{
				//	gl_FragColor = vec4(1.0, 0.0,0.0,1.0);
				}
			}//End sampleUV between 0.0 and 1.0
			else
			{
			//		gl_FragColor += vec4(0.05, 0.3,0.0,1.0);
			}
			ii += 1.0; // rand
		}//End for on samples
		//Adds direct light to the color
	//	gl_FragColor += directLighting(gl_FragCoord.xy);
	}
	else
	{
		gl_FragColor = vec4(0.2, 0.3, 0.4, 1.0);
	}
}
