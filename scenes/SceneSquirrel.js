scenes["squirrel"] = new Scene();

scenes["squirrel"].loadLights = function() {
	lights[0] = new Light(
		new THREE.Vector3(-400.0, 400.0, 400.0),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
	lights[1] = new Light(
		new THREE.Vector3(400, 400, 400),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
}

scenes["squirrel"].setCamera = function() {
	camera.position.x = 0;
	camera.position.y = 100;
	camera.position.z = 500;
	controls.target = new THREE.Vector3(0.0, 0.0, 0.0);
}

scenes["squirrel"].loadWorld = function() {
	loadOFF('models/ground.off', 200);
	objects[0].position.y = -50;
	objects[0].rotation.x = - Math.PI/2;
	materials[0] = jQuery.extend(true, {}, blankMaterial);
	materials[0]['matDiffuseColor'] = new THREE.Vector4(0.0, 0.8, 0.0, 1.0);
	materials[0]['matSpecular'] = 0.0;
	scene.add(objects[0]);
	
	var cols = 5;
	
	// loop does not work -> strange
	/*for (var i = 1 ; i < 3 ; i++) {
		objects[i] = new THREE.Mesh();
		materials[i] = jQuery.extend(true, {}, blankMaterial);
	}*/
	
	/*for (var i = 1 ; i < 3 ; i++) {
		loadOBJ(
			i,
			function (event) {
				objects[i].position.y = 0;
				objects[i].position.x = -200 + ((i-1) % cols) * 100;
				objects[i].position.z = 160 + ((i-1) / cols) * 100;
				materials[i] = jQuery.extend(true, {}, blankMaterial);
				scene.add(objects[i]);
			},
			'models/obj/squirrel/squirrel.obj',
			'models/obj/squirrel/squirrel.mtl'
		);
	}*/
	
	function positionSquirrel(i) {
		objects[i].position.y = 0;
		objects[i].position.x = -200 + (Math.round(Math.round(i-1) % cols)) * 100;
		objects[i].position.z = 160 - (Math.round(Math.round((i-1)) / cols)) * 100;
		materials[i] = jQuery.extend(true, {}, blankMaterial);
		scene.add(objects[i]);
	}
	
	loadOBJ(
		1,
		function (event) {
			positionSquirrel(1);
			//objects[1].position.y = 100;
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		2,
		function (event) {
			positionSquirrel(2);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		3,
		function (event) {
			positionSquirrel(3);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		4,
		function (event) {
			positionSquirrel(4);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		5,
		function (event) {
			positionSquirrel(5);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		6,
		function (event) {
			positionSquirrel(6);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		7,
		function (event) {
			positionSquirrel(7);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		8,
		function (event) {
			positionSquirrel(8);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		9,
		function (event) {
			positionSquirrel(9);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		10,
		function (event) {
			positionSquirrel(10);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		11,
		function (event) {
			positionSquirrel(11);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		12,
		function (event) {
			positionSquirrel(12);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	loadOBJ(
		13,
		function (event) {
			positionSquirrel(13);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		14,
		function (event) {
			positionSquirrel(14);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		15,
		function (event) {
			positionSquirrel(15);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		16,
		function (event) {
			positionSquirrel(16);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		17,
		function (event) {
			positionSquirrel(17);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		18,
		function (event) {
			positionSquirrel(18);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		19,
		function (event) {
			positionSquirrel(19);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		20,
		function (event) {
			positionSquirrel(20);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
	
	loadOBJ(
		21,
		function (event) {
			positionSquirrel(21);
		},
		'models/obj/squirrel/squirrel.obj',
		'models/obj/squirrel/squirrel.mtl'
	);
}
