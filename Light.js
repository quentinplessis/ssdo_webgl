
// hexa to decimal
function h2d(hexa) {
	return parseInt(hexa, 16);
}

var Light = Class.create({
    // Constructor
    initialize: function(position, color, intensity) {  
        this.position = position;
		this.lookAt = new THREE.Vector3(0.0, 0.0, 0.0);
		this.color = color;
		this.intensity = intensity;
		this.projectionMatrix;
		this.viewMatrix;
		this.up = new THREE.Vector3(0.0, 1.0, 0.0);
    },
	setPosition: function(position) {
		this.position = position;
	},
	getPosition: function() {
		return this.position;
	},
	setColor: function(color) {
		this.color = color;
	},
	setHexaColor: function(color) {
		this.color = new THREE.Vector4(
			h2d(color.substring(1, 3)) / 255,
			h2d(color.substring(3, 5)) / 255,
			h2d(color.substring(5, 7)) / 255,
			1.0
		);
	},
	getColor: function() {
		return this.color;
	},
	setIntensity: function(intensity) {
		this.intensity = intensity;
	},
	getIntensity: function() {
		return this.intensity;
	},
	setLookAt: function(x, y, z) {
		this.lookAt = new THREE.Vector3(x, y, z);
	},
	setLookAtV: function(target) {
		this.lookAt = target;
	},
	getLookAt: function() {
		return this.lookAt;
	},
	generateViewMatrix: function() {
		this.viewMatrix = new THREE.Matrix4();
		this.viewMatrix.lookAt(this.position, this.lookAt, this.up);
		return this.viewMatrix;
	},
	getViewMatrix: function() {
		if (this.viewMatrix == null)
			return this.generateViewMatrix();
		return this.viewMatrix;
	},
	generateProjectionMatrix: function() {
		this.projectionMatrix = new THREE.Matrix4();
		this.projectionMatrix.makePerspective(45, 1.0, 0.1, 1000.0);
		return this.projectionMatrix;
	},
	getProjectionMatrix: function() {
		if (this.projectionMatrix == null)
			return this.generateProjectionMatrix();
		return this.projectionMatrix;
	}
});
