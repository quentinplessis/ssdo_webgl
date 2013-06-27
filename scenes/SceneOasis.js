scenes["oasis"] = new Scene();

scenes["oasis"].loadLights = function() {
	lights[0] = new Light(
		new THREE.Vector3(-400, 200, 180),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
	//lights[0].setLookAt(0.0, 100.0, 0.0);
	lights[1] = new Light(
		new THREE.Vector3(-400, 200, -180),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
}

scenes["oasis"].setCamera = function() {
	camera.position.x = -500;
	camera.position.y = 100;
	camera.position.z = 0;
	controls.target = new THREE.Vector3(0.0, 10.0, 0.0);
}

scenes["oasis"].loadWorld = function() {
	loadOBJ(
		0,
		function (event) {
			objects[0].position.y = -70;
			objects[0].position.x = 0;
			materials[0] = jQuery.extend(true, {}, blankMaterial);
			scene.add(objects[0]);
		},
		'models/obj/oasis/oasis.obj',
		'models/obj/oasis/oasis.mtl'
	);
}
