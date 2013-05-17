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
varying mat4 modelViewM;
uniform mat4 projectionM;
//uniform vec3 cameraPosition;

// lights properties
uniform vec3 lightsPos[2];
uniform vec4 lightsColor[2];
uniform float lightsIntensity[2];

// 3D point properties
varying vec4 P;
varying vec3 N;

/*void main() {
	vec2 uv = vec2(gl_FragCoord.x / screenWidth, gl_FragCoord.y / screenHeight);
	gl_FragColor = texture2D(diffuseTexture, uv);
}*/

float mod289(float x)     { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float permute(float x)    { return mod289(((x*34.0)+1.0)*x); }
float rng(float x)        { return fract(x*1.0/41.0); }

void main() {
	float randH;
	float m = mod289(gl_FragCoord.x);             // values must be bound to (-289,289) for precision
	float m2 = mod289(gl_FragCoord.y); 
	randH = permute(permute(m)+m2);  // hash the coordinates together
	
	
	//Number of samples we use for the SSDO algorithm
	const int numberOfSamples = 8;
	const float numberOfSamplesF = 8.0;
	const float rmax = 8.0;
	vec2 uv = vec2(0.0, 0.0);

	gl_FragColor = vec4(0.0,0.0,0.0,0.0);
	vec3 directions[numberOfSamples];
	vec3 samplesPosition[numberOfSamples];
	vec2 samplesScreenSpacePosition[numberOfSamples];

	//samplesVisibility[i] = true if sample i is not occulted
	bool samplesVisibility[numberOfSamples];


	//Generate numberOfSamples random directions and random samples (uniform distribution)
	//The samples are in the hemisphere oriented by the normal vector	
	for(int i = 0 ; i<numberOfSamples ; i++)
	{
		float r1 = rng(randH); randH = permute(randH);
		float r2 = rng(randH); randH = permute(randH);
		float r3 = rng(randH); randH = permute(randH);
		vec3 sampleDirection = vec3(r1, r2, r3);
		normalize(sampleDirection);
		if(dot(sampleDirection, N) < 0.0)
		{
			sampleDirection = -sampleDirection;
		}
		directions[i] = sampleDirection;
		float r4 = rng(randH); randH = permute(randH);
		samplesPosition[i] = P.xyz + 1.0*sampleDirection;

		//Samples are back projected to the image
		samplesScreenSpacePosition[i] = (projectionM*modelViewM*vec4(samplesPosition[i], 1.0)).xy;
		//samplesScreenSpacePosition[i] = (projectionM*modelViewM*vec4(samplesPosition[i], 1.0)).xy;

		//Determines if the sample is visible or not
		float distanceCameraSample = length(cameraPosition-samplesPosition[i]);
		uv = vec2(samplesScreenSpacePosition[i].x / screenWidth, samplesScreenSpacePosition[i].y / screenHeight);
		vec3 sampleProjectionOnSurface = texture2D(positionsBuffer, uv).xyz;//Position
		vec3 sampleNormalOnSurface = texture2D(normalsAndDepthBuffer, uv).xyz;//Normal
		float distanceCameraSampleProjection = length(cameraPosition-sampleProjectionOnSurface);

		//The distance between the sender and the receiver is clamped to 1.0 to avoid singularity problems
		float distanceSenderReceiver = length(P.xyz-samplesPosition[i]);
		if(distanceSenderReceiver >1.0)
		{
			distanceSenderReceiver = 1.0;
		}

		if(distanceCameraSample > distanceCameraSampleProjection && dot(N, sampleNormalOnSurface) < 0.0) //if the sample is inside the surface it is an occluder
		{
			samplesVisibility[i] = false; //The sample is an occluder
			vec4 incomingRadiance = texture2D(directLightBuffer, uv);
			
			uv = vec2(gl_FragCoord.x / screenWidth, gl_FragCoord.y / screenHeight);
			vec4 matDiffuseTerm = texture2D(diffuseTexture, uv);
			
			gl_FragColor += incomingRadiance*matDiffuseTerm*pow(rmax,2.0)*dot(sampleDirection, N)*dot(sampleDirection, sampleProjectionOnSurface)/(numberOfSamplesF*pow(distanceSenderReceiver,2.0));
		}
		else
		{
			//Direct illumination is calculted with visible samples
			samplesVisibility[i] = true; //The sample is visible
		}
	}
	uv = vec2(gl_FragCoord.x / screenWidth, gl_FragCoord.y / screenHeight);
	//Adds direct light to the color
	gl_FragColor += texture2D(directLightBuffer, uv);
}
