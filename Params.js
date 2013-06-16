if (!Detector.webgl) Detector.addGetWebGLMessage();
		
// Screen
	var screenWidth = window.innerWidth, screenHeight = window.innerHeight;
	var texelSize = new THREE.Vector2(1.0 / window.innerWidth, 1.0 / window.innerHeight);
	var horizontalTexel = new THREE.Vector2(texelSize.x, 0.0);
	var verticalTexel = new THREE.Vector2(0.0, texelSize.y);

// Camera
	var	viewAngle = 45, aspect = screenWidth / screenHeight, near = 0.1, far = 10000;

// Lights
	var lightNearFar = new THREE.Vector2(0.1, 1000.0), lightViewAngle = 70.0, lightRatio = 1.0;
	var lightDefaultAngle = 60.0, skyLightIntensity = 0.1, lightDefaultAttenuation = 0.4, lightDefaultIntensity = 1.0;

// Pipeline
	var $container, stats, clock = new THREE.Clock();
	var camera, cameraRTT, controls, scene, sceneScreen, renderer, displayManager;
	var lights = [], lightsPos = [], lightsColor = [], lightsIntensity = [], lightsAngle = [], lightsAttenuation = [];
	var lightsCameras = [], lightsView = [], lightsProj = [];
	var objects = [], materials = [];

// Default material
	var blankMaterial = []; blankMaterial['matDiffuse'] = 0.8; blankMaterial['matSpecular'] = 0.3;
	blankMaterial['matEmissive'] = 0.0; blankMaterial['shininess'] = 5.0;
	blankMaterial['matDiffuseColor'] = new THREE.Vector4(1.0, 1.0, 1.0, 1.0);
	blankMaterial['matSpecularColor'] = new THREE.Vector4(1.0, 1.0, 1.0, 1.0);
	blankMaterial['matEmissiveColor'] = new THREE.Vector4(1.0, 1.0, 1.0, 1.0);
	blankMaterial['texture'] = null;

// Basic shaders
	var shaders = [], rtTextures = [];
	var normalsAndDepthShader, normalsAndDepthTexture;
	var diffuseMapShader, diffuseTexture;
	var materialShader, materialTexture;
	var coordsShader, coordsTexture;
	var secondDepthShader, secondDepthTexture;	

// Shadow maps
	var shadowMapsResolution = 64, shadowMapsFullResolution = 256, shadowMapsBlurSize = 4.0;
	var shadowMaps = [], smScene;
	var shadowMapAux, shadowMapAux2, shadowMapBlurShader, blurShadowMaps = false;
	var shadowsShader, shadowsTexture;

// Depth of field
	var dofResolution = 256, focal = 80, fStop = 20, focusDistance = 380;
	var camMill = 35;
	var blurCoeff = focal * focal / ((focusDistance - focal) * fStop);
	var ppm = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight) / camMill;
	//var focal = 180 * camMill / (Math.PI * viewAngle);
	var dofScene, dofQuad;
	var DOFBlurTexture, DOFBlurShader;
	var DOFImageTexture, DOFImageShader;
	var dofAuxTexture;

// Motion blur
	var mbIntensity = 1.0, mbSamples = 4.0;
	var velocityTexture, velocityShader, motionBlurTexture, motionBlurShader;
	var previousCameraViewMatrix;

// SSAO
	var ssaoScene, ssaoQuad;
	var ssaoOnlyShader, ssaoOnlyBuffer;
	var ssaoDiffuseShader, ssaoDiffuseBuffer;

// SSDO
	var randomTexture;
	var ssdoScene, ssdoQuad;
	var ssdoDirectLightingShader, directLightBuffer;
	var ssdoIndirectBounceShader, ssdoFinalBuffer;
	var ssdoBlurShader, ssdoBlurBuffer;

// Scenes
	var scenes = [];
	var currentScene = "scene1";

// Displays
	var customDisplays = [];
	
	customDisplays['normal'] = {cols: 2	, rows: 3, 
		names: ['depth', 'normals', 'depthAndNormals', 'diffuseMap', 'diffuse', 'phong']};
	
	customDisplays['all'] = {cols: 4, rows: 4, all: true};
	
	customDisplays['shadows'] = {cols: 2, rows: 2, 
		names: ['shadowMap1', 'shadowMap2', 'shadows', 'phong']};
	
	customDisplays['dof'] = {cols: 2, rows: 2, 
		names: ['dofBlurAux', 'dofBlur', 'dofImage', 'shadows']};
		
	customDisplays['motionBlur'] = {cols: 2, rows: 1, 
		names: ['velocity', 'motionBlur']};
	
	customDisplays['ssao'] = {cols: 2, rows: 2, 
		names: ['ssaoOnly', 'ssaoDiffuse', 'depth', 'secondDepth']};
	//	names: ['ssaoOnly']};
	
	customDisplays['ssdo'] = {cols: 2, rows: 2, 
		names: ['shadowMap1', 'ssdoDirect', 'ssdoFinal', 'ssdoBlur']};

	customDisplays['texture'] = {names: ['diffuseMap']};
	
	customDisplays['random'] = {names: ['random']};

	
// Rendering
	var MODE = 'normal', ANIMATION = false;
	var shadowMode = 0; // hardShadows

	//minFilter: THREE.LinearMipmapLinearFilter,  // we want mipmaps
	//magFilter: THREE.LinearFilter,  // we want nice filtering
	//wrapS:THREE.RepeatWrapping,
	//wrapT:THREE.RepeatWrapping,
	var options = {
			minFilter: THREE.LinearFilter,
			//magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType
		};

	var testTexture = THREE.ImageUtils.loadTexture('textures/avatar.jpg');
	
// Controls
	var fizzyText;
