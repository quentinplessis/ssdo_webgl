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
//uniform vec3 cameraPosition;

// lights properties
uniform vec3 lightsPos[2];
uniform vec4 lightsColor[2];
uniform float lightsIntensity[2];

float linearizeDepth(float z) {
	float n = 0.1;
	float f = 100.0;
	return (2.0 * n) / (f + n - z * (f  -n));
}

float mod289(float x)     { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float permute(float x)    { return mod289(((x*34.0)+1.0)*x); }
float rng(float x)        { return fract(x*1.0/41.0); }
	

/*void main() {
	vec2 uv = vec2(gl_FragCoord.x / screenWidth, gl_FragCoord.y / screenHeight);
	if (uv.x < 0.5) {
		vec4 c = texture2D(positionsBuffer, uv);
		if (c.a == 1.0) // background
			gl_FragData[0] = vec4(1.0, 1.0, 1.0, 1.0);
		else if (c.y > 0.0)
			gl_FragData[0] = vec4(1.0, 0.0, 0.0, 1.0);
		else
			gl_FragData[0] = vec4(0.0, 1.0, 0.0, 1.0);
	}
	else if (uv.y > 0.5) {
		float depth = linearizeDepth(texture2D(normalsAndDepthBuffer, uv).a);
		gl_FragData[0] = vec4(depth, depth, depth, 1.0);
	}
	else {
		vec3 color = (1.0 + (texture2D(normalsAndDepthBuffer, uv)).rgb) * 0.5;
		gl_FragData[0] = vec4(color, 1.0);
	}
}*/


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
		
		// rand functions
		float randH;
		float m = mod289(gl_FragCoord.x);             // values must be bound to (-289,289) for precision
		float m2 = mod289(gl_FragCoord.y); 
		randH = permute(permute(m)+m2);  // hash the coordinates together
		//
		
		
		//Number of samples we use for the SSDO algorithm
		const int numberOfSamples = 8;
		const float numberOfSamplesF = 8.0;
		const float rmax = 2.0;

		vec3 directions[numberOfSamples];
		vec3 samplesPosition[numberOfSamples];
		vec2 samplesScreenSpacePosition[numberOfSamples];

		//samplesVisibility[i] = true if sample i is not occulted
		bool samplesVisibility[numberOfSamples];

		//Generate numberOfSamples random directions and random samples (uniform distribution)
		//The samples are in the hemisphere oriented by the normal vector	
		for(int i = 0 ; i<numberOfSamples ; i++)
		{
			// random numbers
			float r1 = rng(randH); randH = permute(randH);
			float r2 = rng(randH); randH = permute(randH);
			float r3 = rng(randH); randH = permute(randH);
			//
			vec3 sampleDirection = vec3(r1, r2, r3);
			normalize(sampleDirection);

			if(dot(sampleDirection, normal) < 0.0)
			{
				sampleDirection = -sampleDirection;
			}
			directions[i] = sampleDirection;
			
			// random number
			float r4 = rng(randH); randH = permute(randH); r4 *= rmax;
			
			samplesPosition[i] = position.xyz + r4*(sampleDirection.xyz);

			//Samples are back projected to the image
			samplesScreenSpacePosition[i] = (cameraProjectionM * cameraViewMatrix * vec4(samplesPosition[i], 1.0)).xy;
			//(projectionM*modelViewM*vec4(samplesPosition[i], 1.0)).xy;

			//Determines if the sample is visible or not
			vec4 positionInCameraSpace = cameraViewMatrix*currentPos;
			float distanceCameraSample = length((positionInCameraSpace).xyz);
			vec4 sampleScreenPosToSpace = spacePos(samplesScreenSpacePosition[i]);
			if (sampleScreenPosToSpace.a == 0.0) // not in the background
			{
				vec3 sampleProjectionOnSurface = sampleScreenPosToSpace.xyz;
				
				vec4 sampleProjectionInCameraSpace = cameraViewMatrix*vec4(sampleProjectionOnSurface,1.0);
	
				float distanceCameraSampleProjection = length((sampleProjectionInCameraSpace).xyz);
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
					for(int j = 0 ; j < 2 ; j++)
					{
						//Visibility Test...
						incomingRadiance += dot(sampleDirection, position-lightsPos[j])*lightsIntensity[j]*lightsColor[j];
					}
					gl_FragColor += 2.0*matDiffusion(gl_FragCoord.xy)*dot(normal, sampleDirection)/numberOfSamplesF*incomingRadiance;
				}
			}
		}
	}
	else
	{
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	}
}

