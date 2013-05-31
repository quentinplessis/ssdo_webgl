
var PhongShader = Class.create(Shader, {
    // Constructor
    initialize: function($super, lightsPos, lightsColor, lightsIntensity) {
		$super();
        this.setUniform('lightsPos', 'v3v', lightsPos);
		this.setUniform('lightsColor', 'v4v', lightsColor);
		this.setUniform('lightsIntensity', 'fv1', lightsIntensity);
		this.loadShader('shaders/texturedWorldCoords.vert', 'vertex');
		this.loadShader('shaders/phong.frag', 'fragment');
    },
	use: function(matDiffuse, matSpecular, shininess, matDiffuseColor, matSpecularColor, matEmissive, matEmissiveColor, diffMap) {
		this.setUniform('matDiffuse', 'f', matDiffuse);
		this.setUniform('matSpecular', 'f', matSpecular);
		this.setUniform('shininess', 'f', shininess);
		this.setUniform('matDiffuseColor', 'v4', matDiffuseColor);
		this.setUniform('matSpecularColor', 'v4', matSpecularColor);
		this.setUniform('matEmissive', 'f', matEmissive);
		this.setUniform('matEmissiveColor', 'v4', matEmissiveColor);
		this.setUniform('isTextured', 'i', diffMap == null ? 0 : 1);
		this.setUniform('diffMap', 't', diffMap);
	}
});
