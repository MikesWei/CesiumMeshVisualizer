  
import MeshMaterial from './MeshMaterial.js';

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

/**
*
*@constructor
*@memberof Cesium
*/
function MaterialUtils() {

}

/**
*
*@param {THREE.Material}material3js
*@return {Cesium.MeshMaterial}
*/
MaterialUtils.fromMaterial3js = function (material3js) {
    if(typeof THREE=='undefined'){
        throw new Error('Three.js is required.')
    }
    var shaderID = shaderIDs[material3js.type];
    material3js["is" + material3js.type] = true;
    var shader = THREE.ShaderLib[shaderID];

    if (!shader) {
        shader = material3js;
    }

    var material = new MeshMaterial({
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        uniforms: cloneUniforms(shader.uniforms)
    });

    material.material3js = material3js;
    MaterialUtils.updateMaterialFrom3js(material);
    return material;
}

function cloneUniforms(uniforms3js) {
    var uniforms = {};
    for (var i in uniforms3js) {
        if (uniforms3js.hasOwnProperty(i)) {
            uniforms[i] = {
                value: {}
            };
            for (var n in uniforms3js[i]) {
                if (n !== "value") {
                    uniforms[i][n] = uniforms3js[i][n];
                }
            }
            if (uniforms3js[i].t) {
                switch (uniforms3js[i].t) {

                    default:
                }
            }

            bindUniformValue(uniforms[i], uniforms3js[i].value);
        }
    }
    return uniforms;
}

/**
*
*@param {Cesium.MeshMaterial}materialWidth3js
*@private
*/
MaterialUtils.updateMaterialFrom3js = function (materialWidth3js) {
    if (!materialWidth3js || !materialWidth3js.material3js) {
        return;
    }

    var material3js = materialWidth3js.material3js;
    materialWidth3js.translucent = material3js.transparent;

    materialWidth3js.wireframe = material3js.wireframe;

    var m_uniforms = materialWidth3js.uniforms;
    var material = materialWidth3js.material3js;
    if (material.isMeshBasicMaterial ||
        material.isMeshLambertMaterial ||
        material.isMeshPhongMaterial ||
        material.isMeshStandardMaterial ||
        material.isMeshNormalMaterial ||
        material.isMeshDepthMaterial) {

        refreshUniformsCommon(m_uniforms, material);

    }

    // refresh single material specific uniforms

    if (material.isLineBasicMaterial) {

        refreshUniformsLine(m_uniforms, material);

    } else if (material.isLineDashedMaterial) {

        refreshUniformsLine(m_uniforms, material);
        refreshUniformsDash(m_uniforms, material);

    } else if (material.isPointsMaterial) {

        refreshUniformsPoints(m_uniforms, material);

    } else if (material.isMeshLambertMaterial) {

        refreshUniformsLambert(m_uniforms, material);

    } else if (material.isMeshToonMaterial) {

        refreshUniformsToon(m_uniforms, material);

    } else if (material.isMeshPhongMaterial) {

        refreshUniformsPhong(m_uniforms, material);

    } else if (material.isMeshPhysicalMaterial) {

        refreshUniformsPhysical(m_uniforms, material);

    } else if (material.isMeshStandardMaterial) {

        refreshUniformsStandard(m_uniforms, material);

    } else if (material.isMeshDepthMaterial) {

        if (material.displacementMap) {

            bindUniformValue(m_uniforms.displacementMap, material.displacementMap);
            bindUniformValue(m_uniforms.displacementScale, material.displacementScale);
            bindUniformValue(m_uniforms.displacementBias, material.displacementBias);

        }

    } else if (material.isMeshNormalMaterial) {

        refreshUniformsNormal(m_uniforms, material);

    } else {
        for (var i in material.uniforms) {
            if (material.uniforms.hasOwnProperty(i)) {
                bindUniformValue(m_uniforms[i], material.uniforms[i].value);
            }
        }
    }
    //if (material.lights) {

    //    // wire up the material to this renderer's lighting state

    //    //uniforms.ambientLightColor.value = _lights.ambient;
    //    //uniforms.directionalLights.value = _lights.directional;
    //    //uniforms.spotLights.value = _lights.spot;
    //    //uniforms.rectAreaLights.value = _lights.rectArea;
    //    //uniforms.pointLights.value = _lights.point;
    //    //uniforms.hemisphereLights.value = _lights.hemi;

    //    //uniforms.directionalShadowMap.value = _lights.directionalShadowMap;
    //    //uniforms.directionalShadowMatrix.value = _lights.directionalShadowMatrix;
    //    //uniforms.spotShadowMap.value = _lights.spotShadowMap;
    //    //uniforms.spotShadowMatrix.value = _lights.spotShadowMatrix;
    //    //uniforms.pointShadowMap.value = _lights.pointShadowMap;
    //    //uniforms.pointShadowMatrix.value = _lights.pointShadowMatrix;
    //    // TODO (abelnation): add area lights shadow info to uniforms

    //} else {
    m_uniforms.ambientLightColor = { value: new Cesium.Color(0.06666666666666667, 0.06666666666666667, 0.06666666666666667) };
    //}
}



/**
 *
 *@param {Object}material3js
 *@return {Boolean}
 */
MaterialUtils.isMaterial3js = function (material3js) {
    return typeof THREE !== 'undefined' && material3js instanceof THREE.Material;
}
// Uniforms (refresh bindUniformValue(uniforms objects)

function refreshUniformsCommon(uniforms, material) {

    bindUniformValue(uniforms.opacity, material.opacity);

    bindUniformValue(uniforms.diffuse, material.color);

    if (material.emissive) {
        var val3js = new material.emissive.constructor().copy(material.emissive).multiplyScalar(material.emissiveIntensity)
        bindUniformValue(uniforms.emissive, val3js);

    }

    bindUniformValue(uniforms.map, material.map);
    bindUniformValue(uniforms.specularMap, material.specularMap);
    bindUniformValue(uniforms.alphaMap, material.alphaMap);

    if (material.lightMap) {

        bindUniformValue(uniforms.lightMap, material.lightMap);
        bindUniformValue(uniforms.lightMapIntensity, material.lightMapIntensity);

    }

    if (material.aoMap) {

        bindUniformValue(uniforms.aoMap, material.aoMap);
        bindUniformValue(uniforms.aoMapIntensity, material.aoMapIntensity);

    }

    // uv repeat and offset setting priorities
    // 1. color map
    // 2. specular map
    // 3. normal map
    // 4. bump map
    // 5. alpha map
    // 6. emissive map

    var uvScaleMap

    if (material.map) {

        uvScaleMap = material.map

    } else if (material.specularMap) {

        uvScaleMap = material.specularMap

    } else if (material.displacementMap) {

        uvScaleMap = material.displacementMap

    } else if (material.normalMap) {

        uvScaleMap = material.normalMap

    } else if (material.bumpMap) {

        uvScaleMap = material.bumpMap

    } else if (material.roughnessMap) {

        uvScaleMap = material.roughnessMap

    } else if (material.metalnessMap) {

        uvScaleMap = material.metalnessMap

    } else if (material.alphaMap) {

        uvScaleMap = material.alphaMap

    } else if (material.emissiveMap) {

        uvScaleMap = material.emissiveMap

    }

    if (uvScaleMap !== undefined) {

        // backwards compatibility
        if (uvScaleMap.isWebGLRenderTarget) {

            uvScaleMap = uvScaleMap.texture

        }

        var offset = uvScaleMap.offset
        var repeat = uvScaleMap.repeat

        bindUniformValue(uniforms.offsetRepeat, offset);

    }

    bindUniformValue(uniforms.envMap, material.envMap);

    // don't flip CubeTexture envMaps, flip everything else:
    //  WebGLRenderTargetCube will be flipped for backwards compatibility
    //  WebGLRenderTargetCube.texture will be flipped because it's a Texture and NOT a CubeTexture
    // this check must be handled differently, or removed entirely, if WebGLRenderTargetCube uses a CubeTexture in the future
    bindUniformValue(uniforms.flipEnvMap, (!(material.envMap && material.envMap.isCubeTexture)) ? 1 : -1);

    bindUniformValue(uniforms.reflectivity, material.reflectivity);
    bindUniformValue(uniforms.refractionRatio, material.refractionRatio);

}

function refreshUniformsLine(uniforms, material) {

    bindUniformValue(uniforms.diffuse, material.color);
    bindUniformValue(uniforms.opacity, material.opacity);

}

function refreshUniformsDash(uniforms, material) {

    bindUniformValue(uniforms.dashSize, material.dashSize);
    bindUniformValue(uniforms.totalSize, material.dashSize + material.gapSize);
    bindUniformValue(uniforms.scale, material.scale);

}

function refreshUniformsPoints(uniforms, material) {

    bindUniformValue(uniforms.diffuse, material.color);
    bindUniformValue(uniforms.opacity, material.opacity);
    bindUniformValue(uniforms.size, material.size * _pixelRatio);
    bindUniformValue(uniforms.scale, _height * 0.5);

    bindUniformValue(uniforms.map, material.map);

    if (material.map !== null) {

        var offset = material.map.offset;
        var repeat = material.map.repeat;

        bindUniformValue(uniforms.offsetRepeat.value.set(offset.x, offset.y, repeat.x, repeat.y));

    }

}

function refreshUniformsFog(uniforms, fog) {

    bindUniformValue(uniforms.fogColor, fog.color);

    if (fog.isFog) {

        bindUniformValue(uniforms.fogNear, fog.near);
        bindUniformValue(uniforms.fogFar, fog.far);

    } else if (fog.isFogExp2) {

        bindUniformValue(uniforms.fogDensity, fog.density);

    }

}

function refreshUniformsLambert(uniforms, material) {

    if (material.emissiveMap) {

        bindUniformValue(uniforms.emissiveMap, material.emissiveMap);

    }

}

function refreshUniformsPhong(uniforms, material) {

    bindUniformValue(uniforms.specular, material.specular);
    bindUniformValue(uniforms.shininess, Math.max(material.shininess, 1e-4)); // to prevent pow( 0.0, 0.0 )

    if (material.emissiveMap) {

        bindUniformValue(uniforms.emissiveMap, material.emissiveMap);

    }

    if (material.bumpMap) {

        bindUniformValue(uniforms.bumpMap, material.bumpMap);
        bindUniformValue(uniforms.bumpScale, material.bumpScale);

    }

    if (material.normalMap) {

        bindUniformValue(uniforms.normalMap, material.normalMap);
        bindUniformValue(uniforms.normalScale.value.copy(material.normalScale));

    }

    if (material.displacementMap) {

        bindUniformValue(uniforms.displacementMap, material.displacementMap);
        bindUniformValue(uniforms.displacementScale, material.displacementScale);
        bindUniformValue(uniforms.displacementBias, material.displacementBias);

    }

}

function refreshUniformsToon(uniforms, material) {

    refreshUniformsPhong(uniforms, material);

    if (material.gradientMap) {

        bindUniformValue(uniforms.gradientMap, material.gradientMap);

    }

}

function refreshUniformsStandard(uniforms, material) {

    bindUniformValue(uniforms.roughness, material.roughness);
    bindUniformValue(uniforms.metalness, material.metalness);

    if (material.roughnessMap) {

        bindUniformValue(uniforms.roughnessMap, material.roughnessMap);

    }

    if (material.metalnessMap) {

        bindUniformValue(uniforms.metalnessMap, material.metalnessMap);

    }

    if (material.emissiveMap) {

        bindUniformValue(uniforms.emissiveMap, material.emissiveMap);

    }

    if (material.bumpMap) {

        bindUniformValue(uniforms.bumpMap, material.bumpMap);
        bindUniformValue(uniforms.bumpScale, material.bumpScale);

    }

    if (material.normalMap) {

        bindUniformValue(uniforms.normalMap, material.normalMap);
        bindUniformValue(uniforms.normalScale.value.copy(material.normalScale));

    }

    if (material.displacementMap) {

        bindUniformValue(uniforms.displacementMap, material.displacementMap);
        bindUniformValue(uniforms.displacementScale, material.displacementScale);
        bindUniformValue(uniforms.displacementBias, material.displacementBias);

    }

    if (material.envMap) {

        //bindUniformValue(uniforms.envMap, material.envMap); // part of bindUniformValue(uniforms common
        bindUniformValue(uniforms.envMapIntensity, material.envMapIntensity);

    }

}

function refreshUniformsPhysical(uniforms, material) {

    bindUniformValue(uniforms.clearCoat, material.clearCoat);
    bindUniformValue(uniforms.clearCoatRoughness, material.clearCoatRoughness);

    refreshUniformsStandard(uniforms, material)

}

function refreshUniformsNormal(uniforms, material) {

    if (material.bumpMap) {

        bindUniformValue(uniforms.bumpMap, material.bumpMap);
        bindUniformValue(uniforms.bumpScale, material.bumpScale);

    }

    if (material.normalMap) {

        bindUniformValue(uniforms.normalMap, material.normalMap);
        bindUniformValue(uniforms.normalScale.value.copy(material.normalScale));

    }

    if (material.displacementMap) {

        bindUniformValue(uniforms.displacementMap, material.displacementMap);
        bindUniformValue(uniforms.displacementScale, material.displacementScale);
        bindUniformValue(uniforms.displacementBias, material.displacementBias);

    }

}

function bindUniformValue(valCesium, val3js) {

    var type = typeof val3js;
    if (type === 'undefined') {
        valCesium.value = undefined;
        return;
    }
    if (val3js === null) {
        valCesium.value = null; return;
    }
    if (typeof valCesium.value !== "undefined"
        && valCesium.value != null
        && (valCesium.value.constructor
            && valCesium.value.constructor.clone
            && val3js.constructor == valCesium.value.constructor)) {

        valCesium.value = valCesium.value.constructor.clone(val3js);
    } else {
        switch (type) {
            case "number":
            case "string":
                valCesium.value = val3js;
                break;
            case "object":
                if (val3js instanceof THREE.Vector2) {
                    if (!valCesium.value.constructor.clone) {
                        valCesium.value = new Cesium.Cartesian2();
                    }
                }
                if (val3js instanceof THREE.Vector3) {
                    if (!valCesium.value.constructor.clone) {
                        valCesium.value = new Cesium.Cartesian3();
                    }
                }
                if (val3js instanceof THREE.Vector4) {
                    if (!valCesium.value.constructor.clone) {
                        valCesium.value = new Cesium.Cartesian4();
                    }
                }
                if (val3js instanceof THREE.Matrix3) {
                    if (!valCesium.value.constructor.clone) {
                        valCesium.value = new Cesium.Matrix3();
                    }
                }
                if (val3js instanceof THREE.Matrix4) {
                    if (!valCesium.value.constructor.clone) {
                        valCesium.value = new Cesium.Matrix4();
                    }
                }
                if (val3js instanceof THREE.Color) {
                    if (!valCesium.value.constructor.clone) {
                        valCesium.value = new Cesium.Color(val3js.r, val3js.g, val3js.b, val3js.a);
                    }
                } else if (valCesium.value != null && valCesium.value.constructor.clone) {
                    valCesium.value.constructor.clone(val3js, valCesium.value);
                } else if (val3js instanceof THREE.Texture) {
                    if (valCesium.value != val3js.image) {
                        valCesium.value = val3js.image;
                        var sampler = {};

                        sampler.magnificationFilter = Cesium.WebGLConstants.LINEAR;
                        sampler.minificationFilter = Cesium.WebGLConstants.NEAREST_MIPMAP_LINEAR;
                        sampler.wrapS = Cesium.WebGLConstants.REPEAT;
                        sampler.wrapT = Cesium.WebGLConstants.REPEAT;
                        valCesium.sampler = sampler;
                        valCesium.flipY = val3js.flipY;

                        valCesium.needsUpdate = true;
                    }
                } else {
                    valCesium.value = val3js;
                }
                break;
            default:
                console.log("未知uniform.value类型");
                break;
        }
    }
}

export default MaterialUtils; 