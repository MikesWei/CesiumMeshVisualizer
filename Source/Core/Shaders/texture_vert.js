define(function () {
    var texture_vert = "\n\
#ifdef GL_ES\n\
    precision highp float;\n\
#endif\n\
\n\
\n\
\n\
varying vec3 v_position;\n\
varying vec2 v_texcoord0;\n\
\n\
void main(void) \n\
{\n\
    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n\
    v_texcoord0 =  uv;\n\
    v_position = pos.xyz;\n\
    gl_Position =  projectionMatrix * pos;\n\
}";

    return texture_vert;
})