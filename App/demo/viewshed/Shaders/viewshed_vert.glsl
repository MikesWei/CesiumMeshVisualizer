varying vec3 v_position;
varying vec2 v_st;
varying vec4 projectedCoords;

void main(void) 
{
	vec4 pos = u_modelViewMatrix * vec4(position,1.0);
	v_position = pos.xyz;
	v_st=st;
	gl_Position = u_projectionMatrix * pos;
	projectedCoords=gl_Position;
}