scenes["scene1"] = new Scene();

scenes["scene1"].loadLights = function() {
	lights[0] = new Light(
		new THREE.Vector3(250, 200, 180),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
	lights[1] = new Light(
		new THREE.Vector3(-200, 400, 150),
		new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
		1.0
	);
}

scenes["scene1"].loadWorld = function() {
	// sphere
	var sphereMaterial = new THREE.MeshLambertMaterial({color: 0xCC0000});
	var radius = 50, segments = 16, rings = 16;
	var sphereGeometry = new THREE.SphereGeometry(radius, segments, rings);
	objects[0] = new THREE.Mesh(sphereGeometry);
	//objects[0].rotation.y = Math.PI / 2;
	objects[0].position.y = -50;
	materials[0] = jQuery.extend(true, {}, blankMaterial);
	materials[0]['matSpecular'] = 0.5;
	materials[0]['matDiffuseColor'] = new THREE.Vector4(1.0, 0.0, 0.0, 1.0);
	materials[0]['texture'] = testTexture;
	scene.add(objects[0]);
	//objects[0].add(camera);
	
/*	var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
	objects[1] = new THREE.Mesh(geometry);
	objects[1].position.x = -100;
	objects[1].position.z = -100;
	objects[1].position.y = -50;
	materials[1] = materials[0];
	scene.add(objects[1]);
*/	
	// off importation
	
	loadOFF('models/monkey.off');
	objects[1].position.x = 150;	
	objects[1].position.y = -50;
	materials[1] = jQuery.extend(true, {}, blankMaterial);
	materials[1]['matDiffuseColor'] = new THREE.Vector4(0.2, 1.0, 0.2, 1.0);
	materials[1]['matSpecular'] = 0.8;
	//materials[2]['matSpecularColor'] = new THREE.Vector4(0.0, 0.0, 1.0, 1.0);
	scene.add(objects[1]);

	loadOFF('models/ground.off', 200);
	objects[2].position.y = -100;
	objects[2].rotation.x = - Math.PI/2;
	materials[2] = jQuery.extend(true, {}, blankMaterial);
	materials[2]['matDiffuseColor'] = new THREE.Vector4(1.0, 1.0, 1.0, 1.0);
	materials[2]['matSpecular'] = 0.0;
	scene.add(objects[2]);

	loadOFF('models/ground.off', 200);
	objects[3].position.y = -100;
	objects[3].position.x = -200;
	objects[3].rotation.y =  Math.PI / 2;
	materials[3] = jQuery.extend(true, {}, blankMaterial);
	materials[3]['matDiffuseColor'] = new THREE.Vector4(0.0, 1.0, 0.0, 1.0);
	materials[3]['matSpecular'] = 0.0;
	scene.add(objects[3]);
	
	loadOFF('models/ram.off');
	objects[4].position.x = -80;
	objects[4].position.z = -200;
	objects[4].position.y = -50;
	objects[4].rotation.x = - Math.PI / 2;
	materials[4] = jQuery.extend(true, {}, blankMaterial);
	materials[4]['matDiffuseColor'] = new THREE.Vector4(0.5, 0.0, 0.5, 1.0);
	//materials[3]['matEmissiveColor'] = new THREE.Vector4(0.0, 1.0, 0, 1.0);
	//materials[3]['matEmissive'] = 0.8;
	scene.add(objects[4]);

	var loader = new THREE.OBJMTLLoader();
	loader.addEventListener('load', function (event) {
		objects[5] = event.content;
		objects[5].traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.saveMaterial = child.material;
			}
		});
		objects[5].setMaterial = function(material) {
			this.traverse(function (child) {
				if (child instanceof THREE.Mesh) {
					child.setMaterial(material);
				}
			});
		};
		objects[5].setComposedMaterial = function(shader) {
			this.traverse(function (child) {
				if (child instanceof THREE.Mesh) {
					if (child.material != null) {
						shader.setUniform('isTextured', 'i', 1);
						shader.setUniform('texture', 't', child.saveMaterial.map);
						child.setMaterial(shader.createMaterial());
					}
					else {
						shader.setUniform('isTextured', 'i', 0);
						shader.setUniform('texture', 't', null);
					}
				}
			});
		}
		materials[5] = jQuery.extend(true, {}, blankMaterial);
		//materials[5]['matDiffuseColor'] = new THREE.Vector4(0.0, 0.0, 1.0, 1.0);
		objects[5].position.y = -70;
		objects[5].position.x = 70;
		scene.add(objects[5]);
	});
	//loader.load('models/obj/female02/female02.obj', 'models/obj/female02/female02.mtl');
}
