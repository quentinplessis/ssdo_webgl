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

scenes["sponza"].loadWorld = function() {
	var loader = new THREE.OBJMTLLoader();
	loader.addEventListener('load', function (event) {
		objects[0] = event.content;
		objects[0].composedObject = true;
		objects[0].traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.saveMaterial = jQuery.extend(true, {}, child.material);
			}
		});
		objects[0].setMaterial = function(material) {
			this.traverse(function (child) {
				if (child instanceof THREE.Mesh) {
					child.setMaterial(material);
				}
			});
		};
		objects[0].setShaderMaterial = function(shader) {
			this.traverse(function (child) {
				if (child instanceof THREE.Mesh) {
					shader.setUniform('isTextured', 'i', child.saveMaterial.params.diffuseMap == null ? 0 : 1);
					shader.setUniform('diffMap', 't', child.saveMaterial.params.diffuseMap);
					child.setMaterial(shader.createMaterial());
				}
			});
		};
		objects[0].setComposedMaterial = function(shader) {
			var i = 0;
			this.traverse(function (child) {
				if (child instanceof THREE.Mesh) {
					if (child.material != null) {
						shader.setUniform('isTextured', 'i', 1);
						//alert("mat" + JSON.stringify(child.material.color, null, 4));
						child.material.color = null;
						//alert(JSON.stringify(child.saveMaterial.color, null, 4));
						child.saveMaterial.map = null;
						//console.info("ok " + JSON.stringify(child.saveMaterial.params));
						//console.info(JSON.stringify(child.saveMaterial, null, 4));
						var color = new THREE.Vector4((i % 2 == 0) ? 1.0 : 0.0, 1.0, 1.0, 1.0);
						shader.setUniform('matDiffuseColor', 'v4', child.saveMaterial.params.diffuse);
						shader.setUniform('matDiffuse', 'f', 1.0);
						shader.setUniform('texture', 't', child.saveMaterial.params.diffuseMap);
						var mat = shader.createMaterial();
						child.setMaterial(mat);
						i++;
					}
					else {
						shader.setUniform('isTextured', 'i', 0);
						shader.setUniform('texture', 't', null);
					}
				}
			});
		}
		materials[0] = jQuery.extend(true, {}, blankMaterial);
		//materials[5]['matDiffuseColor'] = new THREE.Vector4(0.0, 0.0, 1.0, 1.0);
		objects[0].position.y = -70;
		objects[0].position.x = 0;
		scene.add(objects[0]);
	});
	//loader.load('models/obj/female02/female02.obj', 'models/obj/female02/female02.mtl');
	loader.load('models/obj/sponza/sponza.obj', 'models/obj/sponza/sponza.mtl');
}