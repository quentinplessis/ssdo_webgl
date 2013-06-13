#ifdef GL_ES
precision highp float;
#endif

// input buffers
uniform sampler2D directLightBuffer;
uniform sampler2D indirectBounceBuffer;

// screen properties
uniform vec2 texelSize;

varying vec2 vUv;

vec4 ssdoBufferValue(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x *texelSize.x, screenPos.y * texelSize.y);
	return texture2D(directLightBuffer, uv);
}

vec4 ssdoIndirectBounceValue(vec2 screenPos) {
	vec2 uv = vec2(screenPos.x *texelSize.x, screenPos.y * texelSize.y);
	return texture2D(indirectBounceBuffer, uv);
}


void main()
{
//	vec4 color = ssdoBufferValue(vUv);
	vec4 color = ssdoBufferValue(gl_FragCoord.xy);
	
	color += ssdoIndirectBounceValue(gl_FragCoord.xy);

	gl_FragColor = color;
}

