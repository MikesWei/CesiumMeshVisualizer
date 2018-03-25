varying vec2 v_st;
uniform sampler2D frontPosTex;
uniform sampler2D backPosTex;
varying vec4 projectedCoords;

void main()
{        
	//Transform the coordinates it from [-1;1] to [0;1]
	vec2 texc = vec2(((projectedCoords.x / projectedCoords.w) + 1.0 ) / 2.0,
        ((projectedCoords.y / projectedCoords.w) + 1.0 ) / 2.0 );

    //The front position is the world space position stored in the texture.
    vec4 frontPos= texture2D(frontPosTex, texc);
	//The back position is the world space position stored in the texture.
	vec4 backPos= texture2D(backPosTex, texc);  
	gl_FragColor =  frontPos; 
}