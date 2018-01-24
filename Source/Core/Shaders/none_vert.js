define(function () {
    var none_vert = "\n\
#ifdef GL_ES\n\
    precision highp float;\n\
#endif\n\
\n\
\n\
\n\
varying vec3 v_position;\n\
\n\
void main(void) \n\
{\n\
    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n\
    v_position = pos.xyz;\n\
    gl_Position =  projectionMatrix * pos;\n\
}";
    return none_vert;
})