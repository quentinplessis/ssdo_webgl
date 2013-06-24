/**
 * Initialization.js
 * Initializes the different shaders used
 * and the scenes (camera, objects, lights)
 * Authors : Quentin Plessis, Antoine Toisoul
 */

/**
 * Process lights for shaders
 */
function processLights() {
	var lightsNumber = lights.length;
	for (var i = 0 ; i < lights.length ; i++) {
		lightsPos[i] = lights[i].getPosition();
		lightsColor[i] = lights[i].getColor();
		lightsIntensity[i] = lights[i].getIntensity();

		lightsCameras[i] = new THREE.PerspectiveCamera(lightViewAngle, lightRatio, lightNearFar[0], lightNearFar[1]);
		//lightsCameras[i] = new THREE.OrthographicCamera( renderingWidth / - 2, renderingWidth / 2, renderingHeight / 2, renderingHeight / - 2, 0.1, 1000 );
		lightsCameras[i].position = lightsPos[i];
		lightsCameras[i].lookAt(lights[i].getLookAt()); 
		
		lightsView[i] = lightsCameras[i].matrixWorldInverse;
		lightsProj[i] = lightsCameras[i].projectionMatrix;
		
		lightsAngle[i] = lightDefaultAngle;
		lightsAttenuation[i] = lightDefaultAttenuation;
	
		shadowMaps[i] = new THREE.WebGLRenderTarget(shadowMapsResolution, shadowMapsResolution, options);
	}
	shadowMapAux = new THREE.WebGLRenderTarget(shadowMapsFullResolution, shadowMapsFullResolution, options);
	shadowMapAux2 = new THREE.WebGLRenderTarget(shadowMapsFullResolution, shadowMapsFullResolution, options);
}

/**
 * Lights initialization
 */
function initLights() {
	scenes[currentScene].loadLights();
	processLights();
}

/**
 * Shaders initialization
 */
function initShaders() {
	shaders['phong'] = new PhongShader(lightsPos, lightsColor, lightsIntensity);
	rtTextures['phong'] = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	
	shaders['expressive'] = new ExpressiveShader(lightsPos, lightsColor, lightsIntensity);
	rtTextures['expressive'] = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	
	shaders['diffuse'] = new DiffuseShader(lightsPos, lightsColor, lightsIntensity);
	rtTextures['diffuse'] = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	
	normalsAndDepthShader = new Shader();
	normalsAndDepthShader.loadShader('shaders/default.vert', 'vertex');
	normalsAndDepthShader.loadShader('shaders/computesNormalsDepth.frag', 'fragment');
	normalsAndDepthTexture = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	normalsAndDepthTexture90 = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);

	displayDepthShader = new Shader();
	displayDepthShader.loadShader('shaders/texture.vert', 'vertex');
	displayDepthShader.loadShader('shaders/displayDepth.frag', 'fragment');
	displayDepthShader.setUniform('camNearFar', 'fv1', [near, far]);
	
	displayShadowMapShader = new Shader();
	displayShadowMapShader.loadShader('shaders/texture.vert', 'vertex');
	displayShadowMapShader.loadShader('shaders/displayShadowMap.frag', 'fragment');
	displayShadowMapShader.setUniform('lightNearFar', 'fv1', lightNearFar);
	
	displayDepthNormalsShader = new Shader();
	displayDepthNormalsShader.loadShader('shaders/texture.vert', 'vertex');
	displayDepthNormalsShader.loadShader('shaders/displayDepthNormals.frag', 'fragment');
	displayDepthNormalsShader.setUniform('camNearFar', 'fv1', [near, far]);
	
	// SSDO required inputs
	coordsShader = new Shader();
	coordsShader.loadShader('shaders/computesCoords.vert', 'vertex');
	coordsShader.loadShader('shaders/computesCoords.frag', 'fragment');
	coordsTexture = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	coordsTexture90 = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	
	diffuseMapShader = new Shader();
	diffuseMapShader.loadShader('shaders/texturedWorldCoords.vert', 'vertex');
	diffuseMapShader.loadShader('shaders/diffuseMap.frag', 'fragment');
	diffuseTexture = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	diffuseTexture90 = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);

	//Second depth for depth peeling
	secondDepthShader = new Shader();
	secondDepthShader.loadShader('shaders/default.vert', 'vertex');
	secondDepthShader.loadShader('shaders/computeSecondDepth.frag', 'fragment');
	secondDepthShader.setUniform('positionsBuffer', 't', coordsTexture);
	secondDepthShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	secondDepthShader.setUniform('screenWidth', 'f', renderingWidth);
	secondDepthShader.setUniform('screenHeight', 'f', renderingHeight);
	secondDepthTexture = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);

	// shadow mapping
	shadowMapsShader = new Shader();
	shadowMapsShader.loadShader('shaders/shadowMaps.vert', 'vertex');
	shadowMapsShader.loadShader('shaders/shadowMaps.frag', 'fragment');
	shadowMapsShader.setUniform('lightNearFar', 'fv1', lightNearFar);
	
	shadowMapBlurShader = new Shader();
	shadowMapBlurShader.loadShader('shaders/texture.vert', 'vertex');
	shadowMapBlurShader.loadShader('shaders/shadowMapBlur.frag', 'fragment');
	shadowMapBlurShader.setUniform('blurSize', 'f', shadowMapsBlurSize);
	
	// shadows
	shadowsTexture = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	shadowsShader = new Shader();
	shadowsShader.loadShader('shaders/worldCoords.vert', 'vertex');
	shadowsShader.loadShader('shaders/shadows.frag', 'fragment');
	shadowsShader.setUniform('diffuseTexture', 't', diffuseTexture);
	shadowsShader.setUniform('shadowMaps', 'vt', shadowMaps);
	shadowsShader.setUniform('shadowMap', 't', shadowMaps[0]);
	shadowsShader.setUniform('shadowMap1', 't', shadowMaps[1]);
	shadowsShader.setUniform('lightsView', 'm4v', lightsView);
	shadowsShader.setUniform('lightsProj', 'm4v', lightsProj);
	shadowsShader.setUniform('lightsPos', 'v3v', lightsPos);
	shadowsShader.setUniform('lightsColor', 'v4v', lightsColor);
	shadowsShader.setUniform('lightsIntensity', 'fv1', lightsIntensity);
	shadowsShader.setUniform('lightsAngle', 'fv1', lightsAngle);
	shadowsShader.setUniform('lightsAttenuation', 'fv1', lightsAttenuation);
	shadowsShader.setUniform('skyLightIntensity', 'f', skyLightIntensity);
	shadowsShader.setUniform('lightNearFar', 'fv1', lightNearFar);
	shadowsShader.setUniform('PI', 'f', Math.PI);
	shadowsShader.setUniform('shadowMode', 'i', shadowMode);
	shadowsShader.setUniform('texelSize', 'v2', texelSize);
	
	// depth-of-field
	DOFBlurTexture = new THREE.WebGLRenderTarget(dofResolution, dofResolution, options);
	dofAuxTexture = new THREE.WebGLRenderTarget(dofResolution, dofResolution, options);
	DOFBlurShader = new Shader();
	DOFBlurShader.loadShader('shaders/texture.vert', 'vertex');
	DOFBlurShader.loadShader('shaders/DOFBlur.frag', 'fragment');
	DOFBlurShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	DOFBlurShader.setUniform('blurCoefficient', 'f', blurCoeff);
	DOFBlurShader.setUniform('focusDistance', 'f', focusDistance);
	DOFBlurShader.setUniform('near', 'f', near);
	DOFBlurShader.setUniform('far', 'f', far);
	DOFBlurShader.setUniform('PPM', 'f', ppm);
	
	DOFImageTexture = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	DOFImageShader = new Shader();
	DOFImageShader.loadShader('shaders/texture.vert', 'vertex');
	DOFImageShader.loadShader('shaders/DOFImage.frag', 'fragment');
	DOFImageShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	DOFImageShader.setUniform('dofBlur', 't', DOFBlurTexture);
	DOFImageShader.setUniform('blurCoefficient', 'f', blurCoeff);
	DOFImageShader.setUniform('focusDistance', 'f', focusDistance);
	DOFImageShader.setUniform('near', 'f', near);
	DOFImageShader.setUniform('far', 'f', far);
	DOFImageShader.setUniform('PPM', 'f', ppm);
	
	// motion blur
	velocityTexture = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	velocityShader = new Shader();
	velocityShader.loadShader('shaders/velocity.vert', 'vertex');
	velocityShader.loadShader('shaders/velocity.frag', 'fragment');
	velocityShader.setUniform('texelSize', 'v2', texelSize);
	velocityShader.setUniform('intensity', 'f', mbIntensity);
	
	displayVelocityShader = new Shader();
	displayVelocityShader.loadShader('shaders/texture.vert', 'vertex');
	displayVelocityShader.loadShader('shaders/displayVelocity.frag', 'fragment');
	displayVelocityShader.setUniform('texture', 't', velocityTexture);
	
	motionBlurTexture = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	motionBlurShader = new Shader();
	motionBlurShader.loadShader('shaders/texture.vert', 'vertex');
	motionBlurShader.loadShader('shaders/MotionBlur.frag', 'fragment');
	motionBlurShader.setUniform('velocityTexture', 't', velocityTexture);
	motionBlurShader.setUniform('colorTexture', 't', shadowsTexture);
	motionBlurShader.setUniform('samplesNumber', 'f', mbSamples);

	randomTexture = createRandTexture(window.innerWidth, window.innerHeight, 4);
	randomShader = new Shader();
	randomShader.loadShader('shaders/texture.vert', 'vertex');
	randomShader.loadShader('shaders/random.frag', 'fragment');
	randomShader.setUniform('screenWidth', 'f', window.innerWidth);
	randomShader.setUniform('screenHeight', 'f', window.innerHeight);
	randomShader.setUniform('texture', 't', randomTexture);

	
	// SSDO shaders
	var randomDirections = [];
	var gaussianCoeff = [];
	for(var i = 0 ; i< Math.round(numberOfSamplesF) ; i++)
	{
		randomDirections[i] = new THREE.Vector3(2.0*Math.random()-1.0, 2.0*Math.random()-1.0 ,Math.random());
	}
				
	
	for(var i = 0 ; i<Math.round(patchSizeF) ; i++) //128 == MAX_BLUR_SIZE
	{
		var offset = i - Math.round(patchSizeF/2);
       		gaussianCoeff[i] = 1.0/(Math.sqrt(2.0*Math.PI)*sigma)*Math.exp(-(Math.pow(offset,2.0))/(2.0*Math.pow(sigma,2.0)));
	}

	directLightBuffer = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	directLightBuffer90 = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	ssdoDirectLightingShader = new Shader();
	ssdoDirectLightingShader.loadShader('shaders/texture.vert', 'vertex');
	ssdoDirectLightingShader.loadShader('shaders/SSDODirectLighting.frag', 'fragment');
	ssdoDirectLightingShader.setUniform('secondDepthBuffer', 't', secondDepthTexture);
	ssdoDirectLightingShader.setUniform('randomTexture', 't', randomTexture);
	ssdoDirectLightingShader.setUniform('lightsPos', 'v3v', lightsPos);
	ssdoDirectLightingShader.setUniform('lightsColor', 'v4v', lightsColor);
	ssdoDirectLightingShader.setUniform('lightsIntensity', 'fv1', lightsIntensity);
	ssdoDirectLightingShader.setUniform('shadowMap', 't', shadowMaps[0]);
	ssdoDirectLightingShader.setUniform('shadowMap1', 't', shadowMaps[1]);
	ssdoDirectLightingShader.setUniform('lightsView', 'm4v', lightsView);
	ssdoDirectLightingShader.setUniform('lightsProj', 'm4v', lightsProj);
	ssdoDirectLightingShader.setUniform('numberOfSamples', 'i', Math.round(numberOfSamplesF));
	ssdoDirectLightingShader.setUniform('numberOfSamplesF', 'f', numberOfSamplesF);
	ssdoDirectLightingShader.setUniform('randomDirections', 'v3v', randomDirections);
	ssdoDirectLightingShader.setUniform('rmax', 'f', rmax1);
	ssdoDirectLightingShader.setUniform('bias', 'f', ssdoBias);
	
	ssdoIndirectBounceBuffer = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	ssdoIndirectBounceShader = new Shader();
	ssdoIndirectBounceShader.loadShader('shaders/texture.vert', 'vertex');
	ssdoIndirectBounceShader.loadShader('shaders/SSDOIndirectBounce.frag', 'fragment');
	ssdoIndirectBounceShader.setUniform('positionsBuffer', 't', coordsTexture);
	ssdoIndirectBounceShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	ssdoIndirectBounceShader.setUniform('secondDepthBuffer', 't', secondDepthTexture);
	ssdoIndirectBounceShader.setUniform('diffuseTexture', 't', diffuseTexture);
	ssdoIndirectBounceShader.setUniform('randomTexture', 't', randomTexture);
	ssdoIndirectBounceShader.setUniform('directLightBuffer', 't', directLightBuffer);
	ssdoIndirectBounceShader.setUniform('lightsPos', 'v3v', lightsPos);
	ssdoIndirectBounceShader.setUniform('lightsColor', 'v4v', lightsColor);
	ssdoIndirectBounceShader.setUniform('lightsIntensity', 'fv1', lightsIntensity);
	ssdoIndirectBounceShader.setUniform('cameraProjectionM', 'm4', camera.projectionMatrix);
	ssdoIndirectBounceShader.setUniform('cameraViewMatrix', 'm4', camera.matrixWorldInverse);
	ssdoIndirectBounceShader.setUniform('shadowMap', 't', shadowMaps[0]);
	ssdoIndirectBounceShader.setUniform('shadowMap1', 't', shadowMaps[1]);
	ssdoIndirectBounceShader.setUniform('lightsView', 'm4v', lightsView);
	ssdoIndirectBounceShader.setUniform('lightsProj', 'm4v', lightsProj);
	ssdoIndirectBounceShader.setUniform('numberOfSamples', 'i', Math.round(numberOfSamplesF));
	ssdoIndirectBounceShader.setUniform('numberOfSamplesF', 'f', numberOfSamplesF);
	ssdoIndirectBounceShader.setUniform('randomDirections', 'v3v', randomDirections);
	ssdoIndirectBounceShader.setUniform('directLightBuffer90', 't', directLightBuffer90);
	ssdoIndirectBounceShader.setUniform('cameraProjectionM90', 'm4', camera90.projectionMatrix);
	ssdoIndirectBounceShader.setUniform('cameraViewMatrix90', 'm4', camera90.matrixWorldInverse);
	ssdoIndirectBounceShader.setUniform('normalsAndDepthBuffer90', 't', normalsAndDepthTexture90);
	ssdoIndirectBounceShader.setUniform('positionsBuffer90', 't', coordsTexture90);
	ssdoIndirectBounceShader.setUniform('rmax', 'f', rmax2);
	ssdoIndirectBounceShader.setUniform('bounceIntensity', 'f', bounceIntensity);
	ssdoIndirectBounceShader.setUniform('enableMultipleViews', 'i', enableMultipleViews);
	ssdoIndirectBounceShader.setUniform('bias', 'f', ssdoBias);
	
	ssdoBlurBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	ssdoBlurAuxBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	ssdoBlurShader = new Shader();
	ssdoBlurShader.loadShader('shaders/texture.vert', 'vertex');
	ssdoBlurShader.loadShader('shaders/ssdoBlur.frag', 'fragment');
	ssdoBlurShader.setUniform('positionsBuffer', 't', coordsTexture);
	ssdoBlurShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	ssdoBlurShader.setUniform('patchSize', 'i',Math.round(patchSizeF));
	ssdoBlurShader.setUniform('patchSizeF', 'f',patchSizeF);
	ssdoBlurShader.setUniform('sigma', 'f', sigma);
	ssdoBlurShader.setUniform('gaussianCoeff', 'fv1', gaussianCoeff);

 	ssdoFinalBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	ssdoFinalShader = new Shader();
	ssdoFinalShader.loadShader('shaders/texture.vert', 'vertex');
	ssdoFinalShader.loadShader('shaders/ssdoFinal.frag', 'fragment'); 
	ssdoFinalShader.setUniform('directLightBuffer', 't', directLightBuffer);
	ssdoFinalShader.setUniform('indirectBounceBuffer', 't', ssdoBlurBuffer);


	// SSAO shaders
	ssaoOnlyBuffer = new THREE.WebGLRenderTarget(renderingWidth, renderingHeight, options);
	ssaoOnlyShader = new Shader();
	ssaoOnlyShader.loadShader('shaders/texture.vert', 'vertex');
	ssaoOnlyShader.loadShader('shaders/SSAOOnly.frag', 'fragment');
	ssaoOnlyShader.setUniform('positionsBuffer', 't', coordsTexture);
	ssaoOnlyShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	ssaoOnlyShader.setUniform('secondDepthBuffer', 't', secondDepthTexture);
	ssaoOnlyShader.setUniform('randomTexture', 't', randomTexture);
	ssaoOnlyShader.setUniform('randomDirections', 'v3v', randomDirections);
	ssaoOnlyShader.setUniform('cameraProjectionM', 'm4', camera.projectionMatrix);
	ssaoOnlyShader.setUniform('cameraViewMatrix', 'm4', camera.matrixWorldInverse);
	ssaoOnlyShader.setUniform('numberOfSamples', 'i', Math.round(numberOfSamplesF));
	ssaoOnlyShader.setUniform('numberOfSamplesF', 'f', numberOfSamplesF);
	ssaoOnlyShader.setUniform('rmax', 'f', rmax1);
	ssaoOnlyShader.setUniform('bias', 'f', ssaoBias);

	ssaoDiffuseBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	ssaoDiffuseShader = new Shader();
	ssaoDiffuseShader.loadShader('shaders/texture.vert', 'vertex');
	ssaoDiffuseShader.loadShader('shaders/SSAO.frag', 'fragment');
	ssaoDiffuseShader.setUniform('positionsBuffer', 't', coordsTexture);
	ssaoDiffuseShader.setUniform('normalsAndDepthBuffer', 't', normalsAndDepthTexture);
	ssaoDiffuseShader.setUniform('diffuseTexture', 't', diffuseTexture);
	ssaoDiffuseShader.setUniform('ssaoBuffer', 't', ssaoBlurBuffer);
	ssaoDiffuseShader.setUniform('lightsPos', 'v3v', lightsPos);
	ssaoDiffuseShader.setUniform('lightsColor', 'v4v', lightsColor);
	ssaoDiffuseShader.setUniform('lightsIntensity', 'fv1', lightsIntensity);

	//SSAO Blur Buffer (use the ssdoBlur shader)	
	ssaoBlurBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	ssaoBlurAuxBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, options);
	
}

/**
 * Process objects to add some information
 */
function processObjects() {
	var i = objects.length;
	while (i--) {
		if (!objects[i].composedObject) {
			objects[i].previousModelMatrix = new THREE.Matrix4();
			objects[i].previousModelMatrix.copy(objects[i].matrixWorld);
		}
	}
}

/**
 * Initialization of the world
 */
function initScene() {
	scene = new THREE.Scene();
	sceneScreen = new THREE.Scene();
	//scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

	var plane = new THREE.PlaneGeometry(renderingWidth, renderingHeight);
	// dof
	dofScene = new THREE.Scene();
	dofQuad = new THREE.Mesh(plane);
	dofScene.add(dofQuad);
	
	// shadow maps blur
	smScene = new THREE.Scene();
	smQuad = new THREE.Mesh(plane);
	smScene.add(smQuad);
	
	screenSpaceScene = new THREE.Scene();
	screenSpaceQuad = new THREE.Mesh(plane);
	screenSpaceScene.add(screenSpaceQuad);
	
	// ssao
	ssaoScene = new THREE.Scene();
	ssaoQuad = new THREE.Mesh(plane);
	ssaoScene.add(ssaoQuad);

	// ssdo
	ssdoScene = new THREE.Scene();
	ssdoQuad = new THREE.Mesh(plane);
	ssdoScene.add(ssdoQuad);

	scenes[currentScene].loadWorld();
	
	processObjects();
	
	//phongShader.setAttribute('displacement', 'f', []);
	// now populate the array of attributes
	/*var vertices = sphere.geometry.vertices;
	var values = attributes.displacement.value
	for(var v = 0; v < vertices.length; v++) {
		values.push(Math.random() * 30);
	}*/
}

/**
 * Initialization of display manager
 */
function initDisplayManager() {
	// displays for the different renderings
	displayManager = new DisplayManager(sceneScreen);
	//displayManager.addGrid('shadows', customDisplays['shadows'].names);
	//displayManager.addGrid('ssdo', customDisplays['ssdo'].names);
	displayManager.addCustomTextureShader(displayDepthShader, normalsAndDepthTexture, 'depth');
	displayManager.addCustomTexture(normalsAndDepthTexture, 'shaders/displayNormals.frag', 'normals');
	displayManager.addCustomTextureShader(displayDepthNormalsShader, normalsAndDepthTexture, 'depthAndNormals');
	displayManager.addSimpleTexture(rtTextures['phong'], 'phong');
	displayManager.addSimpleTexture(rtTextures['expressive'], 'expressive');
	displayManager.addSimpleTexture(rtTextures['diffuse'], 'diffuse');
	displayManager.addSimpleTexture(diffuseTexture, 'diffuseMap');
	displayManager.addCustomTextureShader(displayShadowMapShader, shadowMaps[0], 'shadowMap1');
	displayManager.addCustomTextureShader(displayShadowMapShader, shadowMaps[1], 'shadowMap2');
	displayManager.addSimpleTexture(shadowsTexture, 'shadows');
	displayManager.addSimpleTexture(dofAuxTexture, 'dofBlurAux');
	displayManager.addSimpleTexture(DOFBlurTexture, 'dofBlur');
	displayManager.addSimpleTexture(DOFImageTexture, 'dofImage');
	displayManager.addSimpleTexture(ssaoOnlyBuffer, 'ssaoOnly');
	displayManager.addSimpleTexture(ssaoBlurBuffer, 'ssaoBlur');
	displayManager.addSimpleTexture(ssaoDiffuseBuffer, 'ssaoDiffuse');
	displayManager.addSimpleTexture(directLightBuffer, 'ssdoDirect');
	displayManager.addSimpleTexture(ssdoIndirectBounceBuffer, 'ssdoIndirectBounce');
	displayManager.addSimpleTexture(ssdoBlurBuffer, 'ssdoBlur');
	displayManager.addSimpleTexture(ssdoFinalBuffer, 'ssdoFinal');
	displayManager.addDisplay(randomShader, 'random');
	displayManager.addCustomTextureShader(displayDepthShader, secondDepthTexture, 'secondDepth');
	displayManager.addDisplay(displayVelocityShader, 'velocity');
	displayManager.addSimpleTexture(motionBlurTexture, 'motionBlur');
	displayManager.addSimpleTexture(diffuseTexture90, 'diffuse90');
	displayManager.addSimpleTexture(directLightBuffer90, 'ssdoDirect90');
	displayManager.display(customDisplays[MODE]);
}

/**
 * Camera controled by a trackball
 */
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

/**
 * Initialization
 */
function init() {
	camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
	previousCameraViewMatrix = new THREE.Matrix4();
	previousCameraViewMatrix.copy(camera.matrixWorldInverse);
	
	cameraRTT = new THREE.OrthographicCamera(renderingWidth / - 2, renderingWidth / 2, renderingHeight / 2, renderingHeight / - 2, -10000, 10000);

	//SSDO
	camera90 = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
	camera90.position.y = 200;
	camera90.position.z = 300;
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
	scenes[currentScene].setCamera();

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
