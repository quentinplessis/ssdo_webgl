/**
 * OBJ.js
 * Loads an OBJ file by using THREE JS examples provided OBJ loader,
 * adapted to be compatible with the rest of the pipeline.
 * Author : Quentin Plessis
 */
 
function loadOBJ(i, initObj, obj, mtl) {
	var loader = new THREE.OBJMTLLoader();
	loader.addEventListener('load', function (event) {
		objects[i] = event.content;
		objects[i].composedObject = true;
		objects[i].traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.saveMaterial = jQuery.extend(true, {}, child.material);
				child.previousModelMatrix = new THREE.Matrix4();
				child.previousModelMatrix.copy(child.matrixWorld);
			}
		});
		objects[i].updateModelMatrix = function() {
			this.traverse(function (child) {
				if (child instanceof THREE.Mesh)
					child.previousModelMatrix.copy(child.matrixWorld);
			});
		};
		objects[i].setMaterial = function(material) {
			this.traverse(function (child) {
				if (child instanceof THREE.Mesh)
					child.setMaterial(material);
			});
		};
		objects[i].setShaderMaterial = function(shader) {
			this.traverse(function (child) {
				if (child instanceof THREE.Mesh) {
					shader.setUniform('matDiffuseColor', 'v4', child.saveMaterial.params.diffuse);
					shader.setUniform('matDiffuse', 'f', 1.0);
					shader.setUniform('isTextured', 'i', child.saveMaterial.params.diffuseMap == null ? 0 : 1);
					shader.setUniform('diffMap', 't', child.saveMaterial.params.diffuseMap);
					shader.setUniform('matSpecularColor', 'v4', child.saveMaterial.params.specular);
					shader.setUniform('matSpecular', 'f', 0.3);
					shader.setUniform('shininess', 'f', 5.0);
					shader.setUniform('previousModelMatrix', 'm4', child.previousModelMatrix);
					child.setMaterial(shader.createMaterial());
				}
			});
		};
		initObj();
	});
	loader.load(obj, mtl);
}