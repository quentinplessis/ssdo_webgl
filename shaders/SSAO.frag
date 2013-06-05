#ifdef GL_ES
precision highp float;
#endif

// input buffers
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

float randomFloat(float x, float y, float from, float to) {
	return texture2D(randomTexture, vec2(x / screenWidth, y / screenHeight)).w * (to - from) + from;
}

vec3 randomDirection(float x, float y) {
	vec3 data = texture2D(randomTexture, vec2(x / screenWidth, y / screenHeight)).xyz ;
	data.xy = 2.0 * data.xy -1.0;
//	return 2.0 * texture2D(randomTexture, vec2(x / screenWidth, y / screenHeight)).xyz - 1.0;
	return data;
}

void main() 
{
	float bias = 0.01;
	vec4 currentPos = spacePos(gl_FragCoord.xy);
		float visibilityFactor = 0.0;
		
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

	if (currentPos.a == 0.0) // the current point is not in the background
	{
		vec3 position = currentPos.xyz;
		vec3 normal = normalize(spaceNormal(gl_FragCoord.xy));

		vec3 vector = normalize(vec3(0.0,1.0,1.0));
	//	vec3 tangent = normalize(vector - dot(vector,normal)*normal); //Dans le plan orthogonal à la normale
		vec3 tangent = normalize(cross(vector, normal));
		vec3 bitangent = normalize(cross(normal, tangent));
		mat3 normalSpaceMatrix = mat3(tangent, bitangent, normal);
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
		const float rmax = 5.0;
		
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
			vec3 sampleDirection = vec3(0.0,0.0,0.0);

			sampleDirection = normalize(randomDirection(gl_FragCoord.x, (numberOfSamplesF * gl_FragCoord.y + ii) / numberOfSamplesF));

			sampleDirection = normalize(normalSpaceMatrix * sampleDirection); //Put the sampleDirection in the normal Space (positive half space)
			directions[i] = sampleDirection;
		
			float r4 = randomFloat(gl_FragCoord.x, (numberOfSamplesF * gl_FragCoord.y + ii) / numberOfSamplesF, 0.01, rmax);
		
			samplesPosition[i] = position + bias*normal + r4*sampleDirection;

			//Samples are back projected to the image
			projectionInCamSpaceSample[i] = (cameraProjectionM * cameraViewMatrix * vec4(samplesPosition[i], 1.0));
			vec2 screenSpacePositionSampleNormalized = projectionInCamSpaceSample[i].xy/(projectionInCamSpaceSample[i].w);
			vec2 sampleUV = screenSpacePositionSampleNormalized*0.5 + 0.5;

			//Determines if the sample is visible or not
			vec4 camSpaceSample = cameraViewMatrix*vec4(samplesPosition[i],1.0);
		//	float distanceCameraSample = length((camSpaceSample).xyz);//Normalize with the 4th coordinate
			float distanceCameraSample = length((camSpaceSample).xyz/camSpaceSample.w);//Normalize with the 4th coordinate

			if(sampleUV.x >= 0.0 && sampleUV.x <= 1.0 && sampleUV.y >= 0.0 && sampleUV.y <= 1.0)
			{
				vec4 sampleProjectionOnSurface =  texture2D(positionsBuffer, sampleUV);
				if (sampleProjectionOnSurface.a == 0.0) // not in the background
				{

					vec4 cameraSpaceSampleProjection = cameraViewMatrix * sampleProjectionOnSurface;

					float	distanceCameraSampleProjection = texture2D(normalsAndDepthBuffer,sampleUV).a;
					if(distanceCameraSample > distanceCameraSampleProjection+bias) //if the sample is inside the surface it is an occluder
					{
						samplesVisibility[i] = false; //The sample is an occluder
					}
					else
					{
						//Direct illumination is calculted with visible samples
						samplesVisibility[i] = true; //The sample is visible
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
	
	//Phong shading with occlusion
	vec3 v = normalize(cameraPosition - position);
	
	// for each light
	for (int i = 0 ; i < 2 ; i++) 
	{
		gl_FragColor +=
			visibilityFactor * matDiffusion(gl_FragCoord.xy) * lightsColor[i] * lightsIntensity[i];
	}

	}//End if (currentPos.a == 0.0) // the current point is not in the background
	else
	{
		gl_FragColor = vec4(0.2, 0.3, 0.4, 1.0);
	}
		
}
