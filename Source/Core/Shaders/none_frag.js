define(function () {

    var none_frag = "\n\
#ifdef GL_ES\n\
    precision highp float;\n\
#endif\n\
\n\
varying vec3 v_position;\n\
\n\
uniform vec4 ambientColor;\n\
uniform vec4 diffuseColor;\n\
uniform vec4 specularColor;\n\
uniform float specularShininess;\n\
uniform float picked;\n\
uniform vec4  pickedColor;\n\
\n\
void main(void) \n\
{\n\
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);\n\
    vec4 ambient = ambientColor;\n\
    vec4 diffuse = diffuseColor;\n\
    vec4 specular = specularColor;\n\
    color.xyz += ambient.xyz;\n\
    color.xyz += diffuse.xyz;\n\
    color.xyz += specular.xyz;\n\
    color = vec4(color.rgb * diffuse.a, diffuse.a);\n\
    gl_FragColor = color;\n\
    if(picked!=0.0){\n\
        gl_FragColor =mix(color, pickedColor*0.5,1.0);\n\
    }\n\
}";
    return none_frag;

})
