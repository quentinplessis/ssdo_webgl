#ifdef GL_ES
precision highp float;
#endif

#define NUMBER_OF_SAMPLES_MAX 32

// input buffers
uniform sampler2D positionsBuffer;
uniform sampler2D normalsAndDepthBuffer;
uniform sampler2D secondDepthBuffer;
uniform sampler2D diffuseTexture;
uniform sampler2D randomTexture;
uniform sampler2D randomDirectionsTexture;
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

//SSDO parameters
uniform vec3 randomDirections[NUMBER_OF_SAMPLES_MAX];
uniform int numberOfSamples;
uniform float numberOfSamplesF;
uniform float rmax;

float bias = 0.01;

float randomFloat(float x, float y, float from, float to) {
//	return texture2D(randomTexture, vec2(x * texelSize.x, y * texelSize.y)).w * (to - from) + from;
	return texture2D(randomDirectionsTexture, vec2(x * texelSize.x*100.0, 0.0)).w * (to - from) + from;
}

//vec3 randomDirection(float x, float y) {
//	vec3 data = texture2D(randomTexture, vec2(x * texelSize.x, y * texelSize.y)).xyz ;
//	vec3 data = texture2D(randomDirectionsTexture, vec2(x * texelSize.x* 100.0, 0.0)).xyz ;
//	data.xy = 2.0 * data.xy -1.0;
//	return data;
//}

vec3 randomDirection(float x) {
//	vec3 data = texture2D(randomTexture, vec2(x * texelSize.x, y * texelSize.y)).xyz ;
	vec3 data = texture2D(randomDirectionsTexture, vec2(x, 0.0)).xyz ;
	data.xy = 2.0 * data.xy -1.0;
	return data;
}

float randomNumberForDirectionsTexture(float x, float y) {
//	vec3 data = texture2D(randomTexture, vec2(x * texelSize.x, y * texelSize.y)).xyz ;
	float number = texture2D(randomTexture, vec2(x/10.0, 0.0)).w; //Choose x but yzw are also random.
	return number;
}


//compute the incoming radiance coming to the sample
vec4 computeRadiance(vec3 samplePosition)
{
	vec4 incomingRadiance = vec4(0.0,0.0,0.0,0.0);
	for(int j = 0 ; j < 2 ; j++)
	{
		//Visibility Test...
		vec4 lightSpacePos4 = lightsView[j] * vec4(samplePosition,1.0);
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
				}
			}
		}
	}
	return incomingRadiance;
}

