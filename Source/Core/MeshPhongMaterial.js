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
        MeshMaterial.apply(this, arguments);
        this.vertexShader = phong_vert;
        this.fragmentShader = phong_frag;
    }
    MeshPhongMaterial.prototype = new MeshMaterial();
    return MeshPhongMaterial;
})