define(function () {
    var texture_normals_frag = "\n\
#ifdef GL_ES\n\
    precision highp float;\n\
#endif\n\
\n\
varying vec3 v_position;\n\
varying vec2 v_texcoord0;\n\
varying vec3 v_normal;\n\
\n\
uniform vec4 ambientColor;\n\
uniform sampler2D diffuseColorMap;\n\
uniform vec4 specularColor;\n\
uniform float specularShininess;\n\
uniform float picked;\n\
uniform vec4  pickedColor;\n\
\n\
varying vec3 v_light0Direction;\n\
\n\
void main(void) \n\
{\n\
    vec3 normal = normalize(v_normal);\n\
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);\n\
    vec3 diffuseLight = vec3(0.0, 0.0, 0.0);\n\
    vec3 lightColor = vec3(1.0,1.0,1.0);\n\
    vec4 ambient = ambientColor;\n\
    vec4 diffuse = texture2D(diffuseColorMap, v_texcoord0);\n\
    vec4 specular = specularColor;\n\
\n\
    vec3 specularLight = vec3(0.0, 0.0, 0.0);\n\
    {\n\
        float specularIntensity = 0.0;\n\
        float attenuation = 1.0;\n\
        vec3 l = normalize(v_light0Direction);\n\
        vec3 viewDir = -normalize(v_position);\n\
        vec3 h = normalize(l+viewDir);\n\
        specularIntensity = max(0.0, pow(max(dot(normal,h), 0.0) , specularShininess)) * attenuation;\n\
        specularLight += lightColor * specularIntensity;\n\
        diffuseLight += lightColor * max(dot(normal,l), 0.0) * attenuation;\n\
    }\n\
    //specular.xyz *= specularLight;\n\
    //diffuse.xyz *= diffuseLight;\n\
    color.xyz += ambient.xyz;\n\
    color.xyz += diffuse.xyz;\n\
    color.xyz += specular.xyz;\n\
    color = vec4(diffuse.rgb * diffuse.a, diffuse.a);\n\
    gl_FragColor = color;\n\
    if(picked!=0.0){\n\
        gl_FragColor = pickedColor*color;\n\
    }\n\
}";

    return texture_normals_frag;
})