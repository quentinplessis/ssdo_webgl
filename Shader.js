
var Shader = Class.create({
    // Constructor
    initialize: function() {  
        this.uniforms = {};
        this.attributes = {};
		this.shadersHolder = {};
		this.material = null;
    },  
	addUniform: function(_name, _type, _value) {
		this.uniforms[_name] = {type: _type, value: _value};
	},
	addAttribute: function(_name, _type, _value) {
		this.attributes[_name] = {type: _type, value: _value};
	},
	setShader: function(shader, shaderType) {
		this.shadersHolder[shaderType] = shader;
	},
	loadShader: function(shaderFile, shaderType) {
		$.ajax({
			url: shaderFile,
			async: false,
			dataType: 'text',
			context: {
				type: shaderType,
				shader: this
			},
			complete: this.processShader
		});
	},
	processShader: function(jqXHR, textStatus) {
		this.shader.shadersHolder[this.type] = jqXHR.responseText;
	},
	
	getShadersHolder: function() {
		return this.shadersHolder();
	},
	getShader: function(shaderType) {
		return this.shadersHolder[shaderType];
	},
	createMaterial: function() {
		this.material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			attributes: this.attributes,
			vertexShader: this.shadersHolder['vertex'],
			fragmentShader: this.shadersHolder['fragment']
		});
	},
	getMaterial: function() {
		if (this.material == null)
			this.createMaterial();
		return this.material;
	}
}); 

