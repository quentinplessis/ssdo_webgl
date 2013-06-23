/**
 * Shader.js
 * This class defines a complete shader with uniforms and attributes.
 * An instance of this class will contain a vertex shader, a fragment shader,
 * a list a uniforms and a list of attributes.
 * The createMaterial() method creates the THREE JS material associated to this shader.
 * Author : Quentin Plessis
 */
 
var Shader = Class.create({
    // Constructor
    initialize: function() {  
        this.uniforms = {};
        this.attributes = {};
		this.shadersHolder = {};
		this.material = null;
    },  
	setUniform: function(_name, _type, _value) {
		this.uniforms[_name] = {type: _type, value: _value};
	},
	getUniforms: function() {
		return this.uniforms;
	},
	setAttribute: function(_name, _type, _value) {
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
		return this.material = new THREE.ShaderMaterial({
			uniforms: jQuery.extend(true, {}, this.uniforms),
			attributes: this.attributes,
			vertexShader: this.shadersHolder['vertex'],
			fragmentShader: this.shadersHolder['fragment']
		});
	},
	getMaterial: function() {
		if (this.material == null)
			return this.createMaterial();
		return this.material;
	}
}); 

