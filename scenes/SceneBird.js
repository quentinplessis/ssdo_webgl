scenes["bird"] = new Scene();

scenes["bird"].loadLights = function() {
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

scenes["bird"].setCamera = function() {
	camera.position.x = 0;
	camera.position.y = 100;
	camera.position.z = 200;
	controls.target = new THREE.Vector3(0.0, 0.0, 0.0);
}

scenes["bird"].loadWorld = function() {
	loadOFF('models/ground.off', 200);
	objects[0].position.y = -50;
	objects[0].rotation.x = - Math.PI/2;
	materials[0] = jQuery.extend(true, {}, blankMaterial);
	materials[0]['matDiffuseColor'] = new THREE.Vector4(0.0, 0.0, 0.8, 1.0);
	materials[0]['matSpecular'] = 0.0;
	scene.add(objects[0]);
	
	
	function positionBird(i) {
		objects[i].position.y = 50;
		objects[i].position.x = 0;
		objects[i].position.z = 70;
		materials[i] = jQuery.extend(true, {}, blankMaterial);
		scene.add(objects[i]);
	}
	
	loadOBJ(
		1,
		function (event) {
			positionBird(1);
		},
		'models/obj/bird/bird.obj',
		'models/obj/bird/bird.mtl'
	);
	
	loadOBJ(
		2,
		function (event) {
			positionBird(2);
		},
		'models/obj/bird/bird.obj',
		'models/obj/bird/bird.mtl'
	);
	
	loadOBJ(
		3,
		function (event) {
			positionBird(3);
		},
		'models/obj/bird/bird.obj',
		'models/obj/bird/bird.mtl'
	);
	
	loadOBJ(
		4,
		function (event) {
			objects[4].position.y = -50;
			objects[4].position.x = 50;
			objects[4].position.z = 0;
			materials[4] = jQuery.extend(true, {}, blankMaterial);
			scene.add(objects[4]);
		},
		'models/obj/mario_luigi/mario_obj.obj',
		'models/obj/mario_luigi/mario_obj.mtl'
	);
}
