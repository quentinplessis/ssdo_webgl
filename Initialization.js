// process lights for shaders
function processLights() {
	var lightsNumber = lights.length;
	for (var i = 0 ; i < lights.length ; i++) {
		lightsPos[i] = lights[i].getPosition();
		lightsColor[i] = lights[i].getColor();
		lightsIntensity[i] = lights[i].getIntensity();
		lightsCameras[i] = new THREE.PerspectiveCamera(70.0, 1.0, 0.1, 1000.0);
		//lightsCameras[i] = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 1000 );
		lightsCameras[i].position = lightsPos[i];
		lightsCameras[i].lookAt(lights[i].getLookAt()); 
		
		lightsView[i] = lightsCameras[i].matrixWorldInverse;
		lightsProj[i] = lightsCameras[i].projectionMatrix;
		
		lightsAngle[i] = lightDefaultAngle;
		lightsAttenuation[i] = lightDefaultAttenuation;
	
		shadowMaps[i] = new THREE.WebGLRenderTarget(shadowMapsResolution, shadowMapsResolution, options);
	}
}

function loadLights1() {
	lights[0] = new Light(
		new THREE.Vector3(250, 200, 180),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
	lights[1] = new Light(
		new THREE.Vector3(-200, 400, 150),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
}
function loadLights2() {
	lights[0] = new Light(
		new THREE.Vector3(-500, 1000, 0),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
	lights[1] = new Light(
		new THREE.Vector3(110, 50, 0),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
}

function initLights() {
	loadLights1();
	processLights();
}

function initShaders() {
	shaders['phong'] = new PhongShader(lightsPos, lightsColor, lightsIntensity);
	rtTextures['phong'] = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	
	shaders['expressive'] = new ExpressiveShader(lightsPos, lightsColor, lightsIntensity);
	rtTextures['expressive'] = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	
	shaders['diffuse'] = new DiffuseShader(lightsPos, lightsColor, lightsIntensity);
	rtTextures['diffuse'] = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	
	normalsAndDepthShader = new Shader();
	normalsAndDepthShader.loadShader('shaders/default.vert', 'vertex');
	normalsAndDepthShader.loadShader('shaders/computesNormalsDepth.frag', 'fragment');
	normalsAndDepthTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);

	// SSDO required inputs
	coordsShader = new Shader();
	coordsShader.loadShader('shaders/computesCoords.vert', 'vertex');
	coordsShader.loadShader('shaders/computesCoords.frag', 'fragment');
	coordsTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	
	diffuseMapShader = new Shader();
	diffuseMapShader.loadShader('shaders/texturedWorldCoords.vert', 'vertex');
	diffuseMapShader.loadShader('shaders/diffuseMap.frag', 'fragment');
	diffuseTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);

	//Second depth for depth peeling
	secondDepthShader = new Shader();
	secondDepthShader.loadShader('shaders/default.vert', 'vertex');
	secondDepthShader.loadShader('shaders/computeSecondDepth.frag', 'fragment');
	secondDepthShader.setUniform('positionsBuffer', 't', coordsTexture);
	secondDepthShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	secondDepthShader.setUniform('screenWidth', 'f', window.innerWidth);
	secondDepthShader.setUniform('screenHeight', 'f', window.innerHeight);
	secondDepthTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);


	// shadow mapping
	shadowMapsShader = new Shader();
	shadowMapsShader.loadShader('shaders/shadowMaps.vert', 'vertex');
	shadowMapsShader.loadShader('shaders/shadowMaps.frag', 'fragment');
	
	// hard shadows
	hardShadowsTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	hardShadowsShader = new Shader();
	hardShadowsShader.loadShader('shaders/worldCoords.vert', 'vertex');
	hardShadowsShader.loadShader('shaders/hardShadows.frag', 'fragment');
	hardShadowsShader.setUniform('diffuseTexture', 't', diffuseTexture);
	hardShadowsShader.setUniform('screenWidth', 'f', window.innerWidth);
	hardShadowsShader.setUniform('screenHeight', 'f', window.innerHeight);
	hardShadowsShader.setUniform('shadowMaps', 'vt', shadowMaps);
	hardShadowsShader.setUniform('shadowMap', 't', shadowMaps[0]);
	hardShadowsShader.setUniform('shadowMap1', 't', shadowMaps[1]);
	hardShadowsShader.setUniform('lightsView', 'm4v', lightsView);
	hardShadowsShader.setUniform('lightsProj', 'm4v', lightsProj);
	hardShadowsShader.setUniform('lightsPos', 'v3v', lightsPos);
	hardShadowsShader.setUniform('lightsColor', 'v4v', lightsColor);
	hardShadowsShader.setUniform('lightsIntensity', 'fv1', lightsIntensity);
	hardShadowsShader.setUniform('lightsAngle', 'fv1', lightsAngle);
	hardShadowsShader.setUniform('skyLightIntensity', 'f', skyLightIntensity);
	hardShadowsShader.setUniform('PI', 'f', Math.PI);
	hardShadowsShader.setUniform('lightsAttenuation', 'fv1', lightsAttenuation);
	//hardShadowsShader.setUniform('worldMatrix', 'm4', camera.matrixWorldInverse);
	
	var samplesNumber = 8;
	randomTexture = createRandTexture(window.innerWidth, window.innerHeight * samplesNumber, 4);
	randomShader = new Shader();
	randomShader.setUniform('screenWidth', 'f', window.innerWidth);
	randomShader.setUniform('screenHeight', 'f', window.innerHeight);
	randomShader.loadShader('shaders/texture.vert', 'vertex');
	randomShader.loadShader('shaders/random.frag', 'fragment');
	randomShader.setUniform('texture', 't', randomTexture);
	
	// SSDO shaders
	directLightBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	ssdoDirectLightingShader = new Shader();
	ssdoDirectLightingShader.setUniform('positionsBuffer', 't', coordsTexture);
	ssdoDirectLightingShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	ssdoDirectLightingShader.setUniform('secondDepthBuffer', 't', secondDepthTexture);
	ssdoDirectLightingShader.setUniform('diffuseTexture', 't', diffuseTexture);
	ssdoDirectLightingShader.setUniform('randomTexture', 't', randomTexture);
	ssdoDirectLightingShader.loadShader('shaders/ssdo.vert', 'vertex');
	ssdoDirectLightingShader.loadShader('shaders/SSDODirectLighting.frag', 'fragment');
	ssdoDirectLightingShader.setUniform('screenWidth', 'f', window.innerWidth);
	ssdoDirectLightingShader.setUniform('screenHeight', 'f', window.innerHeight);
	ssdoDirectLightingShader.setUniform('lightsPos', 'v3v', lightsPos);
	ssdoDirectLightingShader.setUniform('lightsColor', 'v4v', lightsColor);
	ssdoDirectLightingShader.setUniform('lightsIntensity', 'fv1', lightsIntensity);
	ssdoDirectLightingShader.setUniform('cameraProjectionM', 'm4', camera.projectionMatrix);
	ssdoDirectLightingShader.setUniform('cameraViewMatrix', 'm4', camera.matrixWorldInverse);
	ssdoDirectLightingShader.setUniform('shadowMap', 't', shadowMaps[0]);
	ssdoDirectLightingShader.setUniform('shadowMap1', 't', shadowMaps[1]);
	ssdoDirectLightingShader.setUniform('lightsView', 'm4v', lightsView);
	ssdoDirectLightingShader.setUniform('lightsProj', 'm4v', lightsProj);
	
	ssdoFinalBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	ssdoIndirectBounceShader = new Shader();
	ssdoIndirectBounceShader.setUniform('positionsBuffer', 't', coordsTexture);
	ssdoIndirectBounceShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	ssdoIndirectBounceShader.setUniform('secondDepthBuffer', 't', secondDepthTexture);
	ssdoIndirectBounceShader.setUniform('diffuseTexture', 't', diffuseTexture);
	ssdoIndirectBounceShader.setUniform('randomTexture', 't', randomTexture);
	ssdoIndirectBounceShader.setUniform('directLightBuffer', 't', directLightBuffer);
	ssdoIndirectBounceShader.loadShader('shaders/ssdo.vert', 'vertex');
	ssdoIndirectBounceShader.loadShader('shaders/SSDOIndirectBounce.frag', 'fragment');
	ssdoIndirectBounceShader.setUniform('screenWidth', 'f', window.innerWidth);
	ssdoIndirectBounceShader.setUniform('screenHeight', 'f', window.innerHeight);
	ssdoIndirectBounceShader.setUniform('lightsPos', 'v3v', lightsPos);
	ssdoIndirectBounceShader.setUniform('lightsColor', 'v4v', lightsColor);
	ssdoIndirectBounceShader.setUniform('lightsIntensity', 'fv1', lightsIntensity);
	ssdoIndirectBounceShader.setUniform('cameraProjectionM', 'm4', camera.projectionMatrix);
	ssdoIndirectBounceShader.setUniform('cameraViewMatrix', 'm4', camera.matrixWorldInverse);
	ssdoIndirectBounceShader.setUniform('shadowMap', 't', shadowMaps[0]);
	ssdoIndirectBounceShader.setUniform('shadowMap1', 't', shadowMaps[1]);
	ssdoIndirectBounceShader.setUniform('lightsView', 'm4v', lightsView);
	ssdoDirectLightingShader.setUniform('lightsProj', 'm4v', lightsProj);

	ssdoBlurBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	ssdoBlurShader = new Shader();
	ssdoBlurShader.setUniform('screenWidth', 'f', window.innerWidth);
	ssdoBlurShader.setUniform('screenHeight', 'f', window.innerHeight);
	ssdoBlurShader.setUniform('positionsBuffer', 't', coordsTexture);
	ssdoBlurShader.setUniform('ssdoBuffer', 't', ssdoFinalBuffer);
	ssdoBlurShader.loadShader('shaders/ssdo.vert', 'vertex');
	ssdoBlurShader.loadShader('shaders/ssdoBlur.frag', 'fragment'); 

	// SSAO shaders
	ssaoOnlyBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	ssaoOnlyShader = new Shader();
	ssaoOnlyShader.setUniform('positionsBuffer', 't', coordsTexture);
	ssaoOnlyShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	ssaoOnlyShader.setUniform('diffuseTexture', 't', diffuseTexture);
	ssaoOnlyShader.setUniform('randomTexture', 't', randomTexture);
	ssaoOnlyShader.loadShader('shaders/ssdo.vert', 'vertex');
	ssaoOnlyShader.loadShader('shaders/SSAOOnly.frag', 'fragment');
	ssaoOnlyShader.setUniform('texelSize', 'v2', new THREE.Vector2(1.0/window.innerWidth,1.0/window.innerHeight));
//	ssaoOnlyShader.setUniform('screenWidth', 'f', window.innerWidth);
//	ssaoOnlyShader.setUniform('screenHeight', 'f', window.innerHeight);
	ssaoOnlyShader.setUniform('lightsPos', 'v3v', lightsPos);
	ssaoOnlyShader.setUniform('lightsColor', 'v4v', lightsColor);
	ssaoOnlyShader.setUniform('lightsIntensity', 'fv1', lightsIntensity);
	ssaoOnlyShader.setUniform('cameraProjectionM', 'm4', camera.projectionMatrix);
	ssaoOnlyShader.setUniform('cameraViewMatrix', 'm4', camera.matrixWorldInverse);
	ssaoOnlyShader.setUniform('shadowMap', 't', shadowMaps[0]);
	ssaoOnlyShader.setUniform('shadowMap1', 't', shadowMaps[1]);
	ssaoOnlyShader.setUniform('lightsView', 'm4v', lightsView);
	ssaoOnlyShader.setUniform('lightsProj', 'm4v', lightsProj);

	ssaoDiffuseBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	ssaoDiffuseShader = new Shader()
	ssaoDiffuseShader.setUniform('positionsBuffer', 't', coordsTexture);
	ssaoDiffuseShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	ssaoDiffuseShader.setUniform('diffuseTexture', 't', diffuseTexture);
	ssaoDiffuseShader.setUniform('randomTexture', 't', randomTexture);
	ssaoDiffuseShader.loadShader('shaders/ssdo.vert', 'vertex');
	ssaoDiffuseShader.loadShader('shaders/SSAO.frag', 'fragment');
	ssaoDiffuseShader.setUniform('screenWidth', 'f', window.innerWidth);
	ssaoDiffuseShader.setUniform('screenHeight', 'f', window.innerHeight);
	ssaoDiffuseShader.setUniform('lightsPos', 'v3v', lightsPos);
	ssaoDiffuseShader.setUniform('lightsColor', 'v4v', lightsColor);
	ssaoDiffuseShader.setUniform('lightsIntensity', 'fv1', lightsIntensity);
	ssaoDiffuseShader.setUniform('cameraProjectionM', 'm4', camera.projectionMatrix);
	ssaoDiffuseShader.setUniform('cameraViewMatrix', 'm4', camera.matrixWorldInverse);
	ssaoDiffuseShader.setUniform('shadowMap', 't', shadowMaps[0]);
	ssaoDiffuseShader.setUniform('shadowMap1', 't', shadowMaps[1]);
	ssaoDiffuseShader.setUniform('lightsView', 'm4v', lightsView);
	ssaoDiffuseShader.setUniform('lightsProj', 'm4v', lightsProj);


}

// Initialization of the world
function initScene() {
	scene = new THREE.Scene();
	sceneScreen = new THREE.Scene();
	//scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

	// ssao
	ssaoScene = new THREE.Scene();
	var plane1 = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
	ssaoQuad = new THREE.Mesh(plane1);
	ssaoScene.add(ssaoQuad);

	// ssdo
	ssdoScene = new THREE.Scene();
	var plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
	ssdoQuad = new THREE.Mesh(plane);
	ssdoScene.add(ssdoQuad);
	
	loadScene1();
//	loadScene2();
	
	//phongShader.setAttribute('displacement', 'f', []);
	// now populate the array of attributes
	/*var vertices = sphere.geometry.vertices;
	var values = attributes.displacement.value
	for(var v = 0; v < vertices.length; v++) {
		values.push(Math.random() * 30);
	}*/
}

function initDisplayManager() {
	// displays for the different renderings
	displayManager = new DisplayManager(sceneScreen);
	//displayManager.addGrid('shadows', customDisplays['shadows'].names);
	//displayManager.addGrid('ssdo', customDisplays['ssdo'].names);
	displayManager.addCustomTexture(normalsAndDepthTexture, 'shaders/displayDepth.frag', 'depth');
	displayManager.addCustomTexture(normalsAndDepthTexture, 'shaders/displayNormals.frag', 'normals');
	displayManager.addCustomTexture(normalsAndDepthTexture, 'shaders/displayDepthNormals.frag', 'depthAndNormals');
	displayManager.addSimpleTexture(rtTextures['phong'], 'phong');
	displayManager.addSimpleTexture(rtTextures['expressive'], 'expressive');
	displayManager.addSimpleTexture(rtTextures['diffuse'], 'diffuse');
	displayManager.addSimpleTexture(diffuseTexture, 'diffuseMap');
	displayManager.addCustomTexture(shadowMaps[0], 'shaders/displayShadowMap.frag', 'shadowMap1');
	displayManager.addCustomTexture(shadowMaps[1], 'shaders/displayShadowMap.frag', 'shadowMap2');
	displayManager.addSimpleTexture(hardShadowsTexture, 'hardShadows');
	displayManager.addSimpleTexture(ssaoOnlyBuffer, 'ssaoOnly');
	displayManager.addSimpleTexture(ssaoDiffuseBuffer, 'ssaoDiffuse');
	displayManager.addSimpleTexture(directLightBuffer, 'ssdoDirect');
	displayManager.addSimpleTexture(ssdoFinalBuffer, 'ssdoFinal');
	displayManager.addSimpleTexture(ssdoBlurBuffer, 'ssdoBlur');
	displayManager.addDisplay(randomShader, 'random');
	displayManager.addCustomTexture(secondDepthTexture, 'shaders/displaySecondDepth.frag', 'secondDepth');
	displayManager.display(customDisplays[MODE]);
}

function initCameraControls(cam) {
	/*controls = new THREE.FirstPersonControls(cam, renderer.domElement);
	controls.movementSpeed = 70;
	controls.lookSpeed = 0.05;
	//controls.noFly = true;
	controls.lookVertical = false;*/
	/*controls = new THREE.FlyControls(cam, renderer.domElement);
	
	controls.dragToLook = false;

	controls.movementSpeed = 5.0;
	controls.rollSpeed = 0.5*/
	//controls = new THREE.PointerLockControls(cam, renderer.domElement);
	controls = new THREE.TrackballControls(cam, renderer.domElement);
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [65, 83, 68];
	controls.addEventListener('change', render);
}

// Initialization
function init() {
	camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
	camera.position.y = 200;
	camera.position.z = 300;
	/*camera.position.x = -500;
	camera.position.y = 800;
	camera.position.z = 0;*/
	
	cameraRTT = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000);
	cameraRTT.position.z = 100;
	
	// renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0xFFFFFF, 1);
	renderer.setSize(screenWidth, screenHeight);
	//gl = document.getContext( 'experimental-webgl' );
	
	// world
	initLights();
	initShaders();
	initScene();
	initDisplayManager();
	
	// controls
	initCameraControls(camera);

	// stats
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;

	// global display
	$container = $('#container');
	$container.append(renderer.domElement);
	$container.append(stats.domElement);
	
	window.addEventListener('resize', onWindowResize, false);
	window.addEventListener('keydown', keyDown, false);
}
