define(function () {
    var phong_frag = '\n\
varying vec3 v_position;\n\
varying vec3 v_normal;\n\
uniform float picked;\n\
uniform vec4  pickedColor;\n\
uniform vec4  defaultColor;\n\
uniform float specular;\n\
uniform float shininess;\n\
uniform vec3  emission;\n\
void main() {\n\
    vec3 positionToEyeEC = -v_position; \n\
    vec3 normalEC =normalize(v_normal);\n\
    vec4 color=defaultColor;\n\
    if(picked!=0.0){\n\
        gl_FragColor = pickedColor;\n\
    }\n\
    czm_material material;\n\
    material.specular = specular;\n\
    material.shininess = shininess;\n\
    material.normal =  normalEC;\n\
    material.emission =emission;//vec3(0.2,0.2,0.2);\n\
    material.diffuse = color.rgb ;\n\
    material.alpha =  color.a;\n\
    gl_FragColor =  czm_phong(normalize(positionToEyeEC), material);\n\
}';

    return phong_frag;
})
