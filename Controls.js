/**
 * Controls.js
 * Displays a control panel allowing the user to change
 * significant parameters.
 * Authors : Quentin Plessis, Antoine Toisoul
 */

var FizzyText = function() {	
	// views
	this.scene = currentScene;
	this.gridDisplayed = MODE;
	this.nextView = function() { if (!displayManager.nextView()) { MODE = 'all'; } render(); };
	this.previousView = function() { if (!displayManager.previousView()) { MODE = 'all'; } render(); };
	// lights
	this.allLights = false;
	this.selectedLight = 0;
	this.lightControl = false;
	this.lightColor = "#ffffff";
	this.lightIntensity = lightDefaultIntensity;
	this.lightAngle = lightDefaultAngle;
	this.skyLightIntensity = skyLightIntensity;
	this.lightAttenuation = lightDefaultAttenuation;
	this.lightFar = lightNearFar[1];
	// shadows
	this.mapsResolution = shadowMapsResolution;
	this.vsm = shadowMode == 1;
	this.shadowBlur = blurShadowMaps;
	this.shadowMapsBlurSize = shadowMapsBlurSize;
	// dof
	this.dofResolution = dofResolution;
	this.focusDistance = focusDistance;
	this.focal = focal;
	this.fStop = fStop;
	// motion blur
	this.mbIntensity = mbIntensity;
	this.mbSamples = mbSamples;
	//SSDO
	this.rmax1 = rmax1;
	this.rmax2 = rmax2;
	this.bounceIntensity = bounceIntensity;
	this.numberOfSamplesF = numberOfSamplesF;
	this.enableMultipleViews = enableMultipleViews;
	//Blur
	this.patchSizeF = patchSizeF;
	this.sigma = sigma;
};

function initControls(json) {
	var text = new FizzyText();
	fizzyText = text;
	var gui = new dat.GUI();/*({
		load: json//,
		//preset: 'Flow'
	});*/
	//gui.remember(text);
	gui.close();
	
/**
 * Views
 */
	var displaysFolder = gui.addFolder('Views');
	displaysFolder.add(text, 'scene', {'Scene1': 'scene1', 'Sponza': 'sponza', 'Cornel': 'cornel', 'Squirrels': 'squirrel', 'Mario': 'bird', 'Scene3': 'scene3'}).name('Scene').onChange(function(value) {
		scene = new THREE.Scene();
		sceneScreen = new THREE.Scene();
		objects = [];
		materials = []; lights = []; lightsPos = []; lightsColor = [];
		lightsIntensity = []; lightsCameras = []; lightsView = []; lightsProj = [];
		lightsAngle = []; lightsAttenuation = []; shadowMaps = [];
		var shaders = [], rtTextures = [];
		currentScene = value;
		initLights();
		initShaders();
		scenes[currentScene].loadWorld();
		scenes[currentScene].setCamera();
		initDisplayManager();
		render();
	});
	displaysFolder.add(text, 'gridDisplayed', {'Overview': 'all', 'Normal': 'normal', 'Shadows': 'shadows', 'SSAO': 'ssao', 'SSDO': 'ssdo', 'Depth of Field': 'dof', 'Motion blur': 'motionBlur'}).name('Grid').onChange(function(value) {
		MODE = value;
		displayManager.display(customDisplays[MODE]);
		render();
	});
	displaysFolder.add(text, 'nextView').name('Next view');
	displaysFolder.add(text, 'previousView').name('Previous view');
	//displaysFolder.open();
	
/**
 * Lights
 */
	var lightsFolder = gui.addFolder('Lights');
	lightsFolder.add(text, 'skyLightIntensity', 0, 1).step(0.05).name('Sky light').onChange(function(value) {
		skyLightIntensity = value;
		shadowsShader.setUniform('skyLightIntensity', 'f', skyLightIntensity);
		render();
	});
	lightsFolder.add(text, 'allLights').name('All');
	var lightsToSelect = {};
	for (var i = 0 ; i < lights.length ; i++)
		lightsToSelect["Light " + i] = i;
	lightsFolder.add(text, 'selectedLight', lightsToSelect).name('Light').onChange(function(value) {
		if (text.lightControl)
			initCameraControls(lightsCameras[value]);
	});
	lightsFolder.add(text, 'lightControl').name('Take control').onChange(function(value) {
		if (value)
			initCameraControls(lightsCameras[text.selectedLight]);
		else
			initCameraControls(camera);
	});
	lightsFolder.addColor(text, 'lightColor').name('Color').onChange(function(value) {
		if (text.allLights)
			for (var i = 0 ; i < lights.length ; i++) {
				lights[i].setHexaColor(value);
				lightsColor[i] = lights[i].getColor();
			}
		else {
			lights[text.selectedLight].setHexaColor(value);
			lightsColor[text.selectedLight] = lights[text.selectedLight].getColor();
		}
		render();
	});
	lightsFolder.add(text, 'lightIntensity', 0.0, 2.0).name('Intensity').onChange(function(value) {
		if (text.allLights)
			for (var i = 0 ; i < lights.length ; i++)
				lightsIntensity[i] = value;
		else
			lightsIntensity[text.selectedLight] = value;
		render();
	});
	lightsFolder.add(text, 'lightAngle', 0.0, 360.0).name('Angle').onChange(function(value) {
		if (text.allLights)
			for (var i = 0 ; i < lights.length ; i++)
				lightsAngle[i] = value;
		else
			lightsAngle[text.selectedLight] = value;
		render();
	});
	lightsFolder.add(text, 'lightAttenuation', 0.0, 5.0).name('Attenuation').onChange(function(value) {
		if (text.allLights)
			for (var i = 0 ; i < lights.length ; i++)
				lightsAttenuation[i] = value;
		else
			lightsAttenuation[text.selectedLight] = value;
		render();
	});
	lightsFolder.add(text, 'lightFar', 500.0, 10000.0).name('Far').onChange(function(value) {
		lightNearFar[1] = value;
		displayShadowMapShader.setUniform('lightNearFar', 'fv1', lightNearFar);
		displayManager.addCustomTextureShader(displayShadowMapShader, shadowMaps[0], 'shadowMap1');
		displayManager.addCustomTextureShader(displayShadowMapShader, shadowMaps[1], 'shadowMap2');
		for (var i = 0 ; i < lights.length ; i++) {
			lightsCameras[i] = new THREE.PerspectiveCamera(lightViewAngle, lightRatio, lightNearFar[0], lightNearFar[1]);
			//lightsCameras[i] = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 1000 );
			lightsCameras[i].position = lightsPos[i];
			lightsCameras[i].lookAt(lights[i].getLookAt()); 
		}
		render();
	});
	//lightsFolder.open();

/**
 * Shadows
 */
	var shadowsFolder = gui.addFolder("Shadows");
	shadowsFolder.add(text, 'mapsResolution', 0, 512).name("Shadow maps resolution").onChange(function(value) {
		shadowMapsResolution = Math.round(value);
		refactorShadowMaps();
		render();
	});
	shadowsFolder.add(text, 'vsm').name("VSM").onChange(function(value) {
		if (value)
			shadowMode = 1; // VSM
		else
			shadowMode = 0; // hardshadows
		shadowsShader.setUniform('shadowMode', 'i', shadowMode);
		render();
	});
	shadowsFolder.add(text, 'shadowBlur').name("Blur").onChange(function(value) {
		blurShadowMaps = value;
		render();
	});
	shadowsFolder.add(text, 'shadowMapsBlurSize', 0.0, 30.0).name("Blur size").onChange(function(value) {
		shadowMapsBlurSize = value;
		shadowMapBlurShader.setUniform('blurSize', 'f', shadowMapsBlurSize);
		render();
	});
	//shadowsFolder.open();

/**
 * Depth of field
 */
	var dofFolder = gui.addFolder("Depth of Field");
	dofFolder.add(text, 'dofResolution', 0, 512).name("Blur resolution").onChange(function(value) {
		dofResolution = Math.round(value);
		DOFBlurTexture = new THREE.WebGLRenderTarget(dofResolution, dofResolution, options);
		dofAuxTexture = new THREE.WebGLRenderTarget(dofResolution, dofResolution, options);
		DOFImageShader.setUniform('dofBlur', 't', DOFBlurTexture);
		displayManager.addSimpleTexture(DOFBlurTexture, 'dofBlur');
		displayManager.addSimpleTexture(dofAuxTexture, 'dofBlurAux');
		displayManager.organize();
		render();
	});
	dofFolder.add(text, 'focusDistance', 0, 1500).name("Focus distance").onChange(function(value) {
		focusDistance = value;
		blurCoeff = focal * focal / ((focusDistance - focal) * fStop);
		DOFBlurShader.setUniform('blurCoefficient', 'f', blurCoeff);
		DOFImageShader.setUniform('blurCoefficient', 'f', blurCoeff);
		DOFBlurShader.setUniform('focusDistance', 'f', focusDistance);
		DOFImageShader.setUniform('focusDistance', 'f', focusDistance);
		render();
	});
	dofFolder.add(text, 'focal', 0, 200).name("Focal").onChange(function(value) {
		focal = value;
		blurCoeff = focal * focal / ((focusDistance - focal) * fStop);
		DOFBlurShader.setUniform('blurCoefficient', 'f', blurCoeff);
		DOFImageShader.setUniform('blurCoefficient', 'f', blurCoeff);
		render();
	});
	dofFolder.add(text, 'fStop', 0, 100).name("F-Stop").onChange(function(value) {
		fStop = value;
		blurCoeff = focal * focal / ((focusDistance - focal) * fStop);
		DOFBlurShader.setUniform('blurCoefficient', 'f', blurCoeff);
		DOFImageShader.setUniform('blurCoefficient', 'f', blurCoeff);
		render();
	});
	//dofFolder.open();

/**
 * Motion blur
 */
	var motionBlurFolder = gui.addFolder("Motion blur");
	motionBlurFolder.add(text, 'mbIntensity', 0.0, 20.0).name("Intensity").onChange(function(value) {
		velocityShader.setUniform('intensity', 'f', value);
		render();
	});
	motionBlurFolder.add(text, 'mbSamples', 1.0, 50.0).name("Intensity").onChange(function(value) {
		motionBlurShader.setUniform('samplesNumber', 'f', value);
		render();
	});
	//motionBlurFolder.open();

	var ssdoFolder = gui.addFolder("SSDO");
	ssdoFolder.add(text, 'rmax1', 0, 128).name("Rmax1").onChange(function(value) {
		rmax1 = value;
		ssdoDirectLightingShader.setUniform('rmax', 'f', rmax1);	
		ssaoOnlyShader.setUniform('rmax', 'f', rmax1);	
		ssaoDiffuseShader.setUniform('rmax', 'f', rmax1);	
		render();
	});
	ssdoFolder.add(text, 'rmax2', 0, 128).name("Rmax2").onChange(function(value) {
		rmax2 = value;
		ssdoIndirectBounceShader.setUniform('rmax', 'f', rmax2);
		render();
	});

	ssdoFolder.add(text, 'numberOfSamplesF', 0, 32).name("Samples").onChange(function(value) {
		numberOfSamplesF = value;
		numberOfSamples = Math.round(value);
		ssdoDirectLightingShader.setUniform('numberOfSamples', 'i', Math.round(numberOfSamplesF));
		ssdoDirectLightingShader.setUniform('numberOfSamplesF', 'f', numberOfSamplesF);
		ssdoIndirectBounceShader.setUniform('numberOfSamples', 'i', Math.round(numberOfSamplesF));
		ssdoIndirectBounceShader.setUniform('numberOfSamplesF', 'f', numberOfSamplesF);
		render();
	});

	ssdoFolder.add(text, 'bounceIntensity', 0, 100).name("Intensity").onChange(function(value) {
		bounceIntensity = value;
		ssdoIndirectBounceShader.setUniform('bounceIntensity', 'f', bounceIntensity);
		render();
	});

	ssdoFolder.add(text, 'enableMultipleViews').name("Multiple Views").onChange(function(value) {
		if(value)
			enableMultipleViews = 0;
		else
			enableMultipleViews = 1;
		ssdoIndirectBounceShader.setUniform('enableMultipleViews', 'i', enableMultipleViews);
		render();
	});

	var blurFolder = gui.addFolder("Blur");
	blurFolder.add(text, 'patchSizeF', 0, 128).name("Size").onChange(function(value) {
		patchSizeF = value;
		ssdoBlurShader.setUniform('patcheSize', 'i', Math.round(patchSizeF));	
		ssdoBlurShader.setUniform('patcheSizeF', 'f', patchSizeF);	
		render();
	});
	blurFolder.add(text, 'sigma', 0, 1000).name("Sigma").onChange(function(value) {
		sigma = value;
		ssdoBlurShader.setUniform('sigma', 'f', sigma);	
		render();
	});
}

