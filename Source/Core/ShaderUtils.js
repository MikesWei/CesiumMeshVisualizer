
/**
*
*@memberof Cesium
*@constructor
*/
function ShaderUtils() {

}

/**
*
*
*/
ShaderUtils.processShader3js = function (material3js, shader) {
    var program = new WebGLProgram(material3js, shader);
    return program;

}

if (typeof THREE != 'undefined') {
 
    var shaderIDs = {
        MeshDepthMaterial: 'depth',
        MeshNormalMaterial: 'normal',
        MeshBasicMaterial: 'basic',
        MeshLambertMaterial: 'lambert',
        MeshPhongMaterial: 'phong',
        MeshToonMaterial: 'phong',
        MeshStandardMaterial: 'physical',
        MeshPhysicalMaterial: 'physical',
        LineBasicMaterial: 'basic',
        LineDashedMaterial: 'dashed',
        PointsMaterial: 'points'
    };

    var parameterNames = [
        "precision", "supportsVertexTextures", "map", "mapEncoding", "envMap", "envMapMode", "envMapEncoding",
        "lightMap", "aoMap", "emissiveMap", "emissiveMapEncoding", "bumpMap", "normalMap", "displacementMap", "specularMap",
        "roughnessMap", "metalnessMap", "gradientMap",
        "alphaMap", "combine", "vertexColors", "fog", "useFog", "fogExp",
        "flatShading", "sizeAttenuation", "logarithmicDepthBuffer", "skinning",
        "maxBones", "useVertexTexture", "morphTargets", "morphNormals",
        "maxMorphTargets", "maxMorphNormals", "premultipliedAlpha",
        "numDirLights", "numPointLights", "numSpotLights", "numHemiLights", "numRectAreaLights",
        "shadowMapEnabled", "shadowMapType", "toneMapping", 'physicallyCorrectLights',
        "alphaTest", "doubleSided", "flipSided", "numClippingPlanes", "numClipIntersection", "depthPacking"
    ];
    var ShaderChunk = THREE.ShaderChunk;
    var ShaderLib = THREE.ShaderLib;
    var BackSide = THREE.BackSide,
        DoubleSide = THREE.DoubleSide,
        FlatShading = THREE.FlatShading,
        CubeUVRefractionMapping = THREE.CubeUVRefractionMapping,
        CubeUVReflectionMapping = THREE.CubeUVReflectionMapping,
        GammaEncoding = THREE.GammaEncoding,
        LinearEncoding = THREE.LinearEncoding,
        NoToneMapping = THREE.NoToneMapping,
        AddOperation = THREE.AddOperation,
        MixOperation = THREE.MixOperation,
        MultiplyOperation = THREE.MultiplyOperation,
        EquirectangularRefractionMapping = THREE.EquirectangularRefractionMapping,
        CubeRefractionMapping = THREE.CubeRefractionMapping,
        SphericalReflectionMapping = THREE.SphericalReflectionMapping,
        EquirectangularReflectionMapping = THREE.EquirectangularReflectionMapping,
        CubeReflectionMapping = THREE.CubeReflectionMapping,
        PCFSoftShadowMap = THREE.PCFSoftShadowMap,
        PCFShadowMap = THREE.PCFShadowMap,
        CineonToneMapping = THREE.CineonToneMapping,
        Uncharted2ToneMapping = THREE.Uncharted2ToneMapping,
        ReinhardToneMapping = THREE.ReinhardToneMapping,
        LinearToneMapping = THREE.LinearToneMapping,
        GammaEncoding = THREE.GammaEncoding,
        RGBDEncoding = THREE.RGBDEncoding,
        RGBM16Encoding = THREE.RGBM16Encoding,
        RGBM7Encoding = THREE.RGBM7Encoding,
        RGBEEncoding = THREE.RGBEEncoding,
        sRGBEncoding = THREE.sRGBEncoding;

    function getTextureEncodingFromMap(map, gammaOverrideLinear) {

        var encoding;

        if (!map) {

            encoding = LinearEncoding;

        } else if (map.isTexture) {

            encoding = map.encoding;

        } else if (map.isWebGLRenderTarget) {

            console.warn("THREE.WebGLPrograms.getTextureEncodingFromMap: don't use render targets as textures. Use their .texture property instead.");
            encoding = map.texture.encoding;

        }

        // add backwards compatibility for WebGLRenderer.gammaInput/gammaOutput parameter, should probably be removed at some point.
        if (encoding === LinearEncoding && gammaOverrideLinear) {

            encoding = GammaEncoding;

        }

        return encoding;

    }

    function getParameters(material) {//, lights, fog, nClipPlanes, nClipIntersection, object) {

        var shaderID = shaderIDs[material.type];

        // heuristics to create shader parameters according to lights in the scene
        // (not to blow over maxLights budget)

        //var maxBones = allocateBones(object);
        //var precision = renderer.getPrecision();

        //if (material.precision !== null) {

        //    precision = capabilities.getMaxPrecision(material.precision);

        //    if (precision !== material.precision) {

        //        console.warn('THREE.WebGLProgram.getParameters:', material.precision, 'not supported, using', precision, 'instead.');

        //    }

        //}

        var currentRenderTarget = null;// renderer.getCurrentRenderTarget();
        var renderer = {};
        var parameters = {

            shaderID: shaderID,

            precision: "high",//precision,
            supportsVertexTextures: true,// capabilities.vertexTextures,
            outputEncoding: getTextureEncodingFromMap((!currentRenderTarget) ? null : currentRenderTarget.texture, renderer.gammaOutput),
            map: !!material.map,
            mapEncoding: getTextureEncodingFromMap(material.map, renderer.gammaInput),
            envMap: !!material.envMap,
            envMapMode: material.envMap && material.envMap.mapping,
            envMapEncoding: getTextureEncodingFromMap(material.envMap, renderer.gammaInput),
            envMapCubeUV: (!!material.envMap) && ((material.envMap.mapping === CubeUVReflectionMapping) || (material.envMap.mapping === CubeUVRefractionMapping)),
            lightMap: !!material.lightMap,
            aoMap: !!material.aoMap,
            emissiveMap: !!material.emissiveMap,
            emissiveMapEncoding: getTextureEncodingFromMap(material.emissiveMap, renderer.gammaInput),
            bumpMap: !!material.bumpMap,
            normalMap: !!material.normalMap,
            displacementMap: !!material.displacementMap,
            roughnessMap: !!material.roughnessMap,
            metalnessMap: !!material.metalnessMap,
            specularMap: !!material.specularMap,
            alphaMap: !!material.alphaMap,

            gradientMap: !!material.gradientMap,

            combine: material.combine,

            vertexColors: material.vertexColors,

            fog: false,//!!fog,
            useFog: material.fog,
            fogExp: false,//(fog && fog.isFogExp2),

            flatShading: material.shading === FlatShading,

            sizeAttenuation: material.sizeAttenuation,
            logarithmicDepthBuffer: false,// capabilities.logarithmicDepthBuffer,

            skinning: material.skinning,
            //maxBones: maxBones,
            //useVertexTexture: capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture,

            morphTargets: material.morphTargets,
            morphNormals: material.morphNormals,
            //maxMorphTargets: renderer.maxMorphTargets,
            //maxMorphNormals: renderer.maxMorphNormals,

            numDirLights: 0,// lights.directional.length,
            numPointLights: 0,// lights.point.length,
            numSpotLights: 0,// lights.spot.length,
            numRectAreaLights: 0,// lights.rectArea.length,
            numHemiLights: 0,// lights.hemi.length,

            numClippingPlanes: 0,//nClipPlanes,
            numClipIntersection: 0,//nClipIntersection,

            //shadowMapEnabled:  renderer.shadowMap.enabled && object.receiveShadow && lights.shadows.length > 0,
            //shadowMapType: renderer.shadowMap.type,

            //toneMapping: renderer.toneMapping,
            //physicallyCorrectLights: renderer.physicallyCorrectLights,

            premultipliedAlpha: material.premultipliedAlpha,

            alphaTest: material.alphaTest,
            doubleSided: material.side === DoubleSide,
            flipSided: material.side === BackSide,

            depthPacking: (material.depthPacking !== undefined) ? material.depthPacking : false

        };

        return parameters;

    };

    /**
     * @author mrdoob / http://mrdoob.com/
     */

    var programIdCount = 0;

    function getEncodingComponents(encoding) {

        switch (encoding) {

            case LinearEncoding:
                return ['Linear', '( value )'];
            case sRGBEncoding:
                return ['sRGB', '( value )'];
            case RGBEEncoding:
                return ['RGBE', '( value )'];
            case RGBM7Encoding:
                return ['RGBM', '( value, 7.0 )'];
            case RGBM16Encoding:
                return ['RGBM', '( value, 16.0 )'];
            case RGBDEncoding:
                return ['RGBD', '( value, 256.0 )'];
            case GammaEncoding:
                return ['Gamma', '( value, float( GAMMA_FACTOR ) )'];
            default:
                throw new Error('unsupported encoding: ' + encoding);

        }

    }

    function getTexelDecodingFunction(functionName, encoding) {

        var components = getEncodingComponents(encoding);
        return "vec4 " + functionName + "( vec4 value ) {  return " + components[0] + "ToLinear" + components[1] + " ; }";

    }

    function getTexelEncodingFunction(functionName, encoding) {

        var components = getEncodingComponents(encoding);
        return "vec4 " + functionName + "( vec4 value ) { return LinearTo" + components[0] + components[1] + " ; }";

    }

    function getToneMappingFunction(functionName, toneMapping) {

        var toneMappingName;

        switch (toneMapping) {

            case LinearToneMapping:
                toneMappingName = "Linear";
                break;

            case ReinhardToneMapping:
                toneMappingName = "Reinhard";
                break;

            case Uncharted2ToneMapping:
                toneMappingName = "Uncharted2";
                break;

            case CineonToneMapping:
                toneMappingName = "OptimizedCineon";
                break;

            default:
                throw new Error('unsupported toneMapping: ' + toneMapping);

        }

        return "vec3 " + functionName + "( vec3 color ) {  return " + toneMappingName + "ToneMapping( color );  }";

    }

    function generateExtensions(extensions, parameters, rendererExtensions) {

        extensions = extensions || {};

        var chunks = [
            (extensions.derivatives || parameters.envMapCubeUV || parameters.bumpMap || parameters.normalMap || parameters.flatShading) ? '#extension GL_OES_standard_derivatives : enable' : '',
            (extensions.fragDepth || parameters.logarithmicDepthBuffer) && rendererExtensions.get('EXT_frag_depth') ? '#extension GL_EXT_frag_depth : enable' : '',
            (extensions.drawBuffers) && rendererExtensions.get('WEBGL_draw_buffers') ? '#extension GL_EXT_draw_buffers : require' : '',
            (extensions.shaderTextureLOD || parameters.envMap) && rendererExtensions.get('EXT_shader_texture_lod') ? '#extension GL_EXT_shader_texture_lod : enable' : ''
        ];

        return chunks.filter(filterEmptyLine).join('\n');

    }

    function generateDefines(defines) {

        var chunks = [];

        for (var name in defines) {

            var value = defines[name];

            if (value === false) continue;

            chunks.push('#define ' + name + ' ' + value);

        }

        return chunks.join('\n');

    }

    function filterEmptyLine(string) {

        return string !== '';

    }

    function replaceLightNums(string, parameters) {

        return string
            .replace(/NUM_DIR_LIGHTS/g, parameters.numDirLights)
            .replace(/NUM_SPOT_LIGHTS/g, parameters.numSpotLights)
            .replace(/NUM_RECT_AREA_LIGHTS/g, parameters.numRectAreaLights)
            .replace(/NUM_POINT_LIGHTS/g, parameters.numPointLights)
            .replace(/NUM_HEMI_LIGHTS/g, parameters.numHemiLights);

    }

    function parseIncludes(string) {

        var pattern = /^[ \t]*#include +<([\w\d.]+)>/gm;

        function replace(match, include) {

            var replace = ShaderChunk[include];

            if (replace === undefined) {

                throw new Error('Can not resolve #include <' + include + '>');

            }

            return parseIncludes(replace);

        }

        return string.replace(pattern, replace);

    }

    function unrollLoops(string) {

        var pattern = /for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g;

        function replace(match, start, end, snippet) {

            var unroll = '';

            for (var i = parseInt(start); i < parseInt(end); i++) {

                unroll += snippet.replace(/\[ i \]/g, '[ ' + i + ' ]');

            }

            return unroll;

        }

        return string.replace(pattern, replace);

    }

    function WebGLProgram(material, shader) {//, parameters) {

        var parameters = getParameters(material);
        //var shader = ShaderLib[parameters.shaderID];

        //var extensions = material.extensions;
        var defines = material.defines;

        var vertexShader = shader.vertexShader;
        var fragmentShader = shader.fragmentShader;

        var shadowMapTypeDefine = 'SHADOWMAP_TYPE_BASIC';

        if (parameters.shadowMapType === THREE.PCFShadowMap) {

            shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF';

        } else if (parameters.shadowMapType === THREE.PCFSoftShadowMap) {

            shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF_SOFT';

        }

        var envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
        var envMapModeDefine = 'ENVMAP_MODE_REFLECTION';
        var envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';

        if (parameters.envMap) {

            switch (material.envMap.mapping) {

                case CubeReflectionMapping:
                case CubeRefractionMapping:
                    envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
                    break;

                case CubeUVReflectionMapping:
                case CubeUVRefractionMapping:
                    envMapTypeDefine = 'ENVMAP_TYPE_CUBE_UV';
                    break;

                case EquirectangularReflectionMapping:
                case EquirectangularRefractionMapping:
                    envMapTypeDefine = 'ENVMAP_TYPE_EQUIREC';
                    break;

                case SphericalReflectionMapping:
                    envMapTypeDefine = 'ENVMAP_TYPE_SPHERE';
                    break;

            }

            switch (material.envMap.mapping) {

                case CubeRefractionMapping:
                case EquirectangularRefractionMapping:
                    envMapModeDefine = 'ENVMAP_MODE_REFRACTION';
                    break;

            }

            switch (material.combine) {

                case MultiplyOperation:
                    envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';
                    break;

                case MixOperation:
                    envMapBlendingDefine = 'ENVMAP_BLENDING_MIX';
                    break;

                case AddOperation:
                    envMapBlendingDefine = 'ENVMAP_BLENDING_ADD';
                    break;

            }

        }

        var gammaFactorDefine = 1.0;// (renderer.gammaFactor > 0) ? renderer.gammaFactor : 1.0;


        // var customExtensions = generateExtensions(extensions, parameters, renderer.extensions);

        var customDefines = generateDefines(defines);


        var prefixVertex, prefixFragment;

        if (material.isRawShaderMaterial) {

            prefixVertex = [

                customDefines,

                '\n'

            ].filter(filterEmptyLine).join('\n');

            prefixFragment = [

                //customExtensions,
                customDefines,

                '\n'

            ].filter(filterEmptyLine).join('\n');

        } else {

            prefixVertex = [

                //'precision ' + parameters.precision + ' float;',
                //'precision ' + parameters.precision + ' int;',

                '#define SHADER_NAME ' + shader.name,

                //customDefines,

                parameters.supportsVertexTextures ? '#define VERTEX_TEXTURES' : '',

                '#define GAMMA_FACTOR ' + gammaFactorDefine,

                '#define MAX_BONES ' + parameters.maxBones,
                //(parameters.useFog && parameters.fog) ? '#define USE_FOG' : '',
                //(parameters.useFog && parameters.fogExp) ? '#define FOG_EXP2' : '',

                parameters.map ? '#define USE_MAP' : '',
                parameters.envMap ? '#define USE_ENVMAP' : '',
                parameters.envMap ? '#define ' + envMapModeDefine : '',
                parameters.lightMap ? '#define USE_LIGHTMAP' : '',
                parameters.aoMap ? '#define USE_AOMAP' : '',
                parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
                parameters.bumpMap ? '#define USE_BUMPMAP' : '',
                parameters.normalMap ? '#define USE_NORMALMAP' : '',
                parameters.displacementMap && parameters.supportsVertexTextures ? '#define USE_DISPLACEMENTMAP' : '',
                parameters.specularMap ? '#define USE_SPECULARMAP' : '',
                parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
                parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',
                parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
                parameters.vertexColors ? '#define USE_COLOR' : '',

                parameters.flatShading ? '#define FLAT_SHADED' : '',

                parameters.skinning ? '#define USE_SKINNING' : '',
                parameters.useVertexTexture ? '#define BONE_TEXTURE' : '',

                parameters.morphTargets ? '#define USE_MORPHTARGETS' : '',
                parameters.morphNormals && parameters.flatShading === false ? '#define USE_MORPHNORMALS' : '',
                parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
                parameters.flipSided ? '#define FLIP_SIDED' : '',

                '#define NUM_CLIPPING_PLANES ' + parameters.numClippingPlanes,

                parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
                parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',

                parameters.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',

                parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
                //parameters.logarithmicDepthBuffer && renderer.extensions.get('EXT_frag_depth') ? '#define USE_LOGDEPTHBUF_EXT' : '',

                //'uniform mat4 modelMatrix;',
                //'uniform mat4 modelViewMatrix;',
                //'uniform mat4 projectionMatrix;',
                //'uniform mat4 viewMatrix;',
                //'uniform mat3 normalMatrix;',
                //'uniform vec3 cameraPosition;',

                //'attribute vec3 position;',
                //'attribute vec3 normal;',
                //'attribute vec2 uv;',

                '#ifdef USE_COLOR',

                '	attribute vec3 color;',

                '#endif',

                '#ifdef USE_MORPHTARGETS',

                '	attribute vec3 morphTarget0;',
                '	attribute vec3 morphTarget1;',
                '	attribute vec3 morphTarget2;',
                '	attribute vec3 morphTarget3;',

                '	#ifdef USE_MORPHNORMALS',

                '		attribute vec3 morphNormal0;',
                '		attribute vec3 morphNormal1;',
                '		attribute vec3 morphNormal2;',
                '		attribute vec3 morphNormal3;',

                '	#else',

                '		attribute vec3 morphTarget4;',
                '		attribute vec3 morphTarget5;',
                '		attribute vec3 morphTarget6;',
                '		attribute vec3 morphTarget7;',

                '	#endif',

                '#endif',

                '#ifdef USE_SKINNING',

                '	attribute vec4 skinIndex;',
                '	attribute vec4 skinWeight;',

                '#endif',

                '\n'

            ].filter(filterEmptyLine).join('\n');

            prefixFragment = [

                //customExtensions,

                //'precision ' + parameters.precision + ' float;',
                //'precision ' + parameters.precision + ' int;',

                '#define SHADER_NAME ' + shader.name,

                customDefines,

                parameters.alphaTest ? '#define ALPHATEST ' + parameters.alphaTest : '',

                '#define GAMMA_FACTOR ' + gammaFactorDefine,

                (parameters.useFog && parameters.fog) ? '#define USE_FOG' : '',
                (parameters.useFog && parameters.fogExp) ? '#define FOG_EXP2' : '',

                parameters.map ? '#define USE_MAP' : '',
                parameters.envMap ? '#define USE_ENVMAP' : '',
                parameters.envMap ? '#define ' + envMapTypeDefine : '',
                parameters.envMap ? '#define ' + envMapModeDefine : '',
                parameters.envMap ? '#define ' + envMapBlendingDefine : '',
                parameters.lightMap ? '#define USE_LIGHTMAP' : '',
                parameters.aoMap ? '#define USE_AOMAP' : '',
                parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
                parameters.bumpMap ? '#define USE_BUMPMAP' : '',
                parameters.normalMap ? '#define USE_NORMALMAP' : '',
                parameters.specularMap ? '#define USE_SPECULARMAP' : '',
                parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
                parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',
                parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
                parameters.vertexColors ? '#define USE_COLOR' : '',

                parameters.gradientMap ? '#define USE_GRADIENTMAP' : '',

                parameters.flatShading ? '#define FLAT_SHADED' : '',

                parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
                parameters.flipSided ? '#define FLIP_SIDED' : '',

                '#define NUM_CLIPPING_PLANES ' + parameters.numClippingPlanes,
                '#define UNION_CLIPPING_PLANES ' + (parameters.numClippingPlanes - parameters.numClipIntersection),

                parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
                parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',

                parameters.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : '',

                parameters.physicallyCorrectLights ? "#define PHYSICALLY_CORRECT_LIGHTS" : '',

                parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
                //parameters.logarithmicDepthBuffer && renderer.extensions.get('EXT_frag_depth') ? '#define USE_LOGDEPTHBUF_EXT' : '',

                //parameters.envMap && renderer.extensions.get('EXT_shader_texture_lod') ? '#define TEXTURE_LOD_EXT' : '',

                'uniform mat4 viewMatrix;',
                'uniform vec3 cameraPosition;',

                //(parameters.toneMapping !== THREE.NoToneMapping) ? "#define TONE_MAPPING" : '',
                //(parameters.toneMapping !== THREE.NoToneMapping) ? ShaderChunk['tonemapping_pars_fragment'] : '',  // this code is required here because it is used by the toneMapping() function defined below
                //(parameters.toneMapping !== THREE.NoToneMapping) ? getToneMappingFunction("toneMapping", parameters.toneMapping) : '',

                parameters.dithering ? '#define DITHERING' : '',

                (parameters.outputEncoding || parameters.mapEncoding || parameters.envMapEncoding || parameters.emissiveMapEncoding) ? ShaderChunk['encodings_pars_fragment'] : '', // this code is required here because it is used by the various encoding/decoding function defined below
                parameters.mapEncoding ? getTexelDecodingFunction('mapTexelToLinear', parameters.mapEncoding) : '',
                parameters.envMapEncoding ? getTexelDecodingFunction('envMapTexelToLinear', parameters.envMapEncoding) : '',
                parameters.emissiveMapEncoding ? getTexelDecodingFunction('emissiveMapTexelToLinear', parameters.emissiveMapEncoding) : '',
                parameters.outputEncoding ? getTexelEncodingFunction("linearToOutputTexel", parameters.outputEncoding) : '',

                parameters.depthPacking ? "#define DEPTH_PACKING " + material.depthPacking : '',

                '\n'

            ].filter(filterEmptyLine).join('\n');

        }

        vertexShader = parseIncludes(vertexShader);
        vertexShader = replaceLightNums(vertexShader, parameters);

        fragmentShader = parseIncludes(fragmentShader);
        fragmentShader = replaceLightNums(fragmentShader, parameters);

        if (!material.isShaderMaterial) {

            vertexShader = unrollLoops(vertexShader);
            fragmentShader = unrollLoops(fragmentShader);

        }

        var vertexGlsl = prefixVertex + vertexShader;
        var fragmentGlsl = prefixFragment + fragmentShader;


        this.id = programIdCount++;
        this.usedTimes = 1;
        this.vertexShader = vertexGlsl;
        this.fragmentShader = fragmentGlsl;

        return this;

    }

}
export default ShaderUtils;