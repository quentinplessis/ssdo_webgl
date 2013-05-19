
var DisplayManager = Class.create({
    // Constructor
    initialize: function(scene, mode) { 
        this.scene = scene;
		this.mode = mode;
		this.displays = [];
		this.names = [];
		this.quads = [];
    },
	addDisplay: function(display, name) {
		if (name != null)
			this.names[name] = this.displays.length;
		this.displays.push(display);
	},
	addSimpleTexture: function(texture, name) {
		var shader = new Shader();
		shader.setUniform('texture', 't', texture);
		shader.loadShader('shaders/texture.vert', 'vertex');
		shader.loadShader('shaders/texture.frag', 'fragment');
		if (name != null)
			this.names[name] = this.displays.length;
		this.displays.push(shader);
	},
	addCustomTexture: function(texture, fragmentShader, name) {
		var shader = new Shader();
		shader.setUniform('texture', 't', texture);
		shader.loadShader('shaders/texture.vert', 'vertex');
		shader.loadShader(fragmentShader, 'fragment');
		if (name != null)
			this.names[name] = this.displays.length;
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
		this.quads = [];

		var width = window.innerWidth;
		var height = window.innerHeight;
		if (this.mode.type == 'GRID') {
			if (this.mode.names == null) {
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
			else {
				var cols = this.mode.cols;
				var rows = this.mode.rows;
				var plane = new THREE.PlaneGeometry(width / cols, height / rows);
				for (var i = 0 ; i < this.mode.names.length && i < cols*rows ; i++) {
					var x = i % cols;
					var y = (i - x) / cols;
					var id = this.quads.length;
					this.quads[id] = new THREE.Mesh(plane, this.displays[this.names[this.mode.names[i]]].getMaterial());
					this.quads[id].position.y = height / 2 - height / (2 * rows) - y * height / rows;
					this.quads[id].position.x = - width / 2 + width / (2 * cols) + x * width / cols;
					this.quads[id].position.z = 0;
					this.scene.add(this.quads[id]);
				}
			}
		}
		else if (this.mode.type == 'SINGLE') {
			var id = this.mode.id != null ? this.mode.id : this.names[this.mode.name];
			if (id < this.displays.length) {
				var plane = new THREE.PlaneGeometry(width, height);
				this.quads[id] = new THREE.Mesh(plane, this.displays[id].getMaterial());
				this.quads[id].position.y = 0;
				this.quads[id].position.x = 0;
				this.quads[id].position.z = 0;
				this.scene.add(this.quads[id]);
			}
		}
	}
});