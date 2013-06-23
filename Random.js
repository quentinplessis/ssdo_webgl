/**
 * Random.js
 * Creates an OpenGL texture of random floats.
 * Authors : Quentin Plessis, Antoine Toisoul
 */
 
function createRandTexture(cols, rows, depth)
{
	var width = 3;
	var height = 3;
/*	var cv = document.createElement("canvas");
	cv.width = cols;
	cv.height = rows;
	var c = cv.getContext("2d");
	var img = c.createImageData(cv.width, cv.height);*/
//	var imgd = img.data;
	var imgd = new Float32Array(rows*cols*depth);
//	var imgd = new Uint8Array(((rows-1)*cols + cols-1)*(depth-1));
//	var imgd = new Uint8Array([255,0,0,255,255,0,0,255])
	for (var i = 0 ; i < rows ; i++) {
		for (var j = 0 ; j < cols ; j++) {
			for (var k = 0 ; k < depth ; k++) {
					imgd[(i*cols+j)*depth + k] = Math.random();// Math.floor(Math.random(0.0,255.0));
				//	imgd[(i*cols+j)*depth] = Math.random()/2 + Math.random()/4 + Math.random/8 + Math.random()/16 + Math.random()/32 + Math.random()/64 + Math.random()/128 + Math.random()/256;//Math.random(0.0, 1.0)*255; //Math.random(0.0, 1.0) * 255;
			}
		}
	}
	
	var debug = new Float32Array(36);
	for (var i = 0 ; i < depth*width*height  ; i++) {
		debug[i] = i%4 == 1 ? 500.0 : 0.0;
	}
	
	// Convert to WebGL texture
	var gl = renderer.getContext();
	var texture = new THREE.Texture();
	texture.__webglTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture.__webglTexture);
//	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, rows,0,gl.RGBA, gl.UNSIGNED_BYTE, imgd);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols,rows, 0, gl.RGBA, gl.FLOAT, imgd);
//	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width,height, 0, gl.RGBA, gl.FLOAT, debug);
//	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.FLOAT, imgd);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);	
//	gl.bindTexture(gl.TEXTURE_2D, texture.__webglTexture);
	gl.bindTexture(gl.TEXTURE_2D, null);

	return texture;
	//return createTexture(createRandomValues(width * height, depth), width, height, depth);
}