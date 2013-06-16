scenes["cornel"] = new Scene();

scenes["cornel"].loadLights = function() {
	lights[0] = new Light(
		new THREE.Vector3(0.0, 700.0, 0),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
	lights[1] = new Light(
		new THREE.Vector3(400, 700, 0),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
}

scenes["cornel"].setCamera = function() {
	camera.position.x = 1000;
	camera.position.y = 500;
	camera.position.z = 0;
	controls.target = new THREE.Vector3(0.0, 400.0, 0.0);
}

scenes["cornel"].loadWorld = function() {
	loadOBJ(
		0,
		function (event) {
			objects[0].position.y = 0;
			objects[0].position.x = 0;
			materials[0] = jQuery.extend(true, {}, blankMaterial);
			scene.add(objects[0]);
		},
		'models/obj/cornel/cornel.obj',
		'models/obj/cornel/cornel.mtl'
	);
}
