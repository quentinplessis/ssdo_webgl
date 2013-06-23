/**
 * OFF.js
 * Loads an off file and adds it to the scene.
 * Author : Quentin Plessis
 */
 
function loadOFF(fileName, _scale) {
	$.ajax({
		url: fileName,
		async: false,
		dataType: 'text',
		context: {
			scale: _scale
		},
		complete: processOFF
	});
}

function processOFF(jqXHR, textStatus) {
	var lines = jqXHR.responseText.split("\n");
	if (lines[0] != "OFF")
			alert('Not an OFF file');
	else {
		var geometry = new THREE.Geometry();
		var scale = this.scale != null ? this.scale : 50;
		var params = lines[1].split(" ");
		// params[0] : number of vertices
		// params[1] : number of triangles
		// params[2] : number of what
		for (var i = 0 ; i < params[0] ; i++) {
			var coords = lines[2 + i].split(" ");
			geometry.vertices.push(new THREE.Vector3(scale * coords[0], scale * coords[1], scale * coords[2]));
		}
		for (var i = 0 ; i < params[1] ; i++) {
			var indexes = lines[2 + parseInt(params[0]) + i].split(" ");
			// [0] : polygon size
			geometry.faces.push(new THREE.Face3(indexes[1], indexes[2], indexes[3]));
		}
		geometry.faceVertexUvs[0].push([
		  new THREE.Vector2(0, 0),
		  new THREE.Vector2(0, 0),
		  new THREE.Vector2(0, 0),
		  new THREE.Vector2(0, 0)
		]);
		geometry.computeFaceNormals();
		
		var objectID = objects.length;
		objects[objectID] = new THREE.Mesh(geometry);
		scene.add(objects[objectID]);
	}
}