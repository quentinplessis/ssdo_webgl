/**
 * Params.js
 * Defines all the parameters of the application.
 * Authors : Quentin Plessis, Antoine Toisoul
 */
 
if (!Detector.webgl) Detector.addGetWebGLMessage();
		
var renderingWidth = window.innerWidth, renderingHeight = window.innerHeight;
		
// Screen
	var screenWidth = window.innerWidth, screenHeight = window.innerHeight;
	var texelSize = new THREE.Vector2(1.0 / renderingWidth, 1.0 / renderingHeight);
	var horizontalTexel = new THREE.Vector2(texelSize.x, 0.0);
	var verticalTexel = new THREE.Vector2(0.0, texelSize.y);

// Camera
	var	viewAngle = 45, aspect = screenWidth / screenHeight, near = 0.1, far = 10000;

// Lights
	var lightNearFar = [0.1, 1000.0], lightViewAngle = 70.0, lightRatio = 1.0;
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
	var geometryBufferShader, geometryBufferTexture;
	var shaders = [], rtTextures = [];
	var normalsAndDepthShader, normalsAndDepthTexture;
	var diffuseMapShader, diffuseTexture;
	var specularMapShader, specularTexture;
	var materialShader, materialTexture;
	var coordsShader, coordsTexture;
	var secondDepthShader, secondDepthTexture;
	var displayDepthShader, displayShadowMapShader, displayDepthNormalsShader;

// Shadow maps / shadows
	var shadowMapsResolution = 64, shadowMapsFullResolution = 256, shadowMapsBlurSize = 4.0;
	var shadowMaps = [], smScene;
	var shadowMapAux, shadowMapAux2, shadowMapBlurShader, blurShadowMaps = false;
	var shadowsShader, shadowsTexture;
	var shadowsGShader;

// Depth of field
	var dofResolution = 256, focal = 80, fStop = 15, focusDistance = 380;
	var camMill = 35;
	var blurCoeff = focal * focal / ((focusDistance - focal) * fStop);
	var ppm = Math.sqrt(renderingWidth * renderingWidth + renderingHeight * renderingHeight) / camMill;
	//var focal = 180 * camMill / (Math.PI * viewAngle);
	var dofScene, dofQuad;
	var DOFBlurTexture, DOFBlurShader;
	var DOFImageTexture, DOFImageShader;
	var dofAuxTexture;

// Motion blur
	var mbIntensity = 10.0, mbSamples = 25.0;
	var velocityTexture, velocityShader, motionBlurTexture, motionBlurShader;
	var previousCameraViewMatrix;

// SSAO
	var ssaoScene, ssaoQuad;
	var ssaoOnlyShader, ssaoOnlyBuffer;
	var ssaoDiffuseShader, ssaoDiffuseBuffer, ssaoBlurBuffer, ssaoBlurAuxBuffer;
	var ssaoBias = 0.10;

// SSDO
	var randomTexture;
	var ssdoScene, ssdoQuad;
	var ssdoDirectLightingShader, directLightBuffer;
	var ssdoIndirectBounceShader, ssdoIndirectBounceBuffer;
	var ssdoBlurShader, ssdoBlurBuffer, ssdoBlurAuxBuffer;
	var ssdoFinalShader, ssdoFinalBuffer;
	var camera90;
	var patchSizeF = 25.0, sigma = 100.0;
	var rmax1 = 1.0, rmax2 = 50.0;
	var bounceIntensity = 5.0, numberOfSamplesF = 8.0;
	var ssdoBias = 0.01;
	
	//SSDO Multiples views	
	var enableMultipleViews = 1;
	var directLightBuffer90, normalsAndDepthBuffer90, diffuseTexture90, coordsTexture90;

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
		
	customDisplays['shadowsG'] = {cols: 2, rows: 2, 
		names: ['shadowMap1', 'shadowMap2', 'shadows', 'gb']};
	
	customDisplays['dof'] = {cols: 2, rows: 2, 
		names: ['dofBlurAux', 'dofBlur', 'dofImage', 'shadows']};
		
	customDisplays['motionBlur'] = {cols: 1, rows: 1, 
		names: ['motionBlur']};
	
	customDisplays['ssao'] = {cols: 2, rows: 2, 
		names: ['ssaoOnly', 'ssaoBlur', 'ssaoDiffuse', 'secondDepth']};
	
	customDisplays['ssdo'] = {cols: 2, rows: 2, 
		names: ['shadowMap1', 'ssdoDirect', 'ssdoIndirectBounce', 'ssdoFinal']};
	
	customDisplays['ssdo90'] = {cols: 2, rows: 1, 
		names: ['ssdoFinal', 'ssdoDirect90']};

	customDisplays['texture'] = {names: ['diffuseMap']};
	
	customDisplays['random'] = {names: ['random']};

	
// Rendering
	var MODE = 'shadows', ANIMATION = false;
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
