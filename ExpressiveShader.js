
var ExpressiveShader = Class.create(Shader, {
    // Constructor
    initialize: function($super, lightsPos, lightsColor, lightsIntensity) {
		$super();
        this.setUniform('lightsPos', 'v3v', lightsPos);
		this.setUniform('lightsColor', 'v4v', lightsColor);
		this.setUniform('lightsIntensity', 'fv1', lightsIntensity);
		this.loadShader('shaders/worldCoords.vert', 'vertex');
		this.loadShader('shaders/expressive.frag', 'fragment');
    },
	use: function(matDiffuse, shininess, matDiffuseColor) {
		this.setUniform('matDiffuse', 'f', matDiffuse);
		this.setUniform('shininess', 'f', shininess);
		this.setUniform('matDiffuseColor', 'v4', matDiffuseColor);
	}
});
