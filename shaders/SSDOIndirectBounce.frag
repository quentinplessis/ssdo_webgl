#ifdef GL_ES
precision highp float;
#endif

// input buffers
uniform sampler2D directLightBuffer;
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

		vec3 vector = vec3(1.0,1.0,1.0);
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
		normalSpaceMatrixInverse [2][0] = normalSpaceMatrix [2][0];
		normalSpaceMatrixInverse [2][1] = normalSpaceMatrix [1][2];

		//Number of samples we use for the SSDO algorithm
		const int numberOfSamples = 16;
		const float numberOfSamplesF = 16.0;
		const float rmax = 90.0;
		float random = rand(position.xy);

		vec3 directions[numberOfSamples];
		vec3 samplesPosition[numberOfSamples];
		vec4 projectionInCamSpaceSample[numberOfSamples];

		//samplesVisibility[i] = true if sample i is not occulted
		bool samplesVisibility[numberOfSamples];

		//Generate numberOfSamples random directions and random samples (uniform distribution)
		//The samples are in the hemisphere oriented by the normal vector	
		for(int i = 0 ; i<numberOfSamples ; i++)
		{
			// random numbers
			float r1 =rand(vec2(random,position.x));
			float r2 = rand(vec2(r1,position.y));
			float r3 = rand(vec2(r2,position.z));
			vec3 sampleDirection = vec3(r1, r2, r3);
			sampleDirection = normalize(sampleDirection);

			if(dot(sampleDirection, normal) < 0.0)
			{
				sampleDirection = -sampleDirection;
			}
			directions[i] = sampleDirection;
			// random number
			float r4 = rand(vec2(r3,position.z))*rmax;
			random = r4;
	//		sampleDirection = normal;
		//	r4 = 1.0;
			samplesPosition[i] = position + r4*sampleDirection;

			//Samples are back projected to the image
			projectionInCamSpaceSample[i] = (cameraProjectionM * cameraViewMatrix * vec4(samplesPosition[i], 1.0));
			vec2 screenSpacePositionSampleNormalized = projectionInCamSpaceSample[i].xy/(projectionInCamSpaceSample[i].w);
			vec2 sampleUV = screenSpacePositionSampleNormalized*0.5 + 0.5; //UV coordinates

			//samplesScreenSpacePosition[i] = (projectionM*modelViewM*vec4(samplesPosition[i], 1.0)).xy;

			//Determines if the sample is visible or not
			vec4 camSpaceSample = cameraViewMatrix*vec4(samplesPosition[i],1.0);
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
				//	float distanceSenderReceiver = length(transmittanceDirection);
					float distanceSenderReceiver = length(samplesPosition[i]-position);
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
						if( normalSpaceSampleProjectionOnSurface.z >= 0.0) //Consider samples projections that are in the positive half space
						{

					//	gl_FragColor += diffusion*pow(rmax,2.0)*dot(-transmittanceDirection, normal)*max(dot(transmittanceDirection, sampleNormalOnSurface),0.0)/(numberOfSamplesF*pow(distanceSenderReceiver,2.0))*directLightingVector;
						gl_FragColor += matDiffusion(gl_FragCoord.xy)*pow(rmax,2.0)*max(dot(transmittanceDirection, normal),0.0)*max(dot(transmittanceDirection, sampleNormalOnSurface),0.0)/(numberOfSamplesF*pow(distanceSenderReceiver,2.0))*directLightingVector;
					//	gl_FragColor += pow(rmax,2.0)*max(dot(transmittanceDirection, normal),0.0)*max(dot(transmittanceDirection, sampleNormalOnSurface),0.0)/(numberOfSamplesF*pow(distanceSenderReceiver,2.0))*directLightingVector;
					//		gl_FragColor += matDiffusion(gl_FragCoord.xy)*pow(rmax,2.0)*max(dot(sampleDirection, normal),0.0)*max(dot(sampleDirection, sampleNormalOnSurface),0.0)/(numberOfSamplesF*pow(distanceSenderReceiver,2.0))*directLightingVector;
					//	gl_FragColor += diffusion*pow(rmax,2.0)*max(dot(sampleDirection, normal),0.0)*max(dot(sampleDirection, sampleNormalOnSurface),0.0)/(numberOfSamplesF*pow(distanceSenderReceiver,2.0))*directLightingVector;
					//		gl_FragColor = vec4(1.0,0.0,1.0,1.0);
						}
					}
					else
					{
						//Direct illumination is calculted with visible samples
						samplesVisibility[i] = true; //The sample is visible
					//		gl_FragColor += vec4(1.0/numberOfSamplesF, 0.0, 1.0/numberOfSamplesF, 1.0);
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
		}//End for on samples
		//Adds direct light to the color
	//	gl_FragColor += directLighting(gl_FragCoord.xy);
	}
	else
	{
		gl_FragColor = vec4(0.2, 0.3, 0.4, 1.0);
	}
}