void main() 
{
	vec4 currentPos = texture2D(positionsBuffer, vUv);

	if (currentPos.a == 0.0) // the current point is not in the background
	{
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
		vec3 position = currentPos.xyz;
		vec3 normal = normalize(texture2D(normalsAndDepthBuffer, vUv).xyz);
	
		float r1 = 2.0*texture2D(randomTexture, vec2(gl_FragCoord.x * texelSize.x, gl_FragCoord.y * texelSize.y)).x-1.0; 
		float r2 = 2.0*texture2D(randomTexture, vec2(gl_FragCoord.x * texelSize.x, gl_FragCoord.y * texelSize.y)).y-1.0;
		float r3 = 2.0*texture2D(randomTexture, vec2(gl_FragCoord.x * texelSize.x, gl_FragCoord.y * texelSize.y)).z-1.0; 
		
	//	vec3 vector = normalize(vec3(0.0,1.0,1.0));
		vec3 vector = normalize(vec3(r1,r2,r3));
		vec3 tangent = normalize(vector - dot(vector,normal)*normal); //Dans le plan orthogonal à la normale
	//	vec3 tangent = normalize(cross(vector, normal));
		vec3 bitangent = normalize(cross(normal, tangent));
		mat3 normalSpaceMatrix = mat3(tangent, bitangent, normal);
	//	mat3 normalSpaceMatrixInverse;

		//Transpose normalSpaceMatrix = inverse matrix
	/*	normalSpaceMatrixInverse [0][0] = normalSpaceMatrix [0][0];
		normalSpaceMatrixInverse [1][1] = normalSpaceMatrix [1][1];
		normalSpaceMatrixInverse [2][2] = normalSpaceMatrix [2][2];
		normalSpaceMatrixInverse [0][1] = normalSpaceMatrix [1][0];
		normalSpaceMatrixInverse [0][2] = normalSpaceMatrix [2][0];
		normalSpaceMatrixInverse [1][0] = normalSpaceMatrix [0][1];
		normalSpaceMatrixInverse [1][2] = normalSpaceMatrix [2][1];
		normalSpaceMatrixInverse [2][0] = normalSpaceMatrix [0][2];
		normalSpaceMatrixInverse [2][1] = normalSpaceMatrix [1][2];
*/
		vec3 directions[NUMBER_OF_SAMPLES_MAX];
		vec3 samplesPosition[NUMBER_OF_SAMPLES_MAX];
		vec4 projectionInCamSpaceSample[NUMBER_OF_SAMPLES_MAX];
		float visibility = 0.0;

		//samplesVisibility[i] = true if sample i is not occulted
		bool samplesVisibility[NUMBER_OF_SAMPLES_MAX];

		vec3 sampleDirection = vec3(0.0,0.0,0.0);
		float r4;
		vec4 camSpaceSample;
		vec2 screenSpacePositionSampleNormalized;
		vec2 sampleUV;

		float distanceCameraSample;
		vec4 sampleProjectionOnSurface;
		float distanceCameraSampleProjection;
		float secondDepth;
		//Generate numberOfSamples random directions and random samples (uniform distribution)
		//The samples are in the hemisphere oriented by the normal vector	
		float ii = 0.0;
		for(int i = 0 ; i<numberOfSamples ; i++)
		{
			// random numbers

		//	sampleDirection = normalize(randomDirection(gl_FragCoord.x, (numberOfSamplesF * gl_FragCoord.y + ii) / numberOfSamplesF));
		//	float remainder = gl_FragCoord.x-10.0*gl_FragCoord.x/10.0;
		//	sampleDirection = normalize(randomDirection(remainder));
		//	sampleDirection = normalize(randomDirection(randomNumberForDirectionsTexture(gl_FragCoord.x, gl_FragCoord.y), ii));
			sampleDirection = randomDirections[i];
			sampleDirection = normalize(normalSpaceMatrix * sampleDirection); //Put the sampleDirection in the normal Space (positive half space)gl_FragCoord.x/10.0-10.0*gl_FragCoord.x/10.0,
		//	directions[i] = sampleDirection;
		//	r4 = randomFloat(gl_FragCoord.x, (numberOfSamplesF * gl_FragCoord.y + ii) / numberOfSamplesF, 0.01, rmax);
			r4 = texture2D(randomTexture, vec2(gl_FragCoord.x * texelSize.x, gl_FragCoord.y * texelSize.y)).w*rmax; 
		//	r4 = texture2D(randomDirectionsTexture, vec2(randomNumberForDirectionsTexture(gl_FragCoord.x, gl_FragCoord.y),0.0)).w * rmax;

//	return texture2D(randomTexture, vec2(x * texelSize.x, y * texelSize.y)).w * (to - from) + from;
		//	samplesPosition[i] = position + bias*normal + r4*sampleDirection;

			samplesPosition[i] = position + bias*normal + r4 * sampleDirection;
			//Samples are back projected to the image
			camSpaceSample = cameraViewMatrix*vec4(samplesPosition[i],1.0);
			projectionInCamSpaceSample[i] = (cameraProjectionM * camSpaceSample);
			screenSpacePositionSampleNormalized = projectionInCamSpaceSample[i].xy/(projectionInCamSpaceSample[i].w);
			sampleUV = screenSpacePositionSampleNormalized*0.5 + 0.5;

			//Determines if the sample is visible or not
			distanceCameraSample = length((camSpaceSample).xyz/camSpaceSample.w);//Normalize with the 4th coordinate

			if(sampleUV.x >= 0.0 && sampleUV.x <= 1.0 && sampleUV.y >= 0.0 && sampleUV.y <= 1.0)
			{
				sampleProjectionOnSurface =  texture2D(positionsBuffer, sampleUV);
				if (sampleProjectionOnSurface.a == 0.0) // not in the background
				{
					distanceCameraSampleProjection = texture2D(normalsAndDepthBuffer,sampleUV).a;
					if(distanceCameraSample > distanceCameraSampleProjection+bias) //if the sample is inside the surface it is an occluder
					{
						samplesVisibility[i] = false; //The sample is an eventual occluder

						secondDepth = texture2D(secondDepthBuffer, sampleUV).a;
						if(distanceCameraSample>secondDepth)//The sample is behind an object
						{
							samplesVisibility[i] = true; //The sample is visible
							visibility += 1.0/numberOfSamplesF;
							gl_FragColor += 2.0*texture2D(diffuseTexture,vUv)*max(dot(normal, sampleDirection),0.0)*computeRadiance(samplesPosition[i])/numberOfSamplesF;
						}	


					}
					else
					{
						//Direct illumination is calculted with visible samples
						samplesVisibility[i] = true; //The sample is visible

						//compute the incoming radiance coming in the direction sampleDirection
						gl_FragColor += 2.0*texture2D(diffuseTexture,vUv)*max(dot(normal, sampleDirection),0.0)*computeRadiance(samplesPosition[i])/numberOfSamplesF;
					}	
				}//End 	if (sampleProjectionOnSurface.a == 0.0) not in the background
				else//If the sample is in the background it is always visible
				{
						gl_FragColor += 2.0*texture2D(diffuseTexture,vUv)*max(dot(normal, sampleDirection),0.0)*computeRadiance(samplesPosition[i])/numberOfSamplesF;
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
}

