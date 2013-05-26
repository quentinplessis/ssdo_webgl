#ifdef GL_ES
precision highp float;
#endif

// input buffers
uniform sampler2D directLightBuffer;
uniform sampler2D positionsBuffer;
uniform sampler2D normalsAndDepthBuffer;
uniform sampler2D diffuseTexture;

// screen properties
uniform float screenWidth;
uniform float screenHeight;

// camera properties
uniform mat4 cameraProjectionM;
uniform mat4 cameraViewMatrix;
uniform mat4 cameraViewMatrixInverse;
//uniform vec3 cameraPosition;

// lights properties
uniform vec3 lightsPos[2];
uniform vec4 lightsColor[2];
uniform float lightsIntensity[2];

// 3D point properties
varying vec4 P;
varying vec3 N;

vec4 spacePos(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x / screenWidth, screenPos.y / screenHeight);
	return texture2D(positionsBuffer, uv);
}

vec3 spaceNormal(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x / screenWidth, screenPos.y / screenHeight);	
	vec3 normalWorldSpace = (cameraViewMatrixInverse* vec4(texture2D(normalsAndDepthBuffer, uv).xyz, 1.0)).xyz;
	normalWorldSpace = -normalize(normalWorldSpace);
	return normalWorldSpace;	
//	return texture2D(normalsAndDepthBuffer, uv).xyz;
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

void main() {
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
			float r1 =rand(vec2(1.0,4.8));
			float r2 = rand(vec2(r1,r1));
			float r3 = rand(vec2(r2,r2));
			vec3 sampleDirection = vec3(r1, r2, r3);
			normalize(sampleDirection);

			if(dot(sampleDirection, normal) < 0.0)
			{
				sampleDirection = -sampleDirection;
			}
			directions[i] = sampleDirection;
			// random number
			float r4 = rand(vec2(r3,r3))*rmax;
			samplesPosition[i] = position + r4*sampleDirection;

			//Samples are back projected to the image
			samplesScreenSpacePosition[i] = (cameraProjectionM * cameraViewMatrix * vec4(samplesPosition[i], 1.0));
			vec2 sampleScreenSpacePositionNormalized = samplesScreenSpacePosition[i].xy/(samplesScreenSpacePosition[i].w);
			vec2 sampleUV = sampleScreenSpacePositionNormalized*0.5 + 0.5;

			//samplesScreenSpacePosition[i] = (projectionM*modelViewM*vec4(samplesPosition[i], 1.0)).xy;

			//Determines if the sample is visible or not
			vec4 currentSampleInCameraSpace = cameraViewMatrix*vec4(samplesPosition[i],1.0);
			float distanceCameraSample = length((currentSampleInCameraSpace).xyz/currentSampleInCameraSpace.w);//Normalize with the 4th coordinate
			vec4 sampleScreenPosTo3DSpace =  texture2D(positionsBuffer, sampleUV);
			if (sampleScreenPosTo3DSpace.a == 0.0) // not in the background
			{
				vec4 sampleProjectionInCameraSpace = cameraViewMatrix * sampleScreenPosTo3DSpace;
				//vec3 sampleProjectionOnSurface = sampleScreenPosTo3DSpace.xyz/sampleScreenPosTo3DSpace.w;
				vec3 sampleNormalOnSurface = normalize(spaceNormal(sampleUV));//Normal
					
				float distanceCameraSampleProjection = length((sampleProjectionInCameraSpace).xyz/sampleProjectionInCameraSpace.w);
				
				//The distance between the sender and the receiver is clamped to 1.0 to avoid singularity problems
				float distanceSenderReceiver = length(position-samplesPosition[i]);
				if(distanceSenderReceiver >1.0)
				{
					distanceSenderReceiver = 1.0;
				}

				if(distanceCameraSample >= distanceCameraSampleProjection && dot(normal, sampleNormalOnSurface) < 0.0) //if the sample is inside the surface it is an occluder
				{
					samplesVisibility[i] = false; //The sample is an occluder
					vec4 directLightingVector = directLighting(sampleUV);
					vec4 incomingRadiance = vec4(0.0,0.0,0.0,0.0);
					for(int j = 0 ; j < 2 ; j++)
					{
						//Visibility Test...
						vec3 lightDirection = position - lightsPos[j];
						lightDirection = normalize(lightDirection);
						incomingRadiance += max(dot(sampleDirection, lightDirection),0.0)*lightsIntensity[j]*lightsColor[j];
					}

					gl_FragColor += matDiffusion(gl_FragCoord.xy)*pow(rmax,2.0)*max(dot(sampleDirection, normal),0.0)*max(dot(sampleDirection, sampleNormalOnSurface),0.0)/(numberOfSamplesF*pow(distanceSenderReceiver,2.0))*incomingRadiance*directLightingVector;
				}
				else
				{
					//Direct illumination is calculted with visible samples
					samplesVisibility[i] = true; //The sample is visible
				}
			}
			else
			{
				gl_FragColor = vec4(1.0, 0.0,0.0,1.0);
			}
		}
		//Adds direct light to the color
		gl_FragColor += directLighting(gl_FragCoord.xy);
	}
	else
	{
		gl_FragColor += vec4(0.0, 1.0, 1.0, 1.0);
	}
		
	
}
