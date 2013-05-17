<script type="x-shader/x-vertex" id="vertexshader" src="cshader.vert"></script>
	<script type="x-shader/x-fragment" id="fragmentshader" src="cshader.frag"></script>
	<script>
		var vertexShaders       = $('script[type="x-shader/x-vertex"]');
		var fragmentShaders     = $('script[type="x-shader/x-fragment"]');
		var shadersLoaderCount  = vertexShaders.length + fragmentShaders.length;

		var shadersHolder = {vertex: '', fragment: ''};

		function loadShader(shader, type) {
			$.ajax({
				url: shader.src,
				dataType: 'text',
				context: {
					name: shader.name,
					type: type
				},
				complete: processShader
			});
		}

		function processShader(jqXHR, textStatus) {
			shadersLoaderCount--;
			shadersHolder[this.type] = jqXHR.responseText;

			if (!shadersLoaderCount) {
				shadersLoadComplete();
			}
		}

		function shadersLoadComplete() {
			init();
		}
	</script>
	
	
	
	
	// Use a for loop if there is more than one
		/*loadShader(vertexShaders[0], 'vertex');
		loadShader(fragmentShaders[0], 'fragment');*/
		
		
		/*var shaderMaterial = new THREE.MeshShaderMaterial({
				uniforms:	{
					matDiffuse: {
						type: 'f',
						value: 0.8
					},
					matSpec: {
						type: 'f',
						value: 0.5
					},
					shininess: {
						type: 'f',
						value: 5.0
					},
					matDiffuseColor: {
						type: 'v4',
						value: new THREE.Vector4(1.0, 0.0, 0.0, 1.0)
					},
					matSpecColor: {
						type: 'v4',
						value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0)
					}
				},
				attributes:	{
					displacement: {
						type: 'f', // a float
						value: [] // an empty array
					}
				},
				vertexShader: 	shadersHolder.vertex,
				fragmentShader:	shadersHolder.fragment
				//vertexShader:   $('#vertexshader').text(),
				//fragmentShader: $('#fragmentshader').text()
			});*/