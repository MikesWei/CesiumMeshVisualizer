define(function () {
    var phong_vert = "\n\
#ifdef GL_ES\n\
    precision highp float;\n\
#endif\n\
\n\
\n\
\n\
varying vec3 v_position;\n\
varying vec3 v_normal;\n\
\n\
varying vec3 v_light0Direction;\n\
\n\
void main(void) \n\
{\n\
    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n\
    v_normal =  normalMatrix *  normal;\n\
    v_position = pos.xyz;\n\
    v_light0Direction = mat3( modelViewMatrix) * vec3(1.0,1.0,1.0);\n\
    gl_Position =  projectionMatrix * pos;\n\
}";

    return phong_vert;
})