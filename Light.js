
var Light = Class.create({
    // Constructor
    initialize: function(position, color, intensity) {  
        this.position = position;
		this.color = color;
		this.intensity = intensity;
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
	getColor: function() {
		return this.color;
	},
	setIntensity: function(intensity) {
		this.intensity = intensity;
	},
	getIntensity: function() {
		return this.intensity;
	}
});
