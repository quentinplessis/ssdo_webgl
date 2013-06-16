scenes["scene3"] = new Scene();

scenes["scene3"].loadLights = function() {
	lights[0] = new Light(
		new THREE.Vector3(-200, 20, 200),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
	lights[1] = new Light(
		new THREE.Vector3(200, 400, 150),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		0.0
	);
}

scenes["scene3"].setCamera = function() {
	camera.position.x = -500;
	camera.position.y = 800;
	camera.position.z = 0;
	controls.target = new THREE.Vector3(0.0, 0.0, 0.0);
}

scenes["scene3"].loadWorld = function() {
	/*loadOFF('models/ram.off');
	objects[0].position.x = 0;
	objects[0].position.z = 0;
	objects[0].position.y = -50;
	objects[0].rotation.x = - Math.PI / 2;
	materials[0] = jQuery.extend(true, {}, blankMaterial);
	materials[0]['matDiffuseColor'] = new THREE.Vector4(0.5, 0.0, 0.5, 1.0);
	//materials[0]['matEmissiveColor'] = new THREE.Vector4(0.0, 1.0, 0, 1.0);
	//materials[0]['matEmissive'] = 0.8;
	scene.add(objects[0]);*/
	
	objects[0] = new THREE.Mesh( new THREE.CubeGeometry( 50, 50, 50 ));
	objects[0].position.y = -50;
	objects[0].position.x = -50;
	objects[0].position.z = 50;
	materials[0] = jQuery.extend(true, {}, blankMaterial);
	materials[0]['matDiffuseColor'] = new THREE.Vector4(0.5, 0.0, 0.5, 1.0);
	scene.add(objects[0]);
	
	loadOFF('models/ground.off', 200);
	objects[1].position.y = -100;
	objects[1].rotation.x = - Math.PI / 2;
	materials[1] = jQuery.extend(true, {}, blankMaterial);
	materials[1]['matDiffuseColor'] = new THREE.Vector4(1.0, 1.0, 1.0, 1.0);
	materials[1]['matSpecular'] = 0.0;
	scene.add(objects[1]);
}