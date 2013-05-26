// process lights for shaders
function processLights() {
	var lightsNumber = lights.length;
	for (var i = 0 ; i < lights.length ; i++) {
		lightsPos[i] = lights[i].getPosition();
		lightsColor[i] = lights[i].getColor();
		lightsIntensity[i] = lights[i].getIntensity();
		
		lightsCameras[i] = new THREE.PerspectiveCamera(70.0, 1.0, 0.1, 1000.0);
		lightsCameras[i].position = lightsPos[i];
		lightsCameras[i].lookAt(lights[i].getLookAt()); 
		
		lightsView[i] = lightsCameras[i].matrixWorldInverse;
		lightsProj[i] = lightsCameras[i].projectionMatrix;
		
		lightsRot[i] = new THREE.Matrix3();
		lightsRot[i].getNormalMatrix(lightsView[i]);
		lightsRot[i] = lightsCameras[i].rotation;
		//lightsCameras[i].updateMatrix();
		
		lightsAngle[i] = lightDefaultAngle;
		lightsAttenuation[i] = lightDefaultAttenuation;
	
		shadowMaps[i] = new THREE.WebGLRenderTarget(shadowMapsResolution, shadowMapsResolution, options);
	}
}

function initLights() {
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
	diffuseMapShader.loadShader('shaders/default.vert', 'vertex');
	diffuseMapShader.loadShader('shaders/diffuseMap.frag', 'fragment');
	diffuseTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	
	// shadow mapping
	shadowMapsShader = new Shader();
	shadowMapsShader.loadShader('shaders/shadowMaps.vert', 'vertex');
	shadowMapsShader.loadShader('shaders/shadowMaps.frag', 'fragment');
	//shadowMapsShader.setUniform('lightsProj', 'm4v', lightsProj);
	
	// hard shadows
	hardShadowsTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	hardShadowsShader = new Shader();
	hardShadowsShader.loadShader('shaders/worldCoords.vert', 'vertex');
	hardShadowsShader.loadShader('shaders/hardShadows.frag', 'fragment');
	hardShadowsShader.setUniform('shadowMaps', 'vt', shadowMaps);
	hardShadowsShader.setUniform('shadowMap', 't', shadowMaps[0]);
	hardShadowsShader.setUniform('shadowMap1', 't', shadowMaps[1]);
	hardShadowsShader.setUniform('lightsView', 'm4v', lightsView);
	hardShadowsShader.setUniform('lightsProj', 'm4v', lightsProj);
	hardShadowsShader.setUniform('lightsRot', 'm3v', lightsRot);
	hardShadowsShader.setUniform('lightsPos', 'v3v', lightsPos);
	hardShadowsShader.setUniform('lightsColor', 'v4v', lightsColor);
	hardShadowsShader.setUniform('lightsIntensity', 'fv1', lightsIntensity);
	hardShadowsShader.setUniform('lightsAngle', 'fv1', lightsAngle);
	hardShadowsShader.setUniform('skyLightIntensity', 'f', skyLightIntensity);
	hardShadowsShader.setUniform('PI', 'f', Math.PI);
	hardShadowsShader.setUniform('lightsAttenuation', 'fv1', lightsAttenuation);
	//hardShadowsShader.setUniform('worldMatrix', 'm4', camera.matrixWorldInverse);
	
	// SSDO shaders
	directLightBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	ssdoDirectLightingShader = new Shader();
	ssdoDirectLightingShader.setUniform('positionsBuffer', 't', coordsTexture);
	ssdoDirectLightingShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	ssdoDirectLightingShader.setUniform('diffuseTexture', 't', diffuseTexture);
	ssdoDirectLightingShader.loadShader('shaders/ssdo.vert', 'vertex');
	ssdoDirectLightingShader.loadShader('shaders/SSDODirectLighting.frag', 'fragment');
	ssdoDirectLightingShader.setUniform('screenWidth', 'f', window.innerWidth);
	ssdoDirectLightingShader.setUniform('screenHeight', 'f', window.innerHeight);
	ssdoDirectLightingShader.setUniform('lightsPos', 'v3v', lightsPos);
	ssdoDirectLightingShader.setUniform('lightsColor', 'v4v', lightsColor);
	ssdoDirectLightingShader.setUniform('lightsIntensity', 'fv1', lightsIntensity);
	ssdoDirectLightingShader.setUniform('cameraProjectionM', 'm4', camera.projectionMatrix);
	ssdoDirectLightingShader.setUniform('cameraViewMatrix', 'm4', camera.matrixWorldInverse);
	ssdoDirectLightingShader.setUniform('cameraViewMatrixInverse', 'm4', camera.matrixWorld);
	//ssdoDirectLightingShader.setUniform('cameraPosition', 'vec3', camera.position);
			
	ssdoIndirectBounceShader = new Shader();
	ssdoIndirectBounceShader.loadShader('shaders/ssdo.vert', 'vertex');
	ssdoIndirectBounceShader.loadShader('shaders/SSDOIndirectBounce.frag', 'fragment');
	ssdoIndirectBounceShader.setUniform('directLightBuffer', 't', directLightBuffer);
	ssdoIndirectBounceShader.setUniform('positionsBuffer', 't', coordsTexture);
	ssdoIndirectBounceShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	ssdoIndirectBounceShader.setUniform('diffuseTexture', 't', diffuseTexture);
	ssdoIndirectBounceShader.setUniform('screenWidth', 'f', window.innerWidth);
	ssdoIndirectBounceShader.setUniform('screenHeight', 'f', window.innerHeight);
	ssdoIndirectBounceShader.setUniform('lightsPos', 'v3v', lightsPos);
	ssdoIndirectBounceShader.setUniform('lightsColor', 'v4v', lightsColor);
	ssdoIndirectBounceShader.setUniform('lightsIntensity', 'fv1', lightsIntensity);
	ssdoDirectLightingShader.setUniform('cameraProjectionM', 'm4', camera.projectionMatrix);
	ssdoDirectLightingShader.setUniform('cameraViewMatrix', 'm4', camera.matrixWorldInverse);
	ssdoDirectLightingShader.setUniform('cameraViewMatrixInverse', 'm4', camera.matrixWorld);
	//ssdoIndirectBounceShader.setUniform('cameraPosition', 'vec3', camera.position);
}

// Initialization of the world
function initScene() {
	scene = new THREE.Scene();
	sceneScreen = new THREE.Scene();
	//scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
	
	// ssdo
	ssdoScene = new THREE.Scene();
	var plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
	ssdoQuad = new THREE.Mesh(plane);
	ssdoScene.add(ssdoQuad);
	
	// sphere
	var sphereMaterial = new THREE.MeshLambertMaterial({color: 0xCC0000});
	var radius = 50, segments = 16, rings = 16;
	var sphereGeometry = new THREE.SphereGeometry(radius, segments, rings);
	objects[0] = new THREE.Mesh(sphereGeometry);
	materials[0] = jQuery.extend(true, {}, blankMaterial);
	materials[0]['matSpecular'] = 0.8;
	materials[0]['matDiffuseColor'] = new THREE.Vector4(1.0, 0.0, 0.0, 1.0);
	scene.add(objects[0]);
	//objects[0].add(camera);
	
	var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
	objects[1] = new THREE.Mesh(geometry);
	objects[1].position.x = -100;
	objects[1].position.z = -100;
	objects[1].position.y = -50;
	materials[1] = materials[0];
	scene.add(objects[1]);
	
	// off importation
	loadOFF('models/monkey.off');
	objects[2].position.x = 150;
	materials[2] = jQuery.extend(true, {}, blankMaterial);
	materials[2]['matDiffuseColor'] = new THREE.Vector4(0.2, 1.0, 0.2, 1.0);
	scene.add(objects[2]);
	
	loadOFF('models/ram.off');
	objects[3].position.x = -80;
	objects[3].position.z = 100;
	objects[3].position.y = -50;
	objects[3].rotation.x = - Math.PI / 2;
	materials[3] = jQuery.extend(true, {}, blankMaterial);
	materials[3]['matDiffuseColor'] = new THREE.Vector4(0.5, 0.0, 0.5, 1.0);
	scene.add(objects[3]);
	
	loadOFF('models/ground.off', 200);
	objects[4].position.y = -100;
	objects[4].rotation.x = - Math.PI / 2;
	materials[4] = jQuery.extend(true, {}, blankMaterial);
	materials[4]['matDiffuseColor'] = new THREE.Vector4(0.5, 0.5, 0.5, 1.0);
	scene.add(objects[4]);
	
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
	displayManager.addSimpleTexture(diffuseTexture);
	displayManager.addCustomTexture(shadowMaps[0], 'shaders/displayShadowMap.frag', 'shadowMap1');
	displayManager.addCustomTexture(shadowMaps[1], 'shaders/displayShadowMap.frag', 'shadowMap2');
	displayManager.addSimpleTexture(hardShadowsTexture, 'hardShadows');
	displayManager.addSimpleTexture(directLightBuffer, 'ssdoDirect');
	displayManager.addSimpleTexture(ssdoFinalBuffer, 'ssdoFinal');
	displayManager.display(customDisplays[MODE]);
}

function initCameraControls(cam) {
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
	//camera.position.x = 200;
	camera.position.y = 200;
	camera.position.z = 300;
	
	cameraRTT = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000);
	cameraRTT.position.z = 100;
	
	// world
	initLights();
	initShaders();
	initScene();
	initDisplayManager();
	
	// renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0xFFFFFF, 1);
	renderer.setSize(screenWidth, screenHeight);
	
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
