define([
    'Core/MeshMaterial',
    'Core/Shaders/ShaderChunk',
    'Core/Shaders/ShaderLib',
    'Util/Path'
], function (
    MeshMaterial,
    ShaderChunk,
    ShaderLib,
    Path
    ) {
    var WebGLConstants = Cesium.WebGLConstants;
    function BasicMeshMaterial(options) {
        options = options ? options : {};

        options.uniforms = options.uniforms ? options.uniforms : {
            ambientColor: [0, 0, 0, 1.0],               // Ka
            emissionColor: [0, 0, 0, 1.0],              // Ke
            diffuseColor: [0, 0, 0, 1.0],               // Kd
            specularColor: [0, 0, 0, 1.0],              // Ks
            specularShininess: 0,          // Ns
            alpha: undefined,                      // d / Tr
            ambientColorMap: undefined,            // map_Ka
            emissionColorMap: undefined,           // map_Ke
            diffuseColorMap: undefined,            // map_Kd
            specularColorMap: undefined,           // map_Ks
            specularShininessMap: undefined,       // map_Ns
            normalMap: undefined,                  // map_Bump
            alphaMap: undefined                    // map_d
        };
        options.uniforms.ambientColor = Cesium.defaultValue(options.uniforms.ambientColor, [0, 0, 0, 1.0]);
        options.uniforms.emissionColor = Cesium.defaultValue(options.uniforms.emissionColor, [0, 0, 0, 1.0]);
        options.uniforms.diffuseColor = Cesium.defaultValue(options.uniforms.diffuseColor, [0, 0, 0, 1.0]);
        options.uniforms.specularColor = Cesium.defaultValue(options.uniforms.specularColor, [0, 0, 0, 1.0]);
        options.uniforms.alpha = Cesium.defaultValue(options.uniforms.alpha, 1);
        options.uniforms.specularShininess = Cesium.defaultValue(options.uniforms.specularShininess, 0);
        options.side = Cesium.defaultValue(options.side, MeshMaterial.Sides.FRONT)

        MeshMaterial.apply(this, [options]);
        this.blendEnable = false;
        var withTexture = options.withTexture;
        var withNormals = options.withNormals;
        this.depthTest = true;
        this.depthMask = true;
        this.blending = true;
        if (options.uniforms.diffuseColorMap) {//&& options.uniforms.diffuseColorMap.toLowerCase().indexOf(".png")) {

            if (typeof options.uniforms.diffuseColorMap === 'string') {
                var diffuseColorMap = options.uniforms.diffuseColorMap.toLowerCase();
                var extension = Path.GetExtension(diffuseColorMap);
                if (extension == ".tif" || extension == ".png") {
                    this.translucent = true;
                } else if (diffuseColorMap.slice(0, "data:image/png".length) === "data:image/png") {
                    this.translucent = true;
                } else if (diffuseColorMap.slice(0, "data:image/tif".length) === "data:image/tif") {
                    this.translucent = true;
                }
            } else if (diffuseColorMap instanceof HTMLCanvasElement
                       || diffuseColorMap instanceof HTMLVideoElement
                ) {
                this.translucent = true;
            }
            withTexture = true;
            if (!Cesium.defined(this.uniforms.diffuseColorMap.flipY)) { 
                this.uniforms.diffuseColorMap.flipY = false;
            }

            if (!this.uniforms.diffuseColorMap.sampler) {
                var sampler = {};

                sampler.magnificationFilter = WebGLConstants.LINEAR;
                sampler.minificationFilter = WebGLConstants.NEAREST_MIPMAP_LINEAR;
                sampler.wrapS = WebGLConstants.REPEAT;
                sampler.wrapT = WebGLConstants.REPEAT;
                this.uniforms.diffuseColorMap.sampler = sampler;
            }

        } else {
            withTexture = false;
        }

        var vertexShaderUri = null;// "texture_normals.vert"; 
        var fragmentShaderUri = null;  //"texture_normals.frag";
        if (withTexture && withNormals) {
            vertexShaderUri = ShaderChunk.texture_normals_vert;// "texture_normals.vert"; 
            fragmentShaderUri = ShaderChunk.texture_normals_frag;  //"texture_normals.frag";
        } else if (withTexture && !withNormals) {
            vertexShaderUri = ShaderChunk.texture_vert;//"texture.vert";
            fragmentShaderUri = ShaderChunk.texture_frag;// "texture.frag";
        } else if (!withTexture && withNormals) {
            vertexShaderUri = ShaderChunk.normals_vert;// "normals.vert";
            fragmentShaderUri = ShaderChunk.normals_frag;//"normals.frag";
        }
        else {
            vertexShaderUri = ShaderChunk.none_vert;// "none.vert";
            fragmentShaderUri = ShaderChunk.none_frag;// "none.frag";
        }
        this.vertexShader = vertexShaderUri;
        this.fragmentShader = fragmentShaderUri;


    }
    BasicMeshMaterial.prototype = new MeshMaterial();
    return BasicMeshMaterial;
})