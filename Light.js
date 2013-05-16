
var Light = Class.create({
    // Constructor
    initialize: function(position, color) {  
        this.position = position;
		this.color = color;
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
	}
});
