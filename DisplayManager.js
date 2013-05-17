
var DisplayManager = Class.create({
    // Constructor
    initialize: function(scene, mode) { 
        this.scene = scene;
		this.mode = mode;
		this.displays = [];
		this.quads = [];
    },
	addDisplay: function(display) {
		this.displays.add(display);
	},
	addSimpleTexture: function(texture) {
		var shader = new Shader();
		shader.setUniform('texture', 't', texture);
		shader.loadShader('shaders/texture.vert', 'vertex');
		shader.loadShader('shaders/texture.frag', 'fragment');
		this.displays.push(shader);
	},
	addCustomTexture: function(texture, fragmentShader) {
		var shader = new Shader();
		shader.setUniform('texture', 't', texture);
		shader.loadShader('shaders/texture.vert', 'vertex');
		shader.loadShader(fragmentShader, 'fragment');
		this.displays.push(shader);
	},
	changeMode: function(mode) {
		this.mode = mode;
		this.organize();
	},
	organize: function() {
		//this.scene = new THREE.Scene();
		for (var i = 0 ; i < this.quads.length ; i++)
			this.scene.remove(this.quads[i]);

		var width = window.innerWidth;
		var height = window.innerHeight;
		if (this.mode.type == 'GRID') {
			var cols = this.mode.cols;
			var rows = this.mode.rows;
			var plane = new THREE.PlaneGeometry(width / cols, height / rows);
			for (var i = 0 ; i < this.displays.length && i < cols*rows ; i++) {
				var x = i % cols;
				var y = (i - x) / cols;
				var id = this.quads.length;
				this.quads[id] = new THREE.Mesh(plane, this.displays[i].getMaterial());
				this.quads[id].position.y = height / 2 - height / (2 * rows) - y * height / rows;
				this.quads[id].position.x = - width / 2 + width / (2 * cols) + x * width / cols;
				this.quads[id].position.z = 0;
				this.scene.add(this.quads[id]);
			}
		}
		else if (this.mode.type == 'SINGLE') {
			if (this.mode.id < this.displays.length) {
				var plane = new THREE.PlaneGeometry(width, height);
				this.quads[this.mode.id] = new THREE.Mesh(plane, this.displays[this.mode.id].getMaterial());
				this.quads[this.mode.id].position.y = 0;
				this.quads[this.mode.id].position.x = 0;
				this.quads[this.mode.id].position.z = 0;
				this.scene.add(this.quads[this.mode.id]);
			}
		}
	}
});