
var DisplayManager = Class.create({
    // Constructor
    initialize: function(scene) { 
        this.scene = scene;
		this.mode;
		this.views = [];
		this.ids = []; // from name to id
		this.quads = [];
		this.currentIds = [];
		this.grids = [];
		this.currentGrid;
		this.currentIdInGrid;
		this.currentId = -1;
    },
	addView: function(view) {
		this.views.push(view);
		var plane = new THREE.PlaneGeometry(1.0, 1.0);
		this.quads.push(new THREE.Mesh(plane, view.getMaterial()));
	},
	addDisplay: function(view, name) {
		if (name != null)
			this.ids[name] = this.views.length;
		this.addView(view);
	},
	addSimpleTexture: function(texture, name) {
		var shader = new Shader();
		shader.setUniform('texture', 't', texture);
		shader.loadShader('shaders/texture.vert', 'vertex');
		shader.loadShader('shaders/texture.frag', 'fragment');
		if (name != null)
			this.ids[name] = this.views.length;
		this.addView(shader);
	},
	addCustomTexture: function(texture, fragmentShader, name) {
		var shader = new Shader();
		shader.setUniform('texture', 't', texture);
		shader.loadShader('shaders/texture.vert', 'vertex');
		shader.loadShader(fragmentShader, 'fragment');
		if (name != null)
			this.ids[name] = this.views.length;
		this.addView(shader);
	},
	addCustomTextureShader: function(fromShader, texture, name) {
		var shader = jQuery.extend(true, {}, fromShader);
		shader.setUniform('texture', 't', texture);
		if (name != null)
			this.ids[name] = this.views.length;
		this.addView(shader);
	},
	addGrid: function(name, viewsNames) {
		this.grids[name] = viewsNames;
	},
	display: function(mode) {
		this.mode = mode;
		this.organize();
	},
	// returns true if the next view is in the same grid as the current one
	nextView: function() {
		var _id = this.currentIdInGrid + 1;
		var stillGrid = true;
		if (_id < this.currentIds.length) {
			this.currentIdInGrid = _id;
			_id = this.currentIds[_id];
		}
		else {
			_id = this.currentId + 1;
			if (_id >= this.views.length)
				_id = 0;
			stillGrid = false;
			this.currentIds = [];
			this.currentIdInGrid = -1;
		}
		this.display({id: _id});
		return stillGrid;
	},
	previousView: function() {
		var _id = this.currentIdInGrid - 1;
		var stillGrid = true;
		if (_id >= 0) {
			this.currentIdInGrid = _id;
			_id = this.currentIds[_id];
		}
		else {
			_id = this.currentId - 1;
			if (_id < 0)
				_id = this.views.length - 1;
			stillGrid = false;
			this.currentIds = [];
			this.currentIdInGrid = -1;
		}
		this.display({id: _id});
		return stillGrid;
	},
	showViewInGrid: function(idInGrid) {
		if (this.currentIds.length > 0) {
			if (idInGrid < 0) idInGrid = 0;
			if (idInGrid >= this.currentIds.length) idInGrid = this.currentIds.length - 1;
			this.currentIdInGrid = idInGrid;
			this.display({id: this.currentIds[idInGrid]});
		}
	},
	cleanScene: function() {
		for (var i = 0 ; i < this.currentIds.length ; i++)
			this.scene.remove(this.quads[this.currentIds[i]]);
		if (this.currentId != -1)
			this.scene.remove(this.quads[this.currentId]);
	},
	organize: function() {
		this.cleanScene();
		var width = window.innerWidth;
		var height = window.innerHeight;
		if (this.mode.id != null) {
			//alert(this.mode.id);
			var id = this.mode.id;
			var plane = new THREE.PlaneGeometry(width, height);
			//this.quads[id].geometry = plane;
			this.quads[id] = new THREE.Mesh(plane, this.views[id].getMaterial());
			this.quads[id].position.y = height / 2 - height / 2;
			this.quads[id].position.x = - width / 2 + width / 2;
			this.quads[id].position.z = 0;
			this.scene.add(this.quads[id]);
			this.currentId = id;
		}
		else if (this.mode.all == true) {
			this.currentIds = [];
			var cols = this.mode.cols != null ? this.mode.cols : 1,
				rows = this.mode.rows != null ? this.mode.rows : 1;
			var plane = new THREE.PlaneGeometry(width / cols, height / rows);
			for (var i = 0 ; i < this.views.length && i < cols*rows ; i++) {
				var x = i % cols,
					y = (i - x) / cols,
					id = i;
				//this.quads[id].geometry = plane;
				this.quads[id] = new THREE.Mesh(plane, this.views[id].getMaterial());
				this.quads[id].position.y = height / 2 - height / (2 * rows) - y * height / rows;
				this.quads[id].position.x = - width / 2 + width / (2 * cols) + x * width / cols;
				this.quads[id].position.z = 0;
				this.scene.add(this.quads[id]);
				this.currentIds.push(id);
			}
			this.currentIdInGrid = -1;
			this.currentId = -1;
		}
		else {
			this.currentIds = [];
			var viewsNames,
				cols = this.mode.cols != null ? this.mode.cols : 1,
				rows = this.mode.rows != null ? this.mode.rows : 1;
			if (this.mode.grid == null && this.mode.names != null)
				viewsNames = this.mode.names;
			else if (this.mode.grid != null)
				viewsNames = this.grids[this.mode.grid];
			else
				console.error("Display manager : the name of the grid to be displayed or the views to be displayed must be given.");
			var plane = new THREE.PlaneGeometry(width / cols, height / rows);
			for (var i = 0 ; i < viewsNames.length && i < cols*rows ; i++) {
				var x = i % cols,
					y = (i - x) / cols,
					id = this.ids[viewsNames[i]];
				this.quads[id] = new THREE.Mesh(plane, this.views[id].getMaterial());
				/*this.quads[id].geometry.vertices[0].x = 500;
				this.quads[id].geometry.vertices[0].y = 500;
				this.quads[id].geometry.vertices[2].x = -100;
				this.quads[id].geometry.vertices[2].y = -100;*/
				this.quads[id].position.y = height / 2 - height / (2 * rows) - y * height / rows;
				this.quads[id].position.x = - width / 2 + width / (2 * cols) + x * width / cols;
				this.quads[id].position.z = 0;
				
				this.scene.add(this.quads[id]);
				this.currentIds.push(id);
			}
			this.currentIdInGrid = -1;
			this.currentId = -1;
		}
	}
});