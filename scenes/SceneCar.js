scenes["car"] = new Scene();

scenes["car"].loadLights = function() {
	lights[0] = new Light(
		new THREE.Vector3(-200.0, 200.0, 200.0),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
	lights[1] = new Light(
		new THREE.Vector3(200, 200, 200),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
}

scenes["car"].setCamera = function() {
	camera.position.x = 0;
	camera.position.y = 100;
	camera.position.z = 200;
	controls.target = new THREE.Vector3(0.0, 0.0, 0.0);
}

scenes["car"].loadWorld = function() {
	loadOFF('models/ground.off', 200);
	objects[0].position.y = -50;
	objects[0].rotation.x = - Math.PI/2;
	materials[0] = jQuery.extend(true, {}, blankMaterial);
	materials[0]['matDiffuseColor'] = new THREE.Vector4(0.5, 0.5, 0.5, 1.0);
	materials[0]['matSpecular'] = 0.0;
	scene.add(objects[0]);
	
	loadOBJ(
		1,
		function (event) {
			objects[1].position.y = 0;
			objects[1].position.x = 0;
			objects[1].position.z = 0;
			materials[1] = jQuery.extend(true, {}, blankMaterial);
			scene.add(objects[1]);
		},
		'models/obj/Aventador/Avent.obj',
		'models/obj/Aventador/Avent.mtl'
	);
}
