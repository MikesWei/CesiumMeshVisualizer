define([
    'Core/MeshMaterial',
    'Core/Shaders/phong_frag',
    'Core/Shaders/phong_vert'
], function (
    MeshMaterial,
    phong_frag,
    phong_vert
    ) {
    /**
    * 
    *@constructor
    *@memberof Cesium
    *@extends Cesium.MeshMaterial
    */
    function MeshPhongMaterial(options) {
        options = options ? options : {};

        options.uniforms = options.uniforms ? options.uniforms : {
            shininess: -1,
            emission: [0, 0, 0],
            specular: 0
        };
        options.uniforms.shininess = Cesium.defaultValue(options.uniforms.shininess, 0);
        options.uniforms.emission = Cesium.defaultValue(options.uniforms.emission, [0.2, 0.2, 0.2]);
        options.uniforms.specular = Cesium.defaultValue(options.uniforms.specular, 0);

        MeshMaterial.apply(this, arguments);
        this.vertexShader = phong_vert;
        this.fragmentShader = phong_frag;
    }
    MeshPhongMaterial.prototype = new MeshMaterial();
    return MeshPhongMaterial;
})
