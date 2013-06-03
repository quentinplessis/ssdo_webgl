
function createRandomValues(numVals, depth) {
	// For now, keep to 4-byte values to match RGBA values in textures
	// 4 bytes (=32bits) per random value wanted
	var buf = new ArrayBuffer(numVals * depth); 
	for (var i = 0 ; i < numVals ; i++) {
		for (var j = 0 ; j < depth ; j++) {
			buf[depth*i+j] = Math.random(0.0, 1.0) * 255;
		}
	}
	//var buf32 = new Uint32Array(buf);
	
	return buf;
}
	
function calculatePow2Needed(numBytes) {
	/** Return the length of a n*1 RGBA canvas needed to
	* store numBytes.  Returned value is a power of two
	*/
	var numPixels = numBytes / 4;
	// Suspect this next check is superfluous as affected values
	// won't be powers of two.
	if (numPixels != Math.floor(numPixels))
		numPixels = Math.floor(numPixels+1);
	
	var powerOfTwo = Math.log(numPixels) * Math.LOG2E;
	if (powerOfTwo != Math.floor(powerOfTwo))
		powerOfTwo = Math.floor(powerOfTwo + 1);
	return Math.pow(2, powerOfTwo);
}

function createTexture(typedData, cols, rows, depth) {
	/** Create a canvas/context containing a representation of the
	* data in the supplied TypedArray.  The canvas will be 1 pixel
	* deep; it will be a sufficiently large power-of-two wide (although
	* I think this isn't actually needed).
	*/
	//var numBytes = typedData.length * typedData.BYTES_PER_ELEMENT;
	//alert(typedData.length + " " + typedData.BYTES_PER_ELEMENT);
	//var canvasWidth = calculatePow2Needed(numBytes);
	//canvasWidth = cols;
	//alert(numBytes);
	//var depth = typedData.BYTES_PER_ELEMENT;
	var cv = document.createElement("canvas");
	cv.width = cols;
	cv.height = rows;
	//alert(rows);
	var c = cv.getContext("2d");
	var img = c.createImageData(cv.width, cv.height);
	var imgd = img.data;

	for (var i = 0 ; i < rows ; i++) {
		for (var j = 0 ; j < cols ; j++) {
			for (var k = 0 ; k < depth ; k++) {
				imgd[(i*cols+j)*depth+k] = typedData[(i*cols+j)*depth+k];
			}
		}
	}
	var offset = 0;
	// Nasty hack - this currently only supports uint8 values
	// in a Uint32Array.  Should be easy to extend to larger unsigned
	// ints, floats a bit more painful.  (Bear in mind that you'll
	// need to write a decoder in your shader).
	/*for (offset=0; offset<typedData.length * cv.height; offset++) {
		imgd[offset*4] = typedData[offset];
		imgd[(offset*4)+1] = 0;
		imgd[(offset*4)+2] = 0;
		imgd[(offset*4)+3] = 0;
	}*/
	// Fill the rest with zeroes (not strictly necessary, especially
	// as we could probably get away with a non-power-of-two width for
	// this type of shader use
	/*for (offset=typedData.length*4; offset < canvasWidth; offset++) {
		imgd[offset] = 0;
	}*/
	// Convert to WebGL texture
	var gl = renderer.getContext();
	var texture = new THREE.Texture();
	//texture.needsUpdate = false; //?
	texture.__webglTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture.__webglTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	/* These params let the data through (seemingly) unmolested - via
	* http://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
	*/
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);	
	gl.bindTexture(gl.TEXTURE_2D, null);

	return texture;
}


function createRandTexture(cols, rows, depth) {
	var cv = document.createElement("canvas");
	cv.width = cols;
	cv.height = rows;
	var c = cv.getContext("2d");
	var img = c.createImageData(cv.width, cv.height);
	var imgd = img.data;

	for (var i = 0 ; i < rows ; i++) {
		for (var j = 0 ; j < cols ; j++) {
			for (var k = 0 ; k < depth ; k++) {
				imgd[(i*cols+j)*depth+k] = Math.random(0.0, 1.0) * 255; //Math.random(0.0, 1.0) * 255;
			}
		}
	}
	// Convert to WebGL texture
	var gl = renderer.getContext();
	var texture = new THREE.Texture();
	texture.__webglTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture.__webglTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.FLOAT, img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);	
	gl.bindTexture(gl.TEXTURE_2D, null);

	return texture;
	//return createTexture(createRandomValues(width * height, depth), width, height, depth);
}
	

	 function solidTexture( color ){
        var texture = new THREE.Texture( new Image() ); // not sure about "new Image()"
        texture.needsUpdate = false; //?
        texture.__webglTexture = gl.createTexture();
        gl.bindTexture( gl.TEXTURE_2D, texture.__webglTexture );

        var pixels = [];
		for (var i = 0; i < window.innerHeight ; i++) {
			for (var j = 0 ; j < window.innerWidth ; j++) {
				for (var k = 0 ; k < 4 ; k++) {
					if (j % 2 == 0)
						pixels[(j + window.innerWidth * i) * 4 + k] = (k % 4 == 2 || k == 3) ? 255 : 0;
					else
						pixels[(j + window.innerWidth * i) * 4 + k] = (k % 4 == 1 || k == 3) ? 255 : 0;
				}
			}
		}
		pixels = [255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255];
		var dataTypedArray = new Uint8Array(pixels);
		//alert(JSON.stringify(dataTypedArray, null, 4));
		//alert(dataTypedArray.length);
		//var texture = gl.createTexture();
		// gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, dataTypedArray);

       // gl.bindTexture( gl.TEXTURE_2D, null );
        return texture;
    }  
	