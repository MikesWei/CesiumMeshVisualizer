define([
    'Core/Shaders/ShaderChunk'
], function (
    ShaderChunk
    ) {


    /**
	 * Uniforms library for shared webgl shaders
	 */

    var UniformsLib = {

        common: {

            diffuse: { value: new Cesium.Color(0xeeeeee) },
            opacity: { value: 1.0 },

            map: { value: null },
            offsetRepeat: { value: new Cesium.Cartesian4(0, 0, 1, 1) },

            specularMap: { value: null },
            alphaMap: { value: null },

            envMap: { value: null },
            flipEnvMap: { value: -1 },
            reflectivity: { value: 1.0 },
            refractionRatio: { value: 0.98 }

        },

        aomap: {

            aoMap: { value: null },
            aoMapIntensity: { value: 1 }

        },

        lightmap: {

            lightMap: { value: null },
            lightMapIntensity: { value: 1 }

        },

        emissivemap: {

            emissiveMap: { value: null }

        },

        bumpmap: {

            bumpMap: { value: null },
            bumpScale: { value: 1 }

        },

        normalmap: {

            normalMap: { value: null },
            normalScale: { value: new Cesium.Cartesian2(1, 1) }

        },

        displacementmap: {

            displacementMap: { value: null },
            displacementScale: { value: 1 },
            displacementBias: { value: 0 }

        },

        roughnessmap: {

            roughnessMap: { value: null }

        },

        metalnessmap: {

            metalnessMap: { value: null }

        },

        gradientmap: {

            gradientMap: { value: null }

        },

        fog: {

            fogDensity: { value: 0.00025 },
            fogNear: { value: 1 },
            fogFar: { value: 2000 },
            fogColor: { value: new Cesium.Color(0xffffff) }

        },

        lights: {

            ambientLightColor: { value: [] },

            directionalLights: {
                value: [], properties: {
                    direction: {},
                    color: {},

                    shadow: {},
                    shadowBias: {},
                    shadowRadius: {},
                    shadowMapSize: {}
                }
            },

            directionalShadowMap: { value: [] },
            directionalShadowMatrix: { value: [] },

            spotLights: {
                value: [], properties: {
                    color: {},
                    position: {},
                    direction: {},
                    distance: {},
                    coneCos: {},
                    penumbraCos: {},
                    decay: {},

                    shadow: {},
                    shadowBias: {},
                    shadowRadius: {},
                    shadowMapSize: {}
                }
            },

            spotShadowMap: { value: [] },
            spotShadowMatrix: { value: [] },

            pointLights: {
                value: [], properties: {
                    color: {},
                    position: {},
                    decay: {},
                    distance: {},

                    shadow: {},
                    shadowBias: {},
                    shadowRadius: {},
                    shadowMapSize: {}
                }
            },

            pointShadowMap: { value: [] },
            pointShadowMatrix: { value: [] },

            hemisphereLights: {
                value: [], properties: {
                    direction: {},
                    skyColor: {},
                    groundColor: {}
                }
            },

            // TODO (abelnation): RectAreaLight BRDF data needs to be moved from example to main src
            rectAreaLights: {
                value: [], properties: {
                    color: {},
                    position: {},
                    width: {},
                    height: {}
                }
            }

        },

        points: {

            diffuse: { value: new Cesium.Color(0xeeeeee) },
            opacity: { value: 1.0 },
            size: { value: 1.0 },
            scale: { value: 1.0 },
            map: { value: null },
            offsetRepeat: { value: new Cesium.Cartesian4(0, 0, 1, 1) }

        }

    };

    /**
	 * Uniform Utilities
	 */

    var UniformsUtils = {

        merge: function (uniforms) {

            var merged = {};

            for (var u = 0; u < uniforms.length; u++) {

                var tmp = this.clone(uniforms[u]);

                for (var p in tmp) {

                    merged[p] = tmp[p];

                }

            }

            return merged;

        },

        clone: function (uniforms_src) {

            var uniforms_dst = {};

            for (var u in uniforms_src) {

                uniforms_dst[u] = {};

                for (var p in uniforms_src[u]) {

                    var parameter_src = uniforms_src[u][p];

                    if (parameter_src && (parameter_src instanceof Cesium.Color ||
						parameter_src instanceof Cesium.Matrix3 || parameter_src instanceof Cesium.Matrix4 ||
						parameter_src instanceof Cesium.Cartesian2 || parameter_src instanceof Cesium.Cartesian3
                        || parameter_src instanceof Cesium.Cartesian4
                        //||parameter_src.isTexture
                        )) {

                        uniforms_dst[u][p] = parameter_src.constructor.clone(parameter_src);//.clone();

                    } else if (Array.isArray(parameter_src)) {

                        uniforms_dst[u][p] = parameter_src.slice();

                    } else {

                        uniforms_dst[u][p] = parameter_src;

                    }

                }

            }

            return uniforms_dst;

        }

    };




    /**
	 * @author alteredq / http://alteredqualia.com/
	 * @author mrdoob / http://mrdoob.com/
	 * @author mikael emtinger / http://gomo.se/
	 */

    var ShaderLib = {

        basic: {

            uniforms: UniformsUtils.merge([
				UniformsLib.common,
				UniformsLib.aomap,
				UniformsLib.lightmap,
				UniformsLib.fog
            ]),

            vertexShader: ShaderChunk.meshbasic_vert,
            fragmentShader: ShaderChunk.meshbasic_frag

        },

        lambert: {

            uniforms: UniformsUtils.merge([
				UniformsLib.common,
				UniformsLib.aomap,
				UniformsLib.lightmap,
				UniformsLib.emissivemap,
				UniformsLib.fog,
				UniformsLib.lights,
				{
				    emissive: { value: new Cesium.Color(0x000000) }
				}
            ]),

            vertexShader: ShaderChunk.meshlambert_vert,
            fragmentShader: ShaderChunk.meshlambert_frag

        },

        phong: {

            uniforms: UniformsUtils.merge([
				UniformsLib.common,
				UniformsLib.aomap,
				UniformsLib.lightmap,
				UniformsLib.emissivemap,
				UniformsLib.bumpmap,
				UniformsLib.normalmap,
				UniformsLib.displacementmap,
				UniformsLib.gradientmap,
				UniformsLib.fog,
				UniformsLib.lights,
				{
				    emissive: { value: new Cesium.Color(0x000000) },
				    specular: { value: new Cesium.Color(0x111111) },
				    shininess: { value: 30 }
				}
            ]),

            vertexShader: ShaderChunk.meshphong_vert,
            fragmentShader: ShaderChunk.meshphong_frag

        },

        standard: {

            uniforms: UniformsUtils.merge([
				UniformsLib.common,
				UniformsLib.aomap,
				UniformsLib.lightmap,
				UniformsLib.emissivemap,
				UniformsLib.bumpmap,
				UniformsLib.normalmap,
				UniformsLib.displacementmap,
				UniformsLib.roughnessmap,
				UniformsLib.metalnessmap,
				UniformsLib.fog,
				UniformsLib.lights,
				{
				    emissive: { value: new Cesium.Color(0x000000) },
				    roughness: { value: 0.5 },
				    metalness: { value: 0.5 },
				    envMapIntensity: { value: 1 } // temporary
				}
            ]),

            vertexShader: ShaderChunk.meshphysical_vert,
            fragmentShader: ShaderChunk.meshphysical_frag

        },

        points: {

            uniforms: UniformsUtils.merge([
				UniformsLib.points,
				UniformsLib.fog
            ]),

            vertexShader: ShaderChunk.points_vert,
            fragmentShader: ShaderChunk.points_frag

        },

        dashed: {

            uniforms: UniformsUtils.merge([
				UniformsLib.common,
				UniformsLib.fog,
				{
				    scale: { value: 1 },
				    dashSize: { value: 1 },
				    totalSize: { value: 2 }
				}
            ]),

            vertexShader: ShaderChunk.linedashed_vert,
            fragmentShader: ShaderChunk.linedashed_frag

        },

        depth: {

            uniforms: UniformsUtils.merge([
				UniformsLib.common,
				UniformsLib.displacementmap
            ]),

            vertexShader: ShaderChunk.depth_vert,
            fragmentShader: ShaderChunk.depth_frag

        },

        normal: {

            uniforms: UniformsUtils.merge([
				UniformsLib.common,
				UniformsLib.bumpmap,
				UniformsLib.normalmap,
				UniformsLib.displacementmap,
				{
				    opacity: { value: 1.0 }
				}
            ]),

            vertexShader: ShaderChunk.normal_vert,
            fragmentShader: ShaderChunk.normal_frag

        },

        /* -------------------------------------------------------------------------
		//	Cube map shader
		 ------------------------------------------------------------------------- */

        cube: {

            uniforms: {
                tCube: { value: null },
                tFlip: { value: -1 },
                opacity: { value: 1.0 }
            },

            vertexShader: ShaderChunk.cube_vert,
            fragmentShader: ShaderChunk.cube_frag

        },

        /* -------------------------------------------------------------------------
		//	Cube map shader
		 ------------------------------------------------------------------------- */

        equirect: {

            uniforms: {
                tEquirect: { value: null },
                tFlip: { value: -1 }
            },

            vertexShader: ShaderChunk.equirect_vert,
            fragmentShader: ShaderChunk.equirect_frag

        },

        distanceRGBA: {

            uniforms: {
                lightPos: { value: new Cesium.Cartesian3() }
            },

            vertexShader: ShaderChunk.distanceRGBA_vert,
            fragmentShader: ShaderChunk.distanceRGBA_frag

        }

    };

    ShaderLib.physical = {

        uniforms: UniformsUtils.merge([
			ShaderLib.standard.uniforms,
			{
			    clearCoat: { value: 0 },
			    clearCoatRoughness: { value: 0 }
			}
        ]),

        vertexShader: ShaderChunk.meshphysical_vert,
        fragmentShader: ShaderChunk.meshphysical_frag

    };

    return ShaderLib;

})