var FizzyText = function() {	
	// views
	this.scene = currentScene;
	this.gridDisplayed = 'overview';
	this.viewDisplayed = 'phong';
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
	this.lightPosX = 0.0;
	this.lightPosY = 0.0;
	this.lightPosZ = 0.0;
	// shadows
	this.mapsResolution = shadowMapsResolution;
	this.vsm = false;
	// dof
	this.dofResolution = dofResolution;
	this.focusDistance = focusDistance;
	this.focal = focal;
	this.fStop = fStop;
};

function initControls(json) {
	var text = new FizzyText();
	fizzyText = text;
	var gui = new dat.GUI();/*({
		load: json//,
		//preset: 'Flow'
	});*/
	gui.remember(text);
	
	var displaysFolder = gui.addFolder('Views');
	displaysFolder.add(text, 'scene', {'Scene1': 'scene1', 'Sponza': 'sponza', 'Scene3': 'scene3'}).name('Scene').onChange(function(value) {
		scene = new THREE.Scene();
		objects = [];
		materials = []; lights = []; lightsPos = []; lightsColor = [];
		lightsIntensity = []; lightsCameras = []; lightsView = []; lightsProj = [];
		lightsAngle = []; lightsAttenuation = []; shadowMaps = [];
		currentScene = value;
		initLights();
		initShaders();
		scenes[currentScene].loadWorld();
		initDisplayManager();
		render();
	});
	displaysFolder.add(text, 'gridDisplayed', {'Overview': 'all', 'Normal': 'normal', 'Shadows': 'shadows', 'SSDO': 'ssdo', 'Depth of Field': 'dof'}).name('Grid').onChange(function(value) {
		MODE = value;
		displayManager.display(customDisplays[MODE]);
		render();
	});
	displaysFolder.add(text, 'viewDisplayed', {'Texture': 'diffuseMap', 'Phong': 'phong', 'Hard shadows': 'hardShadows', 'Random': 'random'}).name('View').onChange(function(value) {
		MODE = 'all';
		displayManager.display({names: [text.viewDisplayed]});
		render();
	});
	displaysFolder.add(text, 'nextView').name('Next view');
	displaysFolder.add(text, 'previousView').name('Previous view');
	//displaysFolder.open();
	
	var lightsFolder = gui.addFolder('Lights');
	lightsFolder.add(text, 'skyLightIntensity', 0, 1).step(0.05).name('Sky light').onChange(function(value) {
		skyLightIntensity = value;
		hardShadowsShader.setUniform('skyLightIntensity', 'f', skyLightIntensity);
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
	lightsFolder.add(text, 'lightPosX').name('X').onChange(function(value) {
		if (text.allLights)
			for (var i = 0 ; i < lights.length ; i++)
				lightsPos[i].x = value;
		else
			lightsPos[text.selectedLight].x = value;
		render();
	});
	lightsFolder.add(text, 'lightPosY').name('Y').onChange(function(value) {
		if (text.allLights)
			for (var i = 0 ; i < lights.length ; i++)
				lightsPos[i].y = value;
		else
			lightsPos[text.selectedLight].y = value;
		render();
	});
	lightsFolder.add(text, 'lightPosZ').name('Z').onChange(function(value) {
		if (text.allLights)
			for (var i = 0 ; i < lights.length ; i++)
				lightsPos[i].z = value;
		else
			lightsPos[text.selectedLight].z = value;
		render();
	});
	//lightsFolder.open();
	
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
		hardShadowsShader.setUniform('shadowMode', 'i', shadowMode);
		render();
	});
	shadowsFolder.open();
	
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
	dofFolder.open();
}