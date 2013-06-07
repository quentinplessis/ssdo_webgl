#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D colorTexture;
uniform sampler2D normalsAndDepthBuffer;
varying vec2 vUv;

uniform vec2 texelSize;     // Size of one texel (1 / width, 1 / height)
uniform int orientation;    // 0 = horizontal, 1 = vertical
uniform float blurCoefficient;  // Calculated from the blur equation, b = ( f * ms / N )
uniform float focusDistance;    // The distance to the subject in perfect focus (= Ds)
uniform float near;     // Near clipping plane
uniform float far;      // Far clipping plane
uniform float PPM;      // Pixels per millimetre

/// <summary>
/// Calculate the blur diameter to apply on the image.
/// b = (f * ms / N) * (xd / (Ds +- xd))
/// Where:
/// (Ds + xd) for background objects
/// (Ds - xd) for foreground objects
/// </summary>
/// <param name="d">Depth of the fragment.</param>
float GetBlurDiameter (float d) {
	// Convert from linear depth to metres
	float Dd = d;// * (far - near);

	float xd = abs(Dd - focusDistance);
	float xdd = (Dd < focusDistance) ? (focusDistance - xd) : (focusDistance + xd);
	float b = 1.0 * (xd / xdd);

	return b * PPM;
}

void main() {
	// Maximum blur radius to limit hardware requirements.
	// Cannot #define this due to a driver issue with some setups
	const float MAX_BLUR_RADIUS = 10.0;

	// Pass the linear depth values recorded in the depth map to the blur
	// equation to find out how much each pixel should be blurred with the
	// given camera settings.
	float depth = texture2D(normalsAndDepthBuffer, vUv).a;
	float blurAmount = GetBlurDiameter(depth);
	blurAmount = min(floor(blurAmount), MAX_BLUR_RADIUS);

	// Apply the blur
	float count = 0.0;
	vec4 colour = vec4(0.0);
	vec2 texelOffset;
	if (orientation == 0)
		texelOffset = vec2(texelSize.x, 0.0);
	else
		texelOffset = vec2(0.0, texelSize.y);

	if (blurAmount >= 1.0) {
		float halfBlur = blurAmount * 0.5;
		for (float i = 0.0 ; i < MAX_BLUR_RADIUS ; i++) {
			if (i >= blurAmount)
				break;

			float offset = i - halfBlur;
			vec2 vOffset = vUv + (texelOffset * offset);

			colour += texture2D(colorTexture, vOffset);
			++count;
		}
	}

	// Apply colour
	if (count > 0.0)
		gl_FragColor = colour / count;
	else
		gl_FragColor = texture2D(colorTexture, vUv);
}
