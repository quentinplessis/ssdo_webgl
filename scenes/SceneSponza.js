scenes["sponza"] = new Scene();

scenes["sponza"].loadLights = function() {
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

scenes["sponza"].setCamera = function() {
	camera.position.x = 0;
	camera.position.y = 200;
	camera.position.z = 300;
	controls.target = new THREE.Vector3(0.0, 0.0, 0.0);
}

scenes["sponza"].loadWorld = function() {
	loadOBJ(
		0,
		function (event) {
			objects[0].position.y = -70;
			objects[0].position.x = 0;
			materials[0] = jQuery.extend(true, {}, blankMaterial);
			scene.add(objects[0]);
		},
		'models/obj/sponza/sponza.obj',
		'models/obj/sponza/sponza.mtl'
	);
}
