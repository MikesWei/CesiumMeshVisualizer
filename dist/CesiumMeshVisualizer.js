(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CesiumMeshVisualizer = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _GeometryUtils = require('./GeometryUtils.js');

var _GeometryUtils2 = _interopRequireDefault(_GeometryUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
*
  <pre><code>  
          +            ——
        +   +           |
      +       +     headLength
    +           +       |
  ++++headWidth++++   ——
        +  +            |
        +  +            |
        +  +            |
        +  +          length
        +  +            |
        +  +            |
        +  +            |
        ++++           ——
        width

    </code> </pre>
*@param {Object}[options] 
*@param {Number}[options.length=50000]   
*@param {Number}[options.width=250]   
*@param {Number}[options.headLength=5000]   
*@param {Number}[options.headWidth=1000]    
*@param {Boolean}[options.reverse=false]   
* 
*@property {Number}length   
*@property {Number}width   
*@property {Number}headLength   
*@property {Number}headWidth   
*@property {Boolean}reverse  
*
*@constructor
*@memberof Cesium
*/
function ArrowGeometry(options) {
    options = Cesium.defaultValue(options, {});
    this.length = Cesium.defaultValue(options.length, 50000);
    this.width = Cesium.defaultValue(options.width, 125);
    this.headLength = Cesium.defaultValue(options.headLength, 5000);
    this.headWidth = Cesium.defaultValue(options.headWidth, 1000);
    this.reverse = Cesium.defaultValue(options.reverse, false);
}

/**
*
*@param {Cesium.ArrowGeometry}
*@return {Cesium.Geometry}
*/
ArrowGeometry.createGeometry = function (arrowGeometry) {
    var length = arrowGeometry.length;
    var width = arrowGeometry.width;
    var headLength = arrowGeometry.headLength;
    var headWidth = arrowGeometry.headWidth;
    var reverse = arrowGeometry.reverse;

    var line = Cesium.CylinderGeometry.createGeometry(new Cesium.CylinderGeometry({
        length: length,
        topRadius: width,
        bottomRadius: width
    }));
    var arrow;
    if (reverse) {
        arrow = Cesium.CylinderGeometry.createGeometry(new Cesium.CylinderGeometry({
            length: headLength,
            topRadius: headWidth,
            bottomRadius: 0
        }));
        _GeometryUtils2.default.translate(arrow, [0, 0, -(length + headLength) / 2]);
    } else {
        arrow = Cesium.CylinderGeometry.createGeometry(new Cesium.CylinderGeometry({
            length: headLength,
            topRadius: 0,
            bottomRadius: headWidth
        }));
        _GeometryUtils2.default.translate(arrow, [0, 0, (length + headLength) / 2]);
    }

    var lineWithArrow = _GeometryUtils2.default.mergeGeometries([line, arrow]);

    return lineWithArrow;
};
exports.default = ArrowGeometry;

},{"./GeometryUtils.js":5}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
*
*@param {Object}options
*@param {Array<Number>|Float32Array}options.positions
*@param {Array<Number>|Int32Array}options.indices
*@param {Array<Number>|Float32Array}[options.normals]
*@param {Array<Number>|Float32Array}[options.uvs]
*
*@memberof Cesium
*@constructor
*/
function BasicGeometry(options) {
    this.positions = options.positions;
    this.normals = options.normals;
    this.uvs = options.uvs;
    this.indices = options.indices;
}
/**
*
*@param {Cesium.BasicGeometry}basicGeometry
*@return {Cesiumm.Geometry} 
*/
BasicGeometry.createGeometry = function (basicGeometry) {
    if (!basicGeometry.positions) {
        throw new Error("缺少positions参数");
    }
    if (!basicGeometry.indices) {
        throw new Error("缺少indices参数");
    }
    var positions = basicGeometry.positions;
    var normals = basicGeometry.normals;
    var uvs = basicGeometry.uvs;
    var indices = basicGeometry.indices instanceof Int32Array ? basicGeometry.indices : new Int32Array(basicGeometry.indices);

    var attributes = {
        position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: positions instanceof Float32Array ? positions : new Float32Array(basicGeometry.positions)
        })
    };
    if (normals) {
        attributes.normal = new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 3,
            values: normals instanceof Float32Array ? normals : new Float32Array(normals)
        });
    }
    if (uvs) {
        attributes.uv = new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 2,
            values: uvs instanceof Float32Array ? uvs : new Float32Array(uvs)
        });
    }

    var bs = Cesium.BoundingSphere.fromVertices(positions);
    var geo = new Cesium.Geometry({
        attributes: attributes,
        indices: new Int32Array(indices),
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: bs
    });
    return geo;
};
exports.default = BasicGeometry;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _MeshMaterial = require('./MeshMaterial.js');

var _MeshMaterial2 = _interopRequireDefault(_MeshMaterial);

var _ShaderChunk = require('./Shaders/ShaderChunk.js');

var _ShaderChunk2 = _interopRequireDefault(_ShaderChunk);

var _Path = require('../Util/Path.js');

var _Path2 = _interopRequireDefault(_Path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function BasicMeshMaterial(options) {
    options = options ? options : {};

    options.uniforms = options.uniforms ? options.uniforms : {
        ambientColor: [0, 0, 0, 1.0], // Ka
        emissionColor: [0, 0, 0, 1.0], // Ke
        diffuseColor: [0, 0, 0, 1.0], // Kd
        specularColor: [0, 0, 0, 1.0], // Ks
        specularShininess: 0, // Ns
        alpha: undefined, // d / Tr
        ambientColorMap: undefined, // map_Ka
        emissionColorMap: undefined, // map_Ke
        diffuseColorMap: undefined, // map_Kd
        specularColorMap: undefined, // map_Ks
        specularShininessMap: undefined, // map_Ns
        normalMap: undefined, // map_Bump
        alphaMap: undefined // map_d
    };
    options.uniforms.ambientColor = Cesium.defaultValue(options.uniforms.ambientColor, [0, 0, 0, 1.0]);
    options.uniforms.emissionColor = Cesium.defaultValue(options.uniforms.emissionColor, [0, 0, 0, 1.0]);
    options.uniforms.diffuseColor = Cesium.defaultValue(options.uniforms.diffuseColor, [0, 0, 0, 1.0]);
    options.uniforms.specularColor = Cesium.defaultValue(options.uniforms.specularColor, [0, 0, 0, 1.0]);
    options.uniforms.alpha = Cesium.defaultValue(options.uniforms.alpha, 1);
    options.uniforms.specularShininess = Cesium.defaultValue(options.uniforms.specularShininess, 0);
    options.side = Cesium.defaultValue(options.side, _MeshMaterial2.default.Sides.FRONT);

    _MeshMaterial2.default.apply(this, [options]);
    this.blendEnable = false;
    var withTexture = options.withTexture;
    var withNormals = options.withNormals;
    this.depthTest = true;
    this.depthMask = true;
    this.blending = true;
    if (options.uniforms.diffuseColorMap) {
        //&& options.uniforms.diffuseColorMap.toLowerCase().indexOf(".png")) {

        if (typeof options.uniforms.diffuseColorMap === 'string') {
            var diffuseColorMap = options.uniforms.diffuseColorMap.toLowerCase();
            var extension = _Path2.default.GetExtension(diffuseColorMap);
            if (extension == ".tif" || extension == ".png") {
                this.translucent = true;
            } else if (diffuseColorMap.slice(0, "data:image/png".length) === "data:image/png") {
                this.translucent = true;
            } else if (diffuseColorMap.slice(0, "data:image/tif".length) === "data:image/tif") {
                this.translucent = true;
            }
        } else if (diffuseColorMap instanceof HTMLCanvasElement || diffuseColorMap instanceof HTMLVideoElement) {
            this.translucent = true;
        }
        withTexture = true;
        if (!Cesium.defined(this.uniforms.diffuseColorMap.flipY)) {
            this.uniforms.diffuseColorMap.flipY = false;
        }

        if (!this.uniforms.diffuseColorMap.sampler) {
            var sampler = {};

            sampler.magnificationFilter = Cesium.WebGLConstants.LINEAR;
            sampler.minificationFilter = Cesium.WebGLConstants.NEAREST_MIPMAP_LINEAR;
            sampler.wrapS = Cesium.WebGLConstants.REPEAT;
            sampler.wrapT = Cesium.WebGLConstants.REPEAT;
            this.uniforms.diffuseColorMap.sampler = sampler;
        }
    } else {
        withTexture = false;
    }

    var vertexShaderUri = null; // "texture_normals.vert"; 
    var fragmentShaderUri = null; //"texture_normals.frag";
    if (withTexture && withNormals) {
        vertexShaderUri = _ShaderChunk2.default.texture_normals_vert; // "texture_normals.vert"; 
        fragmentShaderUri = _ShaderChunk2.default.texture_normals_frag; //"texture_normals.frag";
    } else if (withTexture && !withNormals) {
        vertexShaderUri = _ShaderChunk2.default.texture_vert; //"texture.vert";
        fragmentShaderUri = _ShaderChunk2.default.texture_frag; // "texture.frag";
    } else if (!withTexture && withNormals) {
        vertexShaderUri = _ShaderChunk2.default.normals_vert; // "normals.vert";
        fragmentShaderUri = _ShaderChunk2.default.normals_frag; //"normals.frag";
    } else {
        vertexShaderUri = _ShaderChunk2.default.none_vert; // "none.vert";
        fragmentShaderUri = _ShaderChunk2.default.none_frag; // "none.frag";
    }
    this.vertexShader = vertexShaderUri;
    this.fragmentShader = fragmentShaderUri;
}
BasicMeshMaterial.prototype = Object.create(_MeshMaterial2.default.prototype);
exports.default = BasicMeshMaterial;

},{"../Util/Path.js":35,"./MeshMaterial.js":9,"./Shaders/ShaderChunk.js":19}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
*帧缓存纹理类，可以将一个mesh渲染到帧缓存并作为纹理提供给其他mesh。<br/>
*需要配合{@link Cesium.MeshVisualizer}、{@link Cesium.Mesh}、{@link Cesium.MeshMaterial}使用。
*@param {Cesium.Mesh}mesh 
*
*@property {Cesium.Mesh}mesh 
*@property {Cesium.Texture}texture 
*
*@constructor
*@memberof Cesium
*@example
 
    MeshVisualizer = Cesium.MeshVisualizer;
    Mesh = Cesium.Mesh;
    MeshMaterial = Cesium.MeshMaterial; 
    FramebufferTexture = Cesium.FramebufferTexture; 
    Shaders = VolumeRendering.Shaders; 

    var center2 = Cesium.Cartesian3.fromDegrees(homePosition[0]+3.5, homePosition[1] , 50000);
    var modelMatrix2 = Cesium.Transforms.eastNorthUpToFixedFrame(center2);

    var meshVisualizer = new MeshVisualizer({
        modelMatrix: modelMatrix2,
        up: { y: 1 },
        scale: new Cesium.Cartesian3(2,2,2)
    });
    viewer.scene.primitives.add(meshVisualizer);

    var guiControls = new function () {
        this.model = 'bonsai';
        this.steps = 256.0;
        this.alphaCorrection = 1.0;
        this.color1 = "#00FA58";
        this.stepPos1 = 0.1;
        this.color2 = "#CC6600";
        this.stepPos2 = 0.7;
        this.color3 = "#F2F200";
        this.stepPos3 = 1.0;
    };
    function updateTransferFunction() {
        var canvas = document.createElement('canvas');
        canvas.height = 20;
        canvas.width = 256;

        var ctx = canvas.getContext('2d');

        var grd = ctx.createLinearGradient(0, 0, canvas.width - 1, canvas.height - 1);
        grd.addColorStop(guiControls.stepPos1, guiControls.color1);
        grd.addColorStop(guiControls.stepPos2, guiControls.color2);
        grd.addColorStop(guiControls.stepPos3, guiControls.color3);

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width - 1, canvas.height - 1);

        return canvas;
    }

    var dimensions = new Cesium.Cartesian3(50000, 50000, 50000);
    var boxGeometry = Cesium.BoxGeometry.createGeometry(Cesium.BoxGeometry.fromDimensions({
        dimensions: dimensions,
        vertexFormat: Cesium.VertexFormat.POSITION_ONLY
    }));

    var materialFirstPass = new MeshMaterial({
        vertexShader: Shaders.vertexShaderFirstPass,
        fragmentShader: Shaders.fragmentShaderFirstPass,
        side: MeshMaterial.Sides.BACK,
        uniforms: {
            dimensions: dimensions
        }
    });
    var meshFirstPass = new Mesh(boxGeometry, materialFirstPass);
    var rtTexture = new FramebufferTexture(meshFirstPass);//这里使用FramebufferTexture
    var transferTexture = updateTransferFunction();
    var materialSecondPass = new MeshMaterial({
        vertexShader: Shaders.vertexShaderSecondPass,
        fragmentShader: Shaders.fragmentShaderSecondPass,
        side: MeshMaterial.Sides.FRONT,
        uniforms: {
            alpha: 1,
            dimensions: dimensions,
            tex: rtTexture,
            cubeTex: "./teapot.raw.png",
            transferTex: transferTexture,
            steps: guiControls.steps,
            alphaCorrection: guiControls.alphaCorrection
        }
    });

    var meshSecondPass = new Mesh(boxGeometry, materialSecondPass);
    meshVisualizer.add(meshSecondPass);
*/
function FramebufferTexture(mesh, renderTarget, depthTexture) {
    this.mesh = mesh;

    this.texture = renderTarget;
    this.depthTexture = depthTexture;
    this.framebuffer = null;
    this.ready = false;
    this.readyPromise = Cesium.when.defer();
    if (renderTarget && renderTarget instanceof Cesium.Framebuffer) {
        this.framebuffer = renderTarget;
        this.texture = this.framebuffer._colorTextures[0];
        this.depthTexture = this.framebuffer._depthTexture;
        this.ready = true;
        this.readyPromise.resolve(true);
    } else {
        this.destroyAttachments = true;
    }
}
/**
 * 
 */
FramebufferTexture.prototype.destroy = function () {
    if (this.destroyAttachments) {
        if (this.texture) {
            this.texture.destroy();
            delete this.texture;
        }
        if (this.depthTexture) {
            this.depthTexture.destroy();
            delete this.depthTexture;
        }

        if (this.framebuffer) {
            this.framebuffer.destroy();
            delete this.framebuffer;
        }

        if (this.mesh) {
            this.mesh.destroy();
            delete this.mesh;
        }
    }
};

exports.default = FramebufferTexture;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _CSG = require("../Util/CSG.js");

var _CSG2 = _interopRequireDefault(_CSG);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
*
*@constructor
*@memberof Cesium
*/
function GeometryUtils() {}

function getAttrs(geo) {
    var attrNames = [];

    for (var name in geo.attributes) {
        if (geo.attributes.hasOwnProperty(name) && geo.attributes[name]) {
            attrNames.push(name);
        }
    }
    return attrNames;
}

var scratchPosition; //= new Cesium.Cartesian3();
var scratchMatrix4; //= new Cesium.Matrix4();
var scratchRotation; //= new Cesium.Matrix3();
var scratchOffset; //= new Cesium.Cartesian3();

var constantsHasInit = false;
function initConstants() {
    if (constantsHasInit) return;
    constantsHasInit = true;

    scratchPosition = new Cesium.Cartesian3();
    scratchMatrix4 = new Cesium.Matrix4();
    scratchRotation = new Cesium.Matrix3();
    scratchOffset = new Cesium.Cartesian3();
}
/**
*绕x轴旋转，修改顶点坐标
*@param {Cesium.Geometry}geometry
*@param {Number}angle 弧度
*/
GeometryUtils.rotateX = function (geometry, angle) {
    initConstants();

    var positions = geometry.attributes.position.values;

    Cesium.Matrix3.fromRotationX(angle, scratchRotation);
    Cesium.Matrix4.fromRotationTranslation(scratchRotation, Cesium.Cartesian3.ZERO, scratchMatrix4);

    for (var i = 0; i < positions.length; i += 3) {
        scratchPosition.x = positions[i];
        scratchPosition.y = positions[i + 1];
        scratchPosition.z = positions[i + 2];
        Cesium.Matrix4.multiplyByPoint(scratchMatrix4, scratchPosition, scratchPosition);
        positions[i] = scratchPosition.x;
        positions[i + 1] = scratchPosition.y;
        positions[i + 2] = scratchPosition.z;
    }
};
/**
*绕y轴旋转，修改顶点坐标
*@param {Cesium.Geometry}geometry
*@param {Number}angle 弧度
*/
GeometryUtils.rotateY = function (geometry, angle) {
    initConstants();

    var positions = geometry.attributes.position.values;

    Cesium.Matrix3.fromRotationY(angle, scratchRotation);
    Cesium.Matrix4.fromRotationTranslation(scratchRotation, Cesium.Cartesian3.ZERO, scratchMatrix4);

    for (var i = 0; i < positions.length; i += 3) {
        scratchPosition.x = positions[i];
        scratchPosition.y = positions[i + 1];
        scratchPosition.z = positions[i + 2];
        Cesium.Matrix4.multiplyByPoint(scratchMatrix4, scratchPosition, scratchPosition);
        positions[i] = scratchPosition.x;
        positions[i + 1] = scratchPosition.y;
        positions[i + 2] = scratchPosition.z;
    }
};

/**
*绕z轴旋转，修改顶点坐标
*@param {Cesium.Geometry}geometry
*@param {Number}angle 弧度
*/
GeometryUtils.rotateZ = function (geometry, angle) {
    initConstants();

    var positions = geometry.attributes.position.values;

    Cesium.Matrix3.fromRotationZ(angle, scratchRotation);
    Cesium.Matrix4.fromRotationTranslation(scratchRotation, Cesium.Cartesian3.ZERO, scratchMatrix4);

    for (var i = 0; i < positions.length; i += 3) {
        scratchPosition.x = positions[i];
        scratchPosition.y = positions[i + 1];
        scratchPosition.z = positions[i + 2];
        Cesium.Matrix4.multiplyByPoint(scratchMatrix4, scratchPosition, scratchPosition);
        positions[i] = scratchPosition.x;
        positions[i + 1] = scratchPosition.y;
        positions[i + 2] = scratchPosition.z;
    }
};
/**
*
*@param {Cesium.Geometry}geometry
*/
GeometryUtils.computeVertexNormals = function (geometry) {

    var indices = geometry.indices;
    var attributes = geometry.attributes;
    var il = indices.length;
    if (attributes.position) {

        var positions = attributes.position.values;

        if (attributes.normal === undefined) {
            attributes.normal = new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: new Float32Array(positions.length)
            });
        } else {

            // reset existing normals to zero

            var array = attributes.normal.values;

            for (var i = 0; i < il; i++) {

                array[i] = 0;
            }
        }

        var normals = attributes.normal.values;

        var vA, vB, vC;

        var pA = new Cesium.Cartesian3(),
            pB = new Cesium.Cartesian3(),
            pC = new Cesium.Cartesian3();
        var cb = new Cesium.Cartesian3(),
            ab = new Cesium.Cartesian3();

        for (var i = 0; i < il; i += 3) {

            vA = indices[i + 0] * 3;
            vB = indices[i + 1] * 3;
            vC = indices[i + 2] * 3;

            Cesium.Cartesian3.fromArray(positions, vA, pA);
            Cesium.Cartesian3.fromArray(positions, vB, pB);
            Cesium.Cartesian3.fromArray(positions, vC, pC);

            Cesium.Cartesian3.subtract(pC, pB, cb);
            Cesium.Cartesian3.subtract(pA, pB, ab);
            Cesium.Cartesian3.cross(cb, ab, cb);

            normals[vA] += cb.x;
            normals[vA + 1] += cb.y;
            normals[vA + 2] += cb.z;

            normals[vB] += cb.x;
            normals[vB + 1] += cb.y;
            normals[vB + 2] += cb.z;

            normals[vC] += cb.x;
            normals[vC + 1] += cb.y;
            normals[vC + 2] += cb.z;
        }

        normalizeNormals(geometry);

        attributes.normal.needsUpdate = true;
    }

    return geometry;
};
function normalizeNormals(geometry) {

    var normals = geometry.attributes.normal.values;

    var x, y, z, n;

    for (var i = 0; i < normals.length; i += 3) {

        x = normals[i];
        y = normals[i + 1];
        z = normals[i + 2];

        n = 1.0 / Math.sqrt(x * x + y * y + z * z);

        normals[i] = x * n;
        normals[i + 1] = y * n;
        normals[i + 2] = z * n;
    }
}

/**
*合并两个或两个以上图形类型（primitiveType），属性数量、名称以及属性值的类型（GeometryAttribute的componentDatatype、componentsPerAttribute等）都一致的几何体
*@param {Array<Cesium.Geometry>}geometries 
*@return {Cesium.Geometry}
*/
GeometryUtils.mergeGeometries = function (geometries) {
    if (!geometries || !geometries.length) {
        throw new Error("缺少geometries参数");
    }

    if (geometries.length == 1) {
        return geometries[0];
    }
    var geometriesAttrs = [];

    var lengthChanged = false;
    var primitiveTypeChanged = false;
    var primitiveType = geometries[0].primitiveType;
    for (var i = 0; i < geometries.length; i++) {

        geometriesAttrs[i] = getAttrs(geometries[i]);
        if (i > 0) {
            if (primitiveType != geometries[i].primitiveType) {
                primitiveTypeChanged = true;
                break;
            }
            var lastGeoAttrs = geometriesAttrs[i - 1];
            lengthChanged = lastGeoAttrs.length != geometriesAttrs[i].length;
            if (!lengthChanged) {

                for (var j = 0; j < lastGeoAttrs.length; j++) {
                    if (lastGeoAttrs[j] != geometriesAttrs[i][j]) {
                        lengthChanged = true;
                        break;
                    }
                }
            }
        }
        primitiveType = geometries[i].primitiveType;
        if (lengthChanged || primitiveTypeChanged) {
            break;
        }
    }
    if (primitiveTypeChanged) {
        throw new Error("待合并的几何体中primitiveType属性不完全一致");
    }
    if (lengthChanged) {
        throw new Error("待合并的几何体中属性数量和和名称不完全一致");
    }
    return mergeGeometries(geometries);

    var newAttrs = {};
    var attrNames = geometriesAttrs[0];
    for (var i = 0; i < attrNames.length; i++) {
        var attrName = attrNames[i];
        var geometry = geometries[0];
        newAttrs[attrName] = {};
        //newAttrs[attrName] = Cesium.clone(geometry.attributes[attrName]);
        for (var n in geometry.attributes[attrName]) {
            if (geometry.attributes[attrName].hasOwnProperty(n)) {
                newAttrs[attrName][n] = geometry.attributes[attrName][n];
            }
        }
        var values = Array.from(newAttrs[attrName].values);

        for (var j = 1; j < geometries.length; j++) {
            geometry = geometries[j];
            for (var vi = 0; vi < geometry.attributes[attrName].values.length; vi++) {
                values.push(geometry.attributes[attrName].values[vi]);
            }
        }

        newAttrs[attrName].values = new newAttrs[attrName].values.constructor(values);
    }
    var indices = [];
    var currIndex = 0;
    for (var j = 0; j < geometries.length; j++) {
        var geometry = geometries[0];
        for (var i = 0; i < geometry.indices.length; i++) {
            indices.push(geometry.indices[i] + currIndex);
        }
        currIndex += geometry.attributes.position.values.length / 3;
    }

    var bs = Cesium.BoundingSphere.fromVertices(newAttrs.position.values);
    var geo = new Cesium.Geometry({
        attributes: newAttrs,
        indices: new Uint32Array(indices),
        primitiveType: geometries[0].primitiveType,
        boundingSphere: bs
    });
    return geo;
};

function mergeGeometries(geometries) {
    if (geometries.length == 1) return geometries[0];
    var attrNames = [];
    var valueArrs = [];
    var valueTypes = [];
    var valueConstructors = [];
    var valueComponents = [];
    var valueNormalizes = [];
    var valueOffsets = [];
    var indices = [];
    var primitiveType;
    var indexOffst = 0;

    var componentCounts = [];

    var geometry = geometries[0];
    primitiveType = geometry.primitiveType;
    for (var _attrName in geometry.attributes) {
        if (geometry.attributes.hasOwnProperty(_attrName) && geometry.attributes[_attrName]) {
            var attr = geometry.attributes[_attrName];
            attrNames.push(_attrName);

            // valueArrs.push([]);

            valueComponents.push(attr.componentsPerAttribute);
            valueTypes.push(attr.componentDatatype);
            valueConstructors.push(attr.values.constructor);
            valueNormalizes.push(attr.normalize);

            componentCounts.push(0);
            valueOffsets.push(0);
        }
    }
    for (var i = 0; i < geometries.length; i++) {
        var _geometry = geometries[i];
        for (var j = 0; j < attrNames.length; j++) {
            var _attrName2 = attrNames[j];
            componentCounts[j] += _geometry.attributes[_attrName2].values.length;
        }
    }

    for (var _j = 0; _j < attrNames.length; _j++) {
        valueArrs.push(new valueConstructors[_j](componentCounts[_j]));
    }

    for (var _i = 0; _i < geometries.length; _i++) {
        var _geometry2 = geometries[_i];
        for (var ai = 0; ai < attrNames.length; ai++) {
            var attrName = attrNames[ai];
            var valueArr = valueArrs[ai];
            var attrValues = _geometry2.attributes[attrName].values;
            valueArr.set(attrValues, valueOffsets[ai]);
            valueOffsets[ai] += attrValues.length;
        }

        for (var _j2 = 0; _j2 < _geometry2.indices.length; _j2++) {
            var index = _geometry2.indices[_j2];
            indices.push(index + indexOffst);
        }

        indexOffst += _geometry2.attributes.position.values.length / 3;
    }

    var attributes = {};
    for (var _i2 = 0; _i2 < attrNames.length; _i2++) {
        var _attrName3 = attrNames[_i2];
        attributes[_attrName3] = {
            values: valueArrs[_i2],
            componentsPerAttribute: valueComponents[_i2],
            componentDatatype: valueTypes[_i2],
            normalize: valueNormalizes[_i2]
        };
    }

    var vertexCount = valueArrs[0] / valueComponents[0];
    if (vertexCount < 65535) {
        indices = new Uint16Array(indices);
    } else {
        indices = new Uint32Array(indices);
    }

    geometry = new Cesium.Geometry({
        attributes: attributes,
        indices: indices,
        primitiveType: primitiveType
    });
    return geometry;
}

/**
*
*@param {Cesium.Geometry}geometry
*@param {Cesium.Cartesian3}offset
*/
GeometryUtils.translate = function (geometry, offset) {
    initConstants();
    if (Array.isArray(offset)) {
        scratchOffset.x = offset[0];
        scratchOffset.y = offset[1];
        scratchOffset.z = offset[2];
    } else {
        Cesium.Cartesian3.clone(offset, scratchOffset);
    }

    for (var i = 0; i < geometry.attributes.position.values.length; i += 3) {
        geometry.attributes.position.values[i] += scratchOffset.x;
        geometry.attributes.position.values[i + 1] += scratchOffset.y;
        geometry.attributes.position.values[i + 2] += scratchOffset.z;
    }
    //if (geometry.attributes.normal) {
    //    Cesium.GeometryPipeline.computeNormal(geometry);
    //}
};

/**
*
*@param {TypeArray} array
*@return {Cesium.ComponentDatatype}  
*/
GeometryUtils.getAttributeComponentType = function (array) {

    var attributeComponentType = Cesium.ComponentDatatype.SHORT;
    if (array instanceof Int8Array) {
        attributeComponentType = Cesium.ComponentDatatype.BYTE;
    } else if (array instanceof Uint8Array || array instanceof Uint8ClampedArray) {
        attributeComponentType = Cesium.ComponentDatatype.UNSIGNED_BYTE;
    } else if (array instanceof Int16Array) {
        attributeComponentType = Cesium.ComponentDatatype.SHORT;
    } else if (array instanceof Uint16Array) {
        attributeComponentType = Cesium.ComponentDatatype.UNSIGNED_SHORT;
    } else if (array instanceof Int32Array) {
        attributeComponentType = Cesium.ComponentDatatype.INT;
    } else if (array instanceof Uint32Array) {
        attributeComponentType = Cesium.ComponentDatatype.UNSIGNED_INT;
    } else if (array instanceof Float32Array) {
        attributeComponentType = Cesium.ComponentDatatype.FLOAT;
    } else if (array instanceof Float64Array) {
        attributeComponentType = Cesium.ComponentDatatype.DOUBLE;
    }

    return attributeComponentType;
};

/**
*
*@param {Object}geometry
*@return {Boolean}
*/
GeometryUtils.isGeometry3js = function (geometry) {
    return typeof THREE !== 'undefined' && (geometry instanceof THREE.Geometry || geometry instanceof THREE.BufferGeometry) || geometry.attributes && geometry.attributes.position && geometry.index || geometry.vertices && geometry.faces;
};

/**
 *
 *@param {THREE.BufferGeometry}geometry 
 *@private
 */
GeometryUtils.parseBufferGeometry3js = function (geometry) {
    // var start = new Date();

    var attributes = {};
    if (!geometry.attributes.normal) {
        geometry.computeFaceNormals();
    }
    for (var attrName in geometry.attributes) {

        if (geometry.attributes.hasOwnProperty(attrName)) {
            var attr = geometry.getAttribute(attrName);
            if (attr && attr.array.length > 0) {

                attributes[attrName] = new Cesium.GeometryAttribute({
                    componentDatatype: GeometryUtils.getAttributeComponentType(attr.array),
                    componentsPerAttribute: attr.itemSize,
                    values: attr.array,
                    normalize: attr.normalized
                });
            }
        }
    }
    var indices = [];
    if (!geometry.index && geometry.groups) {
        geometry.groups.forEach(function (group) {
            for (var i = 0; i < group.count; i++) {
                indices.push(i + group.start);
            }
        });
        indices = new Int32Array(indices);
    } else {
        indices = geometry.index.array;
    }
    var cesGeometry = new Cesium.Geometry({
        attributes: attributes,
        indices: indices,
        primitiveType: Cesium.PrimitiveType.TRIANGLES
    });

    return cesGeometry;
};

/**
*
*@param {THREE.Geometry}geometry3js
*@return {Cesium.Geometry} 
*/
GeometryUtils.fromGeometry3js = function (geometry3js) {

    if (geometry3js.attributes && (geometry3js.index || geometry3js.groups.length)) {} else {
        geometry3js = new THREE.BufferGeometry().fromGeometry(geometry3js);
    }
    var geometry = GeometryUtils.parseBufferGeometry3js(geometry3js);
    //GeometryUtils.computeVertexNormals(geometry);
    Cesium.GeometryPipeline.computeNormal(geometry);
    return geometry;
    var positions = new Float32Array(geometry3js.vertices.length * 3);
    for (var i = 0; i < geometry3js.vertices.length; i++) {
        positions[i * 3] = geometry3js.vertices[i].x;
        if (!geometry3js.up || geometry3js.up.y) {
            positions[i * 3 + 1] = geometry3js.vertices[i].z;
            positions[i * 3 + 2] = geometry3js.vertices[i].y;
        } else {
            positions[i * 3 + 1] = geometry3js.vertices[i].y;
            positions[i * 3 + 2] = geometry3js.vertices[i].z;
        }
    }
    var indices = new Int32Array(geometry3js.faces.length * 3);
    for (var i = 0; i < geometry3js.faces.length; i++) {
        indices[i * 3] = geometry3js.faces[i].a;
        indices[i * 3 + 1] = geometry3js.faces[i].b;
        indices[i * 3 + 2] = geometry3js.faces[i].c;
    }
    var attributes = {};
    attributes.position = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: positions
    });
    var cesGeometry = new Cesium.Geometry({
        attributes: attributes,
        indices: indices,
        primitiveType: Cesium.PrimitiveType.TRIANGLES
    });
    return cesGeometry;
};
/**
*
*@param {Cesium.Geometry}geometry
*@return {THREE.Geometry} 
*/
GeometryUtils.toGeometry3js = function (geometry) {
    if (typeof THREE === 'undefined') {
        throw new Error("THREE 未加载");
    }

    var positions = geometry.attributes.position.values;
    var positionIdx = 0;

    var geometry3js = new THREE.Geometry();

    for (var i = 0; i < positions.length; i += 3) {
        positionIdx = i * 3;
        geometry3js.vertices.push(new THREE.Vector3(positions[positionIdx], positions[positionIdx + 2], positions[positionIdx + 1]));
    }

    for (var i = 0; i < geometry.indices.length; i += 3) {
        var idx1 = geometry.indices[i];
        var idx2 = geometry.indices[i + 1];
        var idx3 = geometry.indices[i + 2];
        geometry3js.faces.push(new THREE.Face3(idx1, idx2, idx3));
    }

    return geometry3js;
};

/**
*@param {Cesium.Geometry|THREE.Geometry}geometry
*@param {Cesium.Cartesian3}[offset]
*@return {CSG}
*/
GeometryUtils.toCSG = function (geometry, offset) {
    if (!(typeof THREE === 'undefined')) {
        if (geometry instanceof THREE.Geometry) {
            return GeometryUtils._toCSG3js(geometry, offset);
        }
    }
    if (!offset) {
        offset = { x: 0, y: 0, z: 0 };
    }
    if (!geometry.attributes.normal) {
        geometry = Cesium.GeometryPipeline.computeNormal(geometry);
    }
    if (geometry.primitiveType !== Cesium.PrimitiveType.TRIANGLES) {
        throw new Error("暂不支持此类几何体");
    }
    if (!_CSG2.default) {
        throw new Error('CSG 库未加载。请从 https://github.com/evanw/csg.js 获取');
    }
    var faceCount = geometry.indices.length / 3;
    var polygons = [],
        vertices = [];
    var positions = geometry.attributes.position.values;
    var normals = geometry.attributes.normal.values;
    var normalIdx = 0,
        positionIdx = 0;

    for (var i = 0; i < geometry.indices.length; i += 3) {
        vertices = [];

        var idx1 = geometry.indices[i];
        var idx2 = geometry.indices[i + 1];
        var idx3 = geometry.indices[i + 2];

        positionIdx = idx1 * 3;
        normalIdx = idx1 * 3;

        vertices.push(new _CSG2.default.Vertex([positions[positionIdx++] + offset.x, positions[positionIdx++] + offset.y, positions[positionIdx++] + offset.z], [normals[normalIdx++], normals[normalIdx++], normals[normalIdx++]]));

        positionIdx = idx2 * 3;
        normalIdx = idx2 * 3;
        vertices.push(new _CSG2.default.Vertex([positions[positionIdx++] + offset.x, positions[positionIdx++] + offset.y, positions[positionIdx++] + offset.z], [normals[normalIdx++], normals[normalIdx++], normals[normalIdx++]]));

        positionIdx = idx3 * 3;
        normalIdx = idx3 * 3;
        vertices.push(new _CSG2.default.Vertex([positions[positionIdx++] + offset.x, positions[positionIdx++] + offset.y, positions[positionIdx++] + offset.z], [normals[normalIdx++], normals[normalIdx++], normals[normalIdx++]]));
        polygons.push(new _CSG2.default.Polygon(vertices));
    }
    return _CSG2.default.fromPolygons(polygons);
};
/**
*@param {CSG}csg_model
*@param {Boolean}[toGeometry3js=false]
*@return {Cesium.Geometry|THREE.Geometry}
*/
GeometryUtils.fromCSG = function (csg_model, toGeometry3js) {
    if (!(typeof THREE === 'undefined')) {
        if (geometry instanceof THREE.Geometry) {
            return GeometryUtils._fromCSG3js(geometry, offset);
        }
    }
    var i,
        j,
        vertices,
        polygons = csg_model.toPolygons();

    if (!_CSG2.default) {
        throw new Error('CSG 库未加载。请从 https://github.com/evanw/csg.js 获取');
    }

    var positions = [];
    var normals = [];
    var indices = [];

    for (i = 0; i < polygons.length; i++) {

        // Vertices
        vertices = [];
        for (j = 0; j < polygons[i].vertices.length; j++) {
            vertices.push(this.getGeometryVertice(positions, normals, polygons[i].vertices[j].pos, polygons[i].plane.normal));
        }
        if (vertices[0] === vertices[vertices.length - 1]) {
            vertices.pop();
        }

        for (var j = 2; j < vertices.length; j++) {
            indices.push(vertices[0], vertices[j - 1], vertices[j]);
        }
    }

    positions = new Float32Array(positions);
    normals = new Float32Array(normals);

    indices = new Int32Array(indices);
    var attributes = {};
    attributes.position = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: positions
    });
    attributes.normal = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: normals
    });

    var cesGeometry = new Cesium.Geometry({
        attributes: attributes,
        indices: indices,
        primitiveType: Cesium.PrimitiveType.TRIANGLES
    });

    return cesGeometry;
};

GeometryUtils._toCSG3js = function (three_model, offset, rotation) {
    if (typeof THREE === 'undefined') {
        throw new Error("THREE 未加载");
    }

    var i, geometry, polygons, vertices, rotation_matrix;

    if (!_CSG2.default) {
        throw 'CSG library not loaded. Please get a copy from https://github.com/evanw/csg.js';
    }

    if (three_model instanceof THREE.Mesh) {
        geometry = three_model.geometry;
        offset = offset || three_model.position;
        rotation = rotation || three_model.rotation;
    } else if (three_model instanceof THREE.Geometry) {
        geometry = three_model;
        offset = offset || new THREE.Vector3(0, 0, 0);
        rotation = rotation || new THREE.Euler(0, 0, 0);
    } else {
        throw 'Model type not supported.';
    }
    rotation_matrix = new THREE.Matrix4().makeRotationFromEuler(rotation);

    var polygons = [];
    for (i = 0; i < geometry.faces.length; i++) {
        if (geometry.faces[i] instanceof THREE.Face3) {

            vertices = [];
            vertices.push(new _CSG2.default.Vertex(geometry.vertices[geometry.faces[i].a].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
            vertices.push(new _CSG2.default.Vertex(geometry.vertices[geometry.faces[i].b].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
            vertices.push(new _CSG2.default.Vertex(geometry.vertices[geometry.faces[i].c].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
            polygons.push(new _CSG2.default.Polygon(vertices));
        } else if (geometry.faces[i] instanceof THREE.Face4) {

            vertices = [];
            vertices.push(new _CSG2.default.Vertex(geometry.vertices[geometry.faces[i].a].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
            vertices.push(new _CSG2.default.Vertex(geometry.vertices[geometry.faces[i].b].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
            vertices.push(new _CSG2.default.Vertex(geometry.vertices[geometry.faces[i].d].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
            polygons.push(new _CSG2.default.Polygon(vertices));

            vertices = [];
            vertices.push(new _CSG2.default.Vertex(geometry.vertices[geometry.faces[i].b].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
            vertices.push(new _CSG2.default.Vertex(geometry.vertices[geometry.faces[i].c].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
            vertices.push(new _CSG2.default.Vertex(geometry.vertices[geometry.faces[i].d].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
            polygons.push(new _CSG2.default.Polygon(vertices));
        } else {
            throw 'Model contains unsupported face.';
        }
    }

    return _CSG2.default.fromPolygons(polygons);
};

GeometryUtils._fromCSG3js = function (csg_model) {
    if (typeof THREE === 'undefined') {
        throw new Error("THREE 未加载");
    }
    var i,
        j,
        vertices,
        face,
        three_geometry = new THREE.Geometry(),
        polygons = csg_model.toPolygons();

    if (!_CSG2.default) {
        throw 'CSG library not loaded. Please get a copy from https://github.com/evanw/csg.js';
    }

    for (i = 0; i < polygons.length; i++) {

        // Vertices
        vertices = [];
        for (j = 0; j < polygons[i].vertices.length; j++) {
            vertices.push(GeometryUtils._getGeometryVertice3js(three_geometry, polygons[i].vertices[j].pos));
        }
        if (vertices[0] === vertices[vertices.length - 1]) {
            vertices.pop();
        }

        for (var j = 2; j < vertices.length; j++) {
            face = new THREE.Face3(vertices[0], vertices[j - 1], vertices[j], new THREE.Vector3().copy(polygons[i].plane.normal));
            three_geometry.faces.push(face);
            three_geometry.faceVertexUvs[0].push(new THREE.Vector2());
        }
    }

    three_geometry.computeBoundingBox();

    return three_geometry;
};

GeometryUtils._getGeometryVertice3js = function (geometry, vertice_position) {
    var i;
    for (i = 0; i < geometry.vertices.length; i++) {
        if (geometry.vertices[i].x === vertice_position.x && geometry.vertices[i].y === vertice_position.y && geometry.vertices[i].z === vertice_position.z) {
            // Vertice already exists
            return i;
        }
    };

    geometry.vertices.push(new THREE.Vector3(vertice_position.x, vertice_position.y, vertice_position.z));
    return geometry.vertices.length - 1;
};

exports.default = GeometryUtils;

},{"../Util/CSG.js":34}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Rotation = require('./Rotation.js');

var _Rotation2 = _interopRequireDefault(_Rotation);

var _RendererUtils = require('./RendererUtils.js');

var _RendererUtils2 = _interopRequireDefault(_RendererUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
*
*@param {Object|geometry}options   
*@param {Boolean}[options.show=true]  
*@param {Cesium.Cartesian3}[options.position]
*@param {Cesium.Rotation}[options.rotation]
*@param {Cesium.Cartesian3}[options.scale]    
* 
*@property {Boolean}show  
*@property {Cesium.Cartesian3}position
*@property {Cesium.Rotation}rotation
*@property {Cesium.Cartesian3}scale   
*@property {Boolean}needUpdate
*
*@constructor
*@memberof Cesium
*@example
    
    MeshVisualizer = Cesium.MeshVisualizer;
    Mesh = Cesium.Mesh;
    MeshMaterial = Cesium.MeshMaterial; 
    LOD = Cesium.LOD;

    var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 50000);
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

    var meshVisualizer = new MeshVisualizer({
        modelMatrix: modelMatrix,
        up: { z: 1 }
    });
    viewer.scene.primitives.add(meshVisualizer);


    var material = new MeshMaterial({
        defaultColor: "rgba(200,0,0,1.0)",
        wireframe: true,
        side: MeshMaterial.Sides.FRONT
    });
    var radius = 20000;
    var sphereL0 = Cesium.SphereGeometry.createGeometry(new Cesium.SphereGeometry({
        radius: radius,
        vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
        stackPartitions:4,
        slicePartitions: 4
    }));
    var sphereL1 = Cesium.SphereGeometry.createGeometry(new Cesium.SphereGeometry({
        radius: radius,
        vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
        stackPartitions: 8,
        slicePartitions: 8
    }));
    var sphereL2 = Cesium.SphereGeometry.createGeometry(new Cesium.SphereGeometry({
        radius: radius,
        vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
        stackPartitions: 16,
        slicePartitions: 16
    }));
    var sphereL3 = Cesium.SphereGeometry.createGeometry(new Cesium.SphereGeometry({
        radius: radius,
        vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
        stackPartitions: 32,
        slicePartitions: 32
    }));
    var sphereL4 = Cesium.SphereGeometry.createGeometry(new Cesium.SphereGeometry({
        radius: radius,
        vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
        stackPartitions: 64,
        slicePartitions: 64
    }));

    var geometries = [
                [sphereL4, 5],
                [sphereL3, 200],
                [sphereL2, 300],
                [sphereL1, 500],
                [sphereL0, 2000]
    ];

    var maxAvailableDistance = 10000000;

    var i, j, mesh, lod;
    var scale = new Cesium.Cartesian3(1, 1, 1);
    for (j = 0; j < 1000; j++) {

        lod = new LOD();

        for (i = 0; i < geometries.length; i++) {

            mesh = new Mesh(geometries[i][0], material);
            mesh.scale = scale;

            lod.addLevel(mesh, geometries[i][1] * 1000);
        }
        lod.maxAvailableDistance = maxAvailableDistance;
        lod.position.x = 1500000 * (0.5 - Math.random());
        lod.position.y = 1750000 * (0.5 - Math.random());
        lod.position.z = 130000 * (0.5 - Math.random());

        meshVisualizer.add(lod);

    }
*/
function LOD(options) {

    options = Cesium.defaultValue(options, {});

    this.uuid = Cesium.createGuid();
    this.show = Cesium.defaultValue(options.show, true);
    this.maxAvailableDistance = Cesium.defaultValue(options.maxAvailableDistance, Number.MAX_VALUE);
    this._position = Cesium.defaultValue(options.position, new Cesium.Cartesian3(0, 0, 0));
    this._scale = Cesium.defaultValue(options.scale, new Cesium.Cartesian3(1, 1, 1));
    this._rotation = Cesium.defaultValue(options.rotation, { axis: new Cesium.Cartesian3(0, 0, 1), angle: 0 });
    this._rotation = new _Rotation2.default(this._rotation.axis, this._rotation.angle);
    this._boundingSphere = new Cesium.BoundingSphere();
    this._needsUpdate = false;
    this._modelMatrixNeedsUpdate = true;
    this._modelMatrix = new Cesium.Matrix4();
    Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY, this._modelMatrix);

    this._onNeedUpdateChanged = function () {
        this._modelMatrixNeedsUpdate = true;
    };
    this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged);

    this._children = [];
    this._parent = null;
    this.type = 'LOD';

    Object.defineProperties(this, {
        levels: {
            enumerable: true,
            value: []
        }
    });
}
function removeByValue(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            arr.splice(i, 1);
            break;
        }
    }
}
LOD.prototype = {

    constructor: LOD,
    /**
     *
     *@param {Number}x
     *@param {Number}y
     *@param {Number}z
     */
    setPosition: function setPosition(x, y, z) {
        var changed = false;
        if (arguments.length == 1) {
            if (typeof x == 'number') {
                if (x != this._position.x) changed = true;
                this._position.x = x;
            } else if (x instanceof Cesium.Cartesian3) {
                if (x != this._position.x || y != this._position.y || z != this._position.z) {
                    changed = true;
                }

                this._position.x = x.x;
                this._position.y = x.y;
                this._position.z = x.z;
            }
        }
        if (arguments.length == 2 && typeof y == 'number') {
            if (y != this._position.y) changed = true;
            this._position.y = y;
        }
        if (arguments.length == 3 && typeof z == 'number') {
            if (z != this._position.z) changed = true;
            this._position.z = z;
        }
        if (changed) {
            this._modelMatrixNeedsUpdate = true;
        }
    },
    /**
     *
     *@param {Number}x
     *@param {Number}y
     *@param {Number}z
     */
    setScale: function setScale(x, y, z) {
        var changed = false;
        if (arguments.length == 1) {
            if (typeof x == 'number') {
                if (x != this._scale.x) changed = true;
                this._scale.x = x;
            } else if (x instanceof Cesium.Cartesian3) {
                if (x != this._scale.x || y != this._scale.y || z != this._scale.z) {
                    changed = true;
                }

                this._scale.x = x.x;
                this._scale.y = x.y;
                this._scale.z = x.z;
            }
        }
        if (arguments.length == 2 && typeof y == 'number') {
            if (y != this._scale.y) changed = true;
            this._scale.y = y;
        }
        if (arguments.length == 3 && typeof z == 'number') {
            if (z != this._scale.z) changed = true;
            this._scale.z = z;
        }
        if (changed) {
            this._modelMatrixNeedsUpdate = true;
        }
    },

    /**
    *@param {Cesium.Mesh}mesh
    *@param {Number}distance
    */
    addLevel: function addLevel(object, distance) {

        if (distance === undefined) distance = 0;

        distance = Math.abs(distance);

        var levels = this.levels;

        for (var l = 0; l < levels.length; l++) {

            if (distance < levels[l].distance) {

                break;
            }
        }

        levels.splice(l, 0, { distance: distance, object: object });
        object.parent = this;
        this._children.push(object);
        if (this.levels[0].object.geometry) {
            this._boundingSphere.radius = this.levels[0].object.geometry.boundingSphere.radius;
        } else if (this.levels[0].object.boundingSphere) {
            this._boundingSphere.radius = this.levels[0].object.boundingSphere.radius;
        }
    },
    update: function () {

        return function update(parentModelMatrix, frameState) {

            var levels = this.levels;

            if (levels.length > 1) {
                if (this._modelMatrixNeedsUpdate) {

                    _RendererUtils2.default.computeModelMatrix(parentModelMatrix, this.position, this.rotation, this.scale, this.modelMatrix);

                    this._modelMatrixNeedsUpdate = false;
                }

                Cesium.Matrix4.getTranslation(this.modelMatrix, this._boundingSphere.center);

                var bs = this._boundingSphere;
                var distance = Math.max(0.0, Cesium.Cartesian3.distance(bs.center, frameState.camera.positionWC) - bs.radius);

                var show = this.maxAvailableDistance > distance;

                show = show && frameState.cullingVolume.computeVisibility(this._boundingSphere) !== Cesium.Intersect.OUTSIDE;
                levels[0].object.show = show;

                for (var i = 1, l = levels.length; i < l; i++) {

                    if (distance >= levels[i].distance) {

                        levels[i - 1].object.show = false;
                        levels[i].object.show = show;
                    } else {

                        break;
                    }
                }

                for (; i < l; i++) {

                    levels[i].object.show = false;
                }
            }
        };
    }(),
    getObjectForDistance: function getObjectForDistance(distance) {

        var levels = this.levels;

        for (var i = 1, l = levels.length; i < l; i++) {

            if (distance < levels[i].distance) {

                break;
            }
        }

        return levels[i - 1].object;
    }
};

Object.defineProperties(LOD.prototype, {
    modelMatrix: {
        get: function get() {
            return this._modelMatrix;
        }
    },
    parent: {
        get: function get() {
            return this._parent;
        },
        set: function set(val) {
            if (val && (val._children && Array.isArray(val._children) || val.children && Array.isArray(val.children))) {

                if (this._parent && this._parent != val) {
                    var children = this._parent._children ? this._parent._children : this._parent.children;
                    if (Array.isArray(children)) {
                        removeByValue(children, this);
                    }
                }
                this._parent = val;
                if (typeof this._parent.add === 'function') {
                    this._parent.add(this);
                } else {
                    var children = val._children ? val._children : val.children;
                    children.push(this);
                }
            }
            this._needsUpdate = true;
        }
    },
    children: {
        get: function get() {
            return this._children;
        },
        set: function set(val) {
            this._children = val;
            this._needsUpdate = true;
        }
    },
    needsUpdate: {
        get: function get() {
            return this._needsUpdate;
        },
        set: function set(val) {
            this._needsUpdate = val;
        }
    },
    rotation: {
        get: function get() {
            return this._rotation;
        },
        set: function set(val) {
            if (val != this._rotation) {
                this._rotation = val;
                this._needUpdate = true;
            }
            this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged);
            this._rotation = val;
            this._rotation.paramChanged.addEventListener(this._onNeedUpdateChanged);
        }
    },
    position: {
        get: function get() {
            return this._position;
        },
        set: function set(val) {
            if (val.x != this._position.x || val.y != this._position.y || val.z != this._position.z) {
                this._position = val;
                this._needsUpdate = true;
            }
            this._position = val;
        }
    },
    scale: {
        get: function get() {
            return this._scale;
        },
        set: function set(val) {
            if (val.x != this._scale.x || val.y != this._scale.y || val.z != this._scale.z) {
                this._scale = val;
                this._needsUpdate = true;
            }
            this._scale = val;
        }
    }
});

exports.default = LOD;

},{"./RendererUtils.js":16,"./Rotation.js":17}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _MeshMaterial = require('./MeshMaterial.js');

var _MeshMaterial2 = _interopRequireDefault(_MeshMaterial);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function MaterialUtils() {}

/**
*
*@param {THREE.Material}material3js
*@return {Cesium.MeshMaterial}
*/
MaterialUtils.fromMaterial3js = function (material3js) {
    if (typeof THREE == 'undefined') {
        throw new Error('Three.js is required.');
    }
    var shaderID = shaderIDs[material3js.type];
    material3js["is" + material3js.type] = true;
    var shader = THREE.ShaderLib[shaderID];

    if (!shader) {
        shader = material3js;
    }

    var material = new _MeshMaterial2.default({
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        uniforms: cloneUniforms(shader.uniforms)
    });

    material.material3js = material3js;
    MaterialUtils.updateMaterialFrom3js(material);
    return material;
};

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
    if (material.isMeshBasicMaterial || material.isMeshLambertMaterial || material.isMeshPhongMaterial || material.isMeshStandardMaterial || material.isMeshNormalMaterial || material.isMeshDepthMaterial) {

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
};

/**
 *
 *@param {Object}material3js
 *@return {Boolean}
 */
MaterialUtils.isMaterial3js = function (material3js) {
    return typeof THREE !== 'undefined' && material3js instanceof THREE.Material;
};
// Uniforms (refresh bindUniformValue(uniforms objects)

function refreshUniformsCommon(uniforms, material) {

    bindUniformValue(uniforms.opacity, material.opacity);

    bindUniformValue(uniforms.diffuse, material.color);

    if (material.emissive) {
        var val3js = new material.emissive.constructor().copy(material.emissive).multiplyScalar(material.emissiveIntensity);
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

    var uvScaleMap;

    if (material.map) {

        uvScaleMap = material.map;
    } else if (material.specularMap) {

        uvScaleMap = material.specularMap;
    } else if (material.displacementMap) {

        uvScaleMap = material.displacementMap;
    } else if (material.normalMap) {

        uvScaleMap = material.normalMap;
    } else if (material.bumpMap) {

        uvScaleMap = material.bumpMap;
    } else if (material.roughnessMap) {

        uvScaleMap = material.roughnessMap;
    } else if (material.metalnessMap) {

        uvScaleMap = material.metalnessMap;
    } else if (material.alphaMap) {

        uvScaleMap = material.alphaMap;
    } else if (material.emissiveMap) {

        uvScaleMap = material.emissiveMap;
    }

    if (uvScaleMap !== undefined) {

        // backwards compatibility
        if (uvScaleMap.isWebGLRenderTarget) {

            uvScaleMap = uvScaleMap.texture;
        }

        var offset = uvScaleMap.offset;
        var repeat = uvScaleMap.repeat;

        bindUniformValue(uniforms.offsetRepeat, offset);
    }

    bindUniformValue(uniforms.envMap, material.envMap);

    // don't flip CubeTexture envMaps, flip everything else:
    //  WebGLRenderTargetCube will be flipped for backwards compatibility
    //  WebGLRenderTargetCube.texture will be flipped because it's a Texture and NOT a CubeTexture
    // this check must be handled differently, or removed entirely, if WebGLRenderTargetCube uses a CubeTexture in the future
    bindUniformValue(uniforms.flipEnvMap, !(material.envMap && material.envMap.isCubeTexture) ? 1 : -1);

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

    refreshUniformsStandard(uniforms, material);
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

    var type = typeof val3js === 'undefined' ? 'undefined' : _typeof(val3js);
    if (type === 'undefined') {
        valCesium.value = undefined;
        return;
    }
    if (val3js === null) {
        valCesium.value = null;return;
    }
    if (typeof valCesium.value !== "undefined" && valCesium.value != null && valCesium.value.constructor && valCesium.value.constructor.clone && val3js.constructor == valCesium.value.constructor) {

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

exports.default = MaterialUtils;

},{"./MeshMaterial.js":9}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Rotation = require('./Rotation.js');

var _Rotation2 = _interopRequireDefault(_Rotation);

var _CSG = require('../Util/CSG.js');

var _CSG2 = _interopRequireDefault(_CSG);

var _MeshMaterial = require('./MeshMaterial.js');

var _MeshMaterial2 = _interopRequireDefault(_MeshMaterial);

var _GeometryUtils = require('./GeometryUtils.js');

var _GeometryUtils2 = _interopRequireDefault(_GeometryUtils);

var _MeshPhongMaterial = require('./MeshPhongMaterial.js');

var _MeshPhongMaterial2 = _interopRequireDefault(_MeshPhongMaterial);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
*
*@param {Object|geometry}options 
*@param {Cesium.Geometry|Cesium.CSG|THREE.Geometry|THREE.BufferGeometry}options.geometry  
*@param {Cesium.MeshMaterial}options.material  
*@param {Boolean}[options.show=true]  
*@param {Cesium.Cartesian3}[options.position]
*@param {Cesium.Rotation}[options.rotation]
*@param {Cesium.Cartesian3}[options.scale]   
*@param {{modelMatrix:Cesium.Matrix4,show:boolean}[]}[options.instances]
*@param {Cesium.MeshMaterial}[material]
*@param {{modelMatrix:Cesium.Matrix4,show:boolean}[]}[instances]
*@param {{name:string,default:number|Cesium.Cartesian2|Cesium.Cartesian3|Cesium.Cartesian4|Cesium.Color}[]}[instancedAttributes]
*
*@property {Cesium.Geometry}geometry  
*@property {Cesium.MeshMaterial}material
*@property {Boolean}show  
*@property {Cesium.Cartesian3}position
*@property {Cesium.VolumeRendering.Rotation}rotation
*@property {Cesium.Cartesian3}scale   
*@property {Boolean}needUpdate 
*@property {Cesium.Mesh|Cesium.LOD}parent 
*@property {{modelMatrix:Cesium.Matrix4}[]}instances
*
*@constructor
*@memberof Cesium
*@example
    //1.
    var mesh=new Mesh(geomertry,material);

    //2.
    var mesh2=new Mesh({
        geomertry:geomertry2,
        material:material2,
        position:position2
    });

*/
function Mesh(options) {
    if (Mesh.isGeometrySupported(options)) {
        var geometry = options;

        options = {
            geometry: geometry,
            material: arguments[1],
            instances: arguments[2],
            instancedAttributes: arguments[3]
        };
    }
    if (!options || !options.geometry) {
        throw new Error("geometry是必须参数");
    }
    if (!Mesh.isGeometrySupported(options.geometry)) {
        throw new Error("暂不支持此类型的geometry");
    }

    if (_GeometryUtils2.default.isGeometry3js(options.geometry)) {
        options.geometry = _GeometryUtils2.default.fromGeometry3js(options.geometry);
    } else if (options.geometry instanceof _CSG2.default) {
        if (options.geometry.polygons.length == 0) {
            options.show = false;
        }
        options.geometry = _CSG2.default.fromCSG(options.geometry);
    } else if (typeof options.geometry.constructor.createGeometry == 'function') {
        options.geometry = options.geometry.constructor.createGeometry(options.geometry);
    }

    this.uuid = Cesium.createGuid();
    this.show = Cesium.defaultValue(options.show, true);
    this._geometry = options.geometry;
    this._material = Cesium.defaultValue(options.material, new _MeshMaterial2.default());
    this._position = Cesium.defaultValue(options.position, new Cesium.Cartesian3(0, 0, 0));
    this._scale = Cesium.defaultValue(options.scale, new Cesium.Cartesian3(1, 1, 1));
    this._rotation = Cesium.defaultValue(options.rotation, { axis: new Cesium.Cartesian3(0, 0, 1), angle: 0 });
    this._rotation = new _Rotation2.default(this._rotation.axis, this._rotation.angle);
    this._needsUpdate = false;
    this._modelMatrix = new Cesium.Matrix4();
    Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY, this._modelMatrix);

    //用于设置旋转，优先级大于rotation
    this.quaternion = null;

    this._modelMatrixNeedsUpdate = true;
    this._onNeedUpdateChanged = function () {
        this.modelMatrixNeedsUpdate = true;
    };
    this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged);
    this._drawCommand = null;
    this._children = [];
    this._parent = null;
    this._instances = null;
    this._center = this._position.clone();
    this.instancedAttributes = options.instancedAttributes || [];
    if (options.instances && options.instances.length) {
        this._instances = [];
        options.instances.forEach(function (instance) {
            this.addInstance(instance);
        }, this);
    }

    this.userData = {};

    if (!this._geometry.attributes.normal && this.material instanceof _MeshPhongMaterial2.default && this._geometry.primitiveType == Cesium.PrimitiveType.TRIANGLES) {
        Cesium.GeometryPipeline.computeNormal(this._geometry);
        //GeometryUtils.computeVertexNormals(this._geometry);
    }

    if (this._material && this._material.addReference) {
        this._material.addReference();
    }
}

Mesh.isGeometrySupported = function (geometry) {
    var supported = geometry instanceof Cesium.Geometry || geometry instanceof _CSG2.default || typeof geometry.constructor.createGeometry == 'function' || _GeometryUtils2.default.isGeometry3js(geometry);
    return supported;
};

/**
 * 
 * @param {object}instance
 * @param {Cesium.Matrix4}instance.modelMatrix
 * @param {boolean}[instance.show=true]
 */
Mesh.prototype.addInstance = function (instance) {
    this._instances = this._instances || [];
    instance.show = Cesium.defaultValue(instance.show, true);
    instance.primitive = this;
    instance.boundingSphere = new Cesium.BoundingSphere(new Cesium.Cartesian3(), this.geometry.boundingSphere ? this.geometry.boundingSphere.radius : 0);

    Cesium.Matrix4.getTranslation(instance.modelMatrix, instance.boundingSphere.center);

    instance.id = instance.id || Cesium.createGuid();
    instance.instanceId = this._instances.length;

    this.instancedAttributes.forEach(function (attr) {
        if (!instance[attr.name]) {
            instance[attr.name] = attr.default;
        }
    });

    this._instances.push(instance);

    return instance;
};

/**
*
*@param {Cesium.Mesh|Cesium.LOD}node
*@param {Cesium.Mesh~TraverseCallback}callback
*/
Mesh.traverse = function (node, callback) {
    callback(node);
    if (node.children) {
        node.children.forEach(function (child) {
            callback(child);
        });
    }
};

/**
 *  
 * @callback Cesium.Mesh~TraverseCallback
 * @param {Cesium.Mesh|Cesium.LOD}node
 */

Object.defineProperties(Mesh.prototype, {
    instances: {
        get: function get() {
            return this._instances;
        }
    },
    modelMatrix: {
        get: function get() {
            return this._modelMatrix;
        }
    },
    parent: {
        get: function get() {
            return this._parent;
        },
        set: function set(val) {
            this._parent = val;
            this.modelMatrixNeedsUpdate = true;
        }
    },
    modelMatrixNeedsUpdate: {
        get: function get() {
            return this._modelMatrixNeedsUpdate;
        },
        set: function set(val) {
            this._modelMatrixNeedsUpdate = val;
            if (this._modelMatrixNeedsUpdate) {
                Mesh.traverse(this, function (mesh) {
                    mesh._modelMatrixNeedsUpdate = val;
                });
            }
        }
    },
    children: {
        get: function get() {
            return this._children;
        },
        set: function set(val) {
            this._children = val;
            this._needsUpdate = true;
        }
    },
    geometry: {
        get: function get() {
            return this._geometry;
        },
        set: function set(val) {
            this._geometry = val;
            this._needsUpdate = true;
            this.modelMatrixNeedsUpdate = true;
        }
    },
    material: {
        get: function get() {
            return this._material;
        },
        set: function set(val) {
            this._material = val;
            this._needsUpdate = true;
        }
    },
    needsUpdate: {
        get: function get() {
            return this._needsUpdate;
        },
        set: function set(val) {
            this._needsUpdate = val;
        }
    },
    rotation: {
        get: function get() {
            return this._rotation;
        },
        set: function set(val) {
            if (val != this._rotation) {
                this._rotation = val;
                // this._needUpdate = true;
                this.modelMatrixNeedsUpdate = true;
            }
            this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged);
            this._rotation = val;
            this._rotation.paramChanged.addEventListener(this._onNeedUpdateChanged);
        }
    },
    position: {
        get: function get() {
            return this._position;
        },
        set: function set(val) {
            if (val.x != this._position.x || val.y != this._position.y || val.z != this._position.z) {
                this._position = val;
                //this._needsUpdate = true;
                this.modelMatrixNeedsUpdate = true;
            }
            this._position = val;
        }
    },
    scale: {
        get: function get() {
            return this._scale;
        },
        set: function set(val) {
            if (val.x != this._scale.x || val.y != this._scale.y || val.z != this._scale.z) {
                this._scale = val;
                // this._needsUpdate = true; 
                this.modelMatrixNeedsUpdate = true;
            }
            this._scale = val;
        }
    }
});

/**
*@oaram {Cesium.Mesh|Cesium.LOD}child
*/
Mesh.prototype.add = function (mesh) {

    if (mesh.parent !== this) {
        mesh.parent = this;
    }
    this._children.push(mesh);
};

Mesh.prototype.destroy = function () {
    if (material && material.removeReference) {
        material.removeReference();
    }
};

exports.default = Mesh;

},{"../Util/CSG.js":34,"./GeometryUtils.js":5,"./MeshMaterial.js":9,"./MeshPhongMaterial.js":10,"./Rotation.js":17}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _defineProperty = require('../Util/defineProperty.js');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
*
*@param {Object}options
*@param {Object}[options.uniforms]
*@param {Object}[options.uniformStateUsed]
*@param {Boolean}[options.translucent]
*@param {Boolean}[options.wireframe]
*@param {Enum}[options.side=Cesium.MeshMaterial.Sides.DOUBLE]
*@param {String|Cesium.Color}[options.defaultColor=Cesium.Color.WHITE]
*@param {String}[options.vertexShader]
*@param {String}[options.fragmentShader]
*@param {string}[options.pickColorQualifier]
*
*
*@property {Object}uniforms
*@property {Object}uniformStateUsed
*@property {Boolean}translucent
*@property {Boolean}wireframe
*@property {Enum}side
*@property {String|Cesium.Color}defaultColor
*@property {String}vertexShader
*@property {String}fragmentShader
*
*@constructor
*@memberof Cesium
*/
function MeshMaterial(options) {
    options = Cesium.defaultValue(options, {});
    options.uniforms = Cesium.defaultValue(options.uniforms, {});
    var that = this;
    this.referenceCount = 0;
    this._disposeCallbacks = [];

    this._uuid = Cesium.createGuid();

    function initUniform(srcUniforms) {
        var _uniforms = {};

        for (var i in srcUniforms) {
            if (srcUniforms.hasOwnProperty(i) && Cesium.defined(srcUniforms[i])) {
                var item = srcUniforms[i];

                var val = {};
                val.needsUpdate = true;
                val._disposeCallbacks = [];
                val.onDispose = function (disposeCallback) {
                    if (this._disposeCallbacks.indexOf(disposeCallback) == -1) {
                        this._disposeCallbacks.push(disposeCallback);
                    }
                };
                val.destroy = function () {
                    for (var i = 0; i < this._disposeCallbacks.length; i++) {
                        var disposeCallback = this._disposeCallbacks[i];
                        disposeCallback.call(this);
                    }

                    this._disposeCallbacks.splice(0);
                };

                if (Array.isArray(item) && item.length >= 3 && item.length <= 4 && typeof item[0] === 'number') {
                    srcUniforms[i] = new Cesium.Color(srcUniforms[i][0], srcUniforms[i][1], srcUniforms[i][2], srcUniforms[i][3]);
                } else if (Cesium.defined(item.value)) {
                    for (var n in item) {
                        if (item.hasOwnProperty(n)) {
                            val[n] = item[n];
                        }
                    }
                }

                if (srcUniforms[i].hasOwnProperty("uuid")) {
                    (0, _defineProperty2.default)(val, "uuid", srcUniforms[i].uuid, function (changed, owner) {
                        owner.needsUpdate = changed;
                    });
                } else {
                    (0, _defineProperty2.default)(val, "uuid", Cesium.createGuid(), function (changed, owner) {
                        owner.needsUpdate = changed;
                    });
                }
                if (srcUniforms[i].hasOwnProperty("value")) {
                    (0, _defineProperty2.default)(val, "value", srcUniforms[i].value, function (changed, owner) {
                        owner.needsUpdate = changed;
                    });
                } else {
                    (0, _defineProperty2.default)(val, "value", srcUniforms[i], function (changed, owner) {
                        owner.needsUpdate = changed;
                    });
                }
                _uniforms[i] = val;
                //defineProperty(_uniforms, i, val, function (changed) {
                //    that.needsUpdate = changed;
                //});
            }
        }
        return _uniforms;
    }
    this._defaultColor = Cesium.defaultValue(options.defaultColor, Cesium.Color.WHITE);
    if (typeof this._defaultColor == 'string') {
        this._defaultColor = Cesium.Color.fromCssColorString(this._defaultColor);
    }

    this._pickedColor = Cesium.defaultValue(options.pickedColor, Cesium.Color.YELLOW);
    if (typeof this._pickedColor == 'string') {
        this._pickedColor = Cesium.Color.fromCssColorString(this._pickedColor);
    }
    this._picked = Cesium.defaultValue(options.picked, 0);
    options.uniforms.pickedColor = this._pickedColor;
    options.uniforms.defaultColor = this._defaultColor;
    options.uniforms.picked = this._picked;

    this._uniforms = initUniform(options.uniforms);

    function onPropertyChanged(changed) {
        that.needsUpdate = changed;
    }

    (0, _defineProperty2.default)(this, "translucent", Cesium.defaultValue(options.translucent, false), onPropertyChanged);
    (0, _defineProperty2.default)(this, "wireframe", Cesium.defaultValue(options.wireframe, false), onPropertyChanged);
    (0, _defineProperty2.default)(this, "side", Cesium.defaultValue(options.side, MeshMaterial.Sides.DOUBLE), onPropertyChanged);

    (0, _defineProperty2.default)(this, "uniformStateUsed", Cesium.defaultValue(options.uniformStateUsed, [{
        uniformStateName: "model",
        glslVarName: "modelMatrix"
    }]), onPropertyChanged);
    (0, _defineProperty2.default)(this, "uniforms", this._uniforms, function () {
        that._uniforms = initUniform(that._uniforms);
    });

    this._vertexShader = '//#inner\n void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n}';
    this._fragmentShader = '//#inner' + this._uuid + '\n uniform float picked;\n uniform vec4  pickedColor;\n uniform vec4  defaultColor;\n void main() {\ngl_FragColor = defaultColor;\n if(picked!=0.0){\ngl_FragColor = pickedColor;}}'; // vec4( ' + this._defaultColor.red + ',' + this._defaultColor.green + ',' + this._defaultColor.blue + ',' + this._defaultColor.alpha + ');\n}';

    (0, _defineProperty2.default)(this, "vertexShader", Cesium.defaultValue(options.vertexShader, this._vertexShader), onPropertyChanged);
    (0, _defineProperty2.default)(this, "fragmentShader", Cesium.defaultValue(options.fragmentShader, this._fragmentShader), onPropertyChanged);

    this.depthTest = Cesium.defaultValue(options.depthTest, true);
    this.depthMask = Cesium.defaultValue(options.depthMask, true);
    this.blending = Cesium.defaultValue(options.blending, true);

    this.allowPick = Cesium.defaultValue(options.allowPick, true);
    this.pickColorQualifier = Cesium.defaultValue(options.pickColorQualifier, 'uniform');
    this.needsUpdate = true;
}

Object.defineProperties(MeshMaterial.prototype, {
    uuid: {
        get: function get() {
            return this._uuid;
        }
    },
    defaultColor: {
        set: function set(val) {
            if (typeof val == 'string') {
                val = Cesium.Color.fromCssColorString(val);
            }
            Cesium.Color.clone(val, this._defaultColor);
        },
        get: function get() {
            return this._defaultColor;
        }
    }
});

/**
*
*@memberof Cesium.MeshMaterial
*@property {Enum}FRONT
*@property {Enum}BACK
*@property {Enum}DOUBLE
*/
MeshMaterial.Sides = {
    FRONT: 3,
    BACK: 1,
    DOUBLE: 2
};

MeshMaterial.prototype.onDispose = function (disposeCallback) {
    if (this._disposeCallbacks.indexOf(disposeCallback) == -1) {
        this._disposeCallbacks.push(disposeCallback);
    }
};

MeshMaterial.prototype.addReference = function () {
    this.referenceCount++;
};

MeshMaterial.prototype.removeReference = function () {
    this.referenceCount--;
    if (this.referenceCount <= 0) {
        for (var i = 0; i < this._disposeCallbacks.length; i++) {
            var disposeCallback = this._disposeCallbacks[i];
            disposeCallback.call(this);
        }

        this._disposeCallbacks.splice(0);
        this.destroy();
    }
};

MeshMaterial.prototype.destroy = function () {
    for (var key in this._uniforms) {
        if (this._uniforms.hasOwnProperty(key)) {
            this._uniforms.destroy && this._uniforms.destroy();
        }
    }
};
exports.default = MeshMaterial;

},{"../Util/defineProperty.js":36}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _MeshMaterial = require('./MeshMaterial.js');

var _MeshMaterial2 = _interopRequireDefault(_MeshMaterial);

var _phong_frag = require('./Shaders/phong_frag.js');

var _phong_frag2 = _interopRequireDefault(_phong_frag);

var _phong_vert = require('./Shaders/phong_vert.js');

var _phong_vert2 = _interopRequireDefault(_phong_vert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

    _MeshMaterial2.default.apply(this, arguments);
    this.vertexShader = _phong_vert2.default;
    this.fragmentShader = _phong_frag2.default;
}
MeshPhongMaterial.prototype = Object.create(_MeshMaterial2.default.prototype);
exports.default = MeshPhongMaterial;

},{"./MeshMaterial.js":9,"./Shaders/phong_frag.js":25,"./Shaders/phong_vert.js":26}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _MaterialUtils = require('./MaterialUtils.js');

var _MaterialUtils2 = _interopRequireDefault(_MaterialUtils);

var _GeometryUtils = require('./GeometryUtils.js');

var _GeometryUtils2 = _interopRequireDefault(_GeometryUtils);

var _Mesh = require('./Mesh.js');

var _Mesh2 = _interopRequireDefault(_Mesh);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
*
*@constructor
*@memberof Cesium
*/
function MeshUtils() {}

/**
*
*@param {THREE.Mesh}mesh3js
*@return {Cesium.Mesh}
*/
MeshUtils.fromMesh3js = function (mesh3js) {
    if (!MeshUtils.isMesh3js(mesh3js)) {
        return undefined;
    }
    var geometry = mesh3js.geometry;
    if (_GeometryUtils2.default.isGeometry3js(geometry)) {
        geometry = _GeometryUtils2.default.fromGeometry3js(geometry);
        //if (mesh3js.material.type === "MeshNormalMaterial" || mesh3js.material.type === "MeshPhongMaterial") {
        //    GeometryUtils.computeVertexNormals(geometry)
        //}
    }
    var material = mesh3js.material;
    if (_MaterialUtils2.default.isMaterial3js(material)) {
        material = _MaterialUtils2.default.fromMaterial3js(material);
    }
    var mesh = new _Mesh2.default({
        geometry: geometry,
        material: material,
        position: mesh3js.position,
        scale: mesh3js.scale
    });
    mesh.quaternion = mesh3js.quaternion;
    return mesh;
};
/**
 *
 *@param {Object}mesh
 *@return {Boolean}
 */
MeshUtils.isMesh3js = function (mesh) {
    return typeof THREE !== 'undefined' && mesh instanceof THREE.Mesh;
};
exports.default = MeshUtils;

},{"./GeometryUtils.js":5,"./MaterialUtils.js":7,"./Mesh.js":8}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _RendererUtils = require('./RendererUtils.js');

var _RendererUtils2 = _interopRequireDefault(_RendererUtils);

var _MeshMaterial = require('./MeshMaterial.js');

var _MeshMaterial2 = _interopRequireDefault(_MeshMaterial);

var _ShaderChunk = require('./Shaders/ShaderChunk.js');

var _ShaderChunk2 = _interopRequireDefault(_ShaderChunk);

var _Rotation = require('./Rotation.js');

var _Rotation2 = _interopRequireDefault(_Rotation);

var _FramebufferTexture = require('./FramebufferTexture.js');

var _FramebufferTexture2 = _interopRequireDefault(_FramebufferTexture);

var _LOD = require('./LOD.js');

var _LOD2 = _interopRequireDefault(_LOD);

var _ReferenceMesh = require('./ReferenceMesh.js');

var _ReferenceMesh2 = _interopRequireDefault(_ReferenceMesh);

var _tiff = require('../ThirdParty/tiff-js/tiff.js');

var _tiff2 = _interopRequireDefault(_tiff);

var _Path = require('../Util/Path.js');

var _Path2 = _interopRequireDefault(_Path);

var _MaterialUtils = require('./MaterialUtils.js');

var _MaterialUtils2 = _interopRequireDefault(_MaterialUtils);

var _MeshUtils = require('./MeshUtils.js');

var _MeshUtils2 = _interopRequireDefault(_MeshUtils);

var _ShaderUtils = require('./ShaderUtils.js');

var _ShaderUtils2 = _interopRequireDefault(_ShaderUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Matrix4; //= Cesium.Matrix4;
var DrawCommand; //= Cesium.DrawCommand;
var defined; //= Cesium.defined;
var GeometryPipeline; //= Cesium.GeometryPipeline;
var BufferUsage; //= Cesium.BufferUsage;
var BlendingState; //= Cesium.BlendingState;
var VertexArray; //= Cesium.VertexArray;
var ShaderProgram; //= Cesium.ShaderProgram;
var DepthFunction; //= Cesium.DepthFunction;
var CullFace; //= Cesium.CullFace;
var RenderState; //= Cesium.RenderState;
var defaultValue; //= Cesium.defaultValue;
var Texture; //= Cesium.Texture;
var PixelFormat; //= Cesium.PixelFormat; 
var Cartesian3; //= Cesium.Cartesian3;
var Cartesian2; //= Cesium.Cartesian2;
var Cartesian4; //= Cesium.Cartesian4; 
var CesiumMath; //= Cesium.Math;
var Color; //= Cesium.Color;
var Buffer; //= Cesium.Buffer;
var ComponentDatatype; //= Cesium.ComponentDatatype;
var loadArrayBuffer;
var loadImage;

var scratchMatrix;
var world2localMatrix;
var surfacePointLocal;
var rayDir;
var pos;
var rayOriginLocal;
var scratchRay;

var constantsHasInit = false;
function initConstants() {
    if (constantsHasInit) return;
    constantsHasInit = true;

    Matrix4 = Cesium.Matrix4;
    DrawCommand = Cesium.DrawCommand;
    defined = Cesium.defined;
    GeometryPipeline = Cesium.GeometryPipeline;
    BufferUsage = Cesium.BufferUsage;
    BlendingState = Cesium.BlendingState;
    VertexArray = Cesium.VertexArray;
    ShaderProgram = Cesium.ShaderProgram;
    DepthFunction = Cesium.DepthFunction;
    CullFace = Cesium.CullFace;
    RenderState = Cesium.RenderState;
    defaultValue = Cesium.defaultValue;
    Texture = Cesium.Texture;
    PixelFormat = Cesium.PixelFormat;
    Cartesian3 = Cesium.Cartesian3;
    Cartesian2 = Cesium.Cartesian2;
    Cartesian4 = Cesium.Cartesian4;
    CesiumMath = Cesium.Math;
    Color = Cesium.Color;
    Buffer = Cesium.Buffer;
    ComponentDatatype = Cesium.ComponentDatatype;

    // Cesium.loadText = Cesium.Resource.fetchText;
    // Cesium.loadJson = Cesium.Resource.fetchJson;
    // Cesium.loadBlob = Cesium.Resource.fetchBlob;
    loadArrayBuffer = Cesium.loadArrayBuffer || Cesium.Resource.fetchArrayBuffer;
    loadImage = Cesium.loadImage || Cesium.Resource.fetchImage;

    Cesium.Cartesian3.prototype.set = function (x, y, z) {
        this.x = x;this.y = y;this.z = z;
    };
    Cesium.Cartesian3.prototype.copy = function (src) {
        this.x = src.x;this.y = src.y;this.z = src.z;
    };

    Cesium.Cartesian2.prototype.set = function (x, y) {
        this.x = x;this.y = y;
    };
    Cesium.Cartesian2.prototype.copy = function (src) {
        this.x = src.x;this.y = src.y;
    };
    Cesium.Quaternion.prototype.set = function (x, y, z, w) {
        this.x = x;this.y = y;this.z = z;this.w = w;
    };
    Cesium.Quaternion.prototype.copy = function (src) {
        this.x = src.x;this.y = src.y;this.z = src.z;this.w = src.w;
    };

    scratchMatrix = new Matrix4();
    world2localMatrix = new Cesium.Matrix4();
    surfacePointLocal = new Cesium.Cartesian3();
    rayDir = new Cesium.Cartesian3();
    pos = new Cesium.Cartesian3();
    rayOriginLocal = new Cesium.Cartesian3();
    scratchRay = new Cesium.Ray();
}

function getVertexBufferTypedArray(collection) {

    var instances = collection._availableInstances;
    var instancesLength = instances.length;
    var collectionCenter = collection._center;

    var vertexSizeInFloats = 12;

    var bufferData = collection._vertexBufferTypedArray;
    if (!defined(bufferData) || instancesLength * vertexSizeInFloats > bufferData.length) {
        bufferData = new Float32Array(instancesLength * vertexSizeInFloats);
    }

    // Hold onto the buffer data so we don't have to allocate new memory every frame.
    collection._vertexBufferTypedArray = bufferData;

    for (var i = 0; i < instancesLength; ++i) {

        var modelMatrix = instances[i].modelMatrix;

        // Instance matrix is relative to center
        var instanceMatrix = Matrix4.clone(modelMatrix, scratchMatrix);
        instanceMatrix[12] -= collectionCenter.x;
        instanceMatrix[13] -= collectionCenter.y;
        instanceMatrix[14] -= collectionCenter.z;

        var offset = i * vertexSizeInFloats;

        // First three rows of the model matrix
        bufferData[offset + 0] = instanceMatrix[0];
        bufferData[offset + 1] = instanceMatrix[4];
        bufferData[offset + 2] = instanceMatrix[8];
        bufferData[offset + 3] = instanceMatrix[12];
        bufferData[offset + 4] = instanceMatrix[1];
        bufferData[offset + 5] = instanceMatrix[5];
        bufferData[offset + 6] = instanceMatrix[9];
        bufferData[offset + 7] = instanceMatrix[13];
        bufferData[offset + 8] = instanceMatrix[2];
        bufferData[offset + 9] = instanceMatrix[6];
        bufferData[offset + 10] = instanceMatrix[10];
        bufferData[offset + 11] = instanceMatrix[14];
    }

    return bufferData;
}

function getPickIdBufferTypedArray(collection, context) {
    var i;
    var instances = collection._availableInstances;
    var instancesLength = instances.length;

    var pickIdBuffer = collection._pickIdBufferTypedArray;
    if (!pickIdBuffer || instancesLength * 4 > pickIdBuffer.length) {
        pickIdBuffer = new Uint8Array(instancesLength * 4);
    }
    collection._pickIdBufferTypedArray = pickIdBuffer;

    for (i = 0; i < instancesLength; ++i) {
        var instance = instances[i];
        var pickId = collection._pickIds[instance.instanceId];
        if (!pickId) {
            pickId = context.createPickId(instance);
            collection._pickIds[instance.instanceId] = pickId;
        }
        var pickColor = pickId.color;
        var offset = i * 4;
        pickIdBuffer[offset] = Color.floatToByte(pickColor.red);
        pickIdBuffer[offset + 1] = Color.floatToByte(pickColor.green);
        pickIdBuffer[offset + 2] = Color.floatToByte(pickColor.blue);
        pickIdBuffer[offset + 3] = Color.floatToByte(pickColor.alpha);
    }
    return pickIdBuffer;
}

function getInstancedAttribTypedArray(collection, instancedAttribute) {
    var i;
    var instances = collection._availableInstances;
    var instancesLength = instances.length;
    var name = instancedAttribute.name;
    var componentsPerAttribute;
    var isColorValue = instancedAttribute.default instanceof Color;
    if (typeof instancedAttribute.default == 'number') {
        componentsPerAttribute = 1;
    } else if (instancedAttribute.default instanceof Cartesian2) {
        componentsPerAttribute = 2;
    } else if (instancedAttribute.default instanceof Cartesian3) {
        componentsPerAttribute = 3;
    } else if (instancedAttribute.default instanceof Cartesian4) {
        componentsPerAttribute = 4;
    } else if (isColorValue) {
        componentsPerAttribute = 4;
    }

    var bufferData = collection['_' + name + 'BufferTypedArray'];
    if (!bufferData || instancesLength * componentsPerAttribute > bufferData.length) {
        if (isColorValue) {
            bufferData = new Uint8Array(instancesLength * componentsPerAttribute);
        } else {
            bufferData = new Float32Array(instancesLength * componentsPerAttribute);
        }
    }
    collection['_' + name + 'BufferTypedArray'] = bufferData;

    if (isColorValue) {
        for (i = 0; i < instancesLength; ++i) {
            var instance = instances[i];
            var val = instance[name];
            var offset = i * componentsPerAttribute;

            bufferData[offset] = Color.floatToByte(val.red);
            bufferData[offset + 1] = Color.floatToByte(val.green);
            bufferData[offset + 2] = Color.floatToByte(val.blue);
            bufferData[offset + 3] = Color.floatToByte(val.alpha);
        }
    } else if (typeof instancedAttribute.default == 'number') {
        for (i = 0; i < instancesLength; ++i) {
            var instance = instances[i];
            var val = instance[name];
            bufferData[i] = val;
        }
    } else if (instancedAttribute.default instanceof Cartesian2) {

        for (i = 0; i < instancesLength; ++i) {
            var instance = instances[i];
            var val = instance[name];
            var offset = i * componentsPerAttribute;
            bufferData[offset] = val.x;
            bufferData[offset + 1] = val.y;
        }
    } else if (instancedAttribute.default instanceof Cartesian3) {

        for (i = 0; i < instancesLength; ++i) {
            var instance = instances[i];
            var val = instance[name];
            var offset = i * componentsPerAttribute;
            bufferData[offset] = val.x;
            bufferData[offset + 1] = val.y;
            bufferData[offset + 2] = val.z;
        }
    } else if (instancedAttribute.default instanceof Cartesian4) {
        for (i = 0; i < instancesLength; ++i) {
            var instance = instances[i];
            var val = instance[name];
            var offset = i * componentsPerAttribute;
            bufferData[offset] = val.x;
            bufferData[offset + 1] = val.y;
            bufferData[offset + 2] = val.z;
            bufferData[offset + 3] = val.w;
        }
    }
    return bufferData;
}

function createInstancedAttributes(collection, context, vertexArrayAttributes, attributeLocations, maxAttribLocation) {
    var instancedAttributes = collection.instancedAttributes;
    instancedAttributes.forEach(function (instancedAttribute) {

        var name = instancedAttribute.name;
        attributeLocations[name] = ++maxAttribLocation;

        var buffer = Buffer.createVertexBuffer({
            context: context,
            typedArray: getInstancedAttribTypedArray(collection, instancedAttribute),
            usage: BufferUsage.STATIC_DRAW
        });
        instancedAttribute._buffer = buffer;

        var attribute = {
            index: attributeLocations[instancedAttribute.name],
            vertexBuffer: buffer,
            componentsPerAttribute: 4,
            componentDatatype: ComponentDatatype.FLOAT,
            normalize: false,
            offsetInBytes: 0,
            strideInBytes: 0,
            instanceDivisor: 1
        };
        if (typeof instancedAttribute.default == 'number') {
            attribute.componentsPerAttribute = 1;
        } else if (instancedAttribute.default instanceof Cartesian2) {
            attribute.componentsPerAttribute = 2;
        } else if (instancedAttribute.default instanceof Cartesian3) {
            attribute.componentsPerAttribute = 3;
        } else if (instancedAttribute.default instanceof Cartesian4) {
            attribute.componentsPerAttribute = 4;
        } else if (instancedAttribute.default instanceof Color) {
            attribute.componentDatatype = ComponentDatatype.UNSIGNED_BYTE;
            attribute.normalize = true;
            attribute.componentsPerAttribute = 4;
        }

        vertexArrayAttributes.push(attribute);
    });

    return maxAttribLocation;
}

function createVertexBuffer(collection, context) {
    var pickIdBuffer = getPickIdBufferTypedArray(collection, context);
    collection._pickIdBuffer = Buffer.createVertexBuffer({
        context: context,
        typedArray: pickIdBuffer,
        usage: BufferUsage.STATIC_DRAW
    });
    var vertexBufferTypedArray = getVertexBufferTypedArray(collection);
    collection._vertexBuffer = Buffer.createVertexBuffer({
        context: context,
        typedArray: vertexBufferTypedArray,
        usage: BufferUsage.STATIC_DRAW
    });
}

function copyFromBufferView(vertexBuffer, arrayView, offsetInBytes) {
    offsetInBytes = offsetInBytes || 0;
    var gl = vertexBuffer._gl;
    var target = vertexBuffer._bufferTarget;
    gl.bindBuffer(target, vertexBuffer._buffer);
    gl.bufferData(target, arrayView, gl.DYNAMIC_DRAW);
    gl.bindBuffer(target, null);
}
function updateVertexBuffer(collection, context) {
    var vertexBufferTypedArray = getVertexBufferTypedArray(collection);
    copyFromBufferView(collection._vertexBuffer, vertexBufferTypedArray);

    var pickIdBufferTypedArray = getPickIdBufferTypedArray(collection, context);
    copyFromBufferView(collection._pickIdBuffer, pickIdBufferTypedArray);

    var instancedAttributes = collection.instancedAttributes;
    instancedAttributes.forEach(function (instancedAttribute) {
        var bufferTypedArray = getInstancedAttribTypedArray(collection, instancedAttribute);
        copyFromBufferView(instancedAttribute._buffer, bufferTypedArray);
    });
}

function createPickIds(collection, context) {
    // PERFORMANCE_IDEA: we could skip the pick buffer completely by allocating
    // a continuous range of pickIds and then converting the base pickId + batchId
    // to RGBA in the shader.  The only consider is precision issues, which might
    // not be an issue in WebGL 2.
    var instances = collection._instances;
    var instancesLength = instances.length;
    var pickIds = new Array(instancesLength);
    for (var i = 0; i < instancesLength; ++i) {
        pickIds[i] = context.createPickId(instances[i]);
    }
    return pickIds;
}

/**
*
*
*@param {Object}options
*@param {Cesium.Matrix4}[options.modelMatrix=Cesium.Matrix4.IDENTITY]
*@param {Cesium.Cartesian3}[options.up=Cesium.Cartesian3.UNIT_Z]
*@param {Cesium.Cartesian3}[options.position=Cesium.Cartesian3.ZERO]
*@param {Cesium.Cartesian3}[options.scale=new Cartesian3(1, 1, 1)]
*@param {Cesium.Rotation}[options.rotation]
*@param {Boolean}[options.show=true]
*@param {Boolean}[options.showReference=true]
*@param {Cesium.ArrowGeometry}[options.referenceAxisParameter]
*
*@property {Cesium.Matrix4}modelMatrix 
*@property {Cesium.Cartesian3}up 
*@property {Cesium.Cartesian3}position 
*@property {Cesium.Cartesian3}scale 
*@property {Cesium.Rotation}rotation 
*@property {Boolean}show 
*@property {Boolean}showReference
*@property {Boolean}modelMatrixNeedsUpdate
*@property {Cesium.Event}beforeUpdate  
*
*@constructor
*@memberof Cesium
*@extends Cesium.Primitive
*
*@example 
 
    MeshVisualizer = Cesium.MeshVisualizer;
    Mesh = Cesium.Mesh;
    MeshMaterial = Cesium.MeshMaterial; 
    FramebufferTexture = Cesium.FramebufferTexture;

    var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 50000);
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

    var meshVisualizer = new MeshVisualizer({
        modelMatrix: modelMatrix,
    });
    viewer.scene.primitives.add(meshVisualizer);


    //示例1：Cesium.Geometry+Cesium.MeshMaterial组合
    var box = Cesium.BoxGeometry.createGeometry(Cesium.BoxGeometry.fromDimensions({
        dimensions: new Cesium.Cartesian3(100000, 50000, 50000),
        vertexFormat: Cesium.VertexFormat.POSITION_ONLY
    }));
    
    var material = new MeshMaterial({
        defaultColor: "rgba(255,0,0,1.0)",
        wireframe: false,
        side: MeshMaterial.Sides.DOUBLE
    });
    var boxMesh = new Mesh(box, material);

    meshVisualizer.add(boxMesh);

    //示例2：Cesium.CSG+Cesium.MeshMaterial组合，可以用Cesium.CSG做布尔运算并渲染运算结果

    //首先使用Cesium创建球体
     var sphere = new Cesium.SphereGeometry({
         radius: 50000.0,
         vertexFormat: Cesium.VertexFormat.POSITION_ONLY
     });
     sphere = Cesium.SphereGeometry.createGeometry(sphere);
    
     var sphereMesh = new Mesh(sphere, material);
     sphereMesh.position = new Cesium.Cartesian3(100000, 0, 0)
     meshVisualizer.add(sphereMesh);

     //将球体对象Cesium.SphereGeometry转成Cesium.CSG实例
     sphere = CSG.toCSG(sphere);
     //将盒子对象转成Cesium.CSG实例
     box = CSG.toCSG(box);

      //做布尔运算
      var subResult = sphere.subtract(box);
      //渲染运算结果
      var subResultMesh = new Mesh(subResult, material);
      subResultMesh.position = new Cesium.Cartesian3(700000, 0, 0)
      meshVisualizer.add(subResultMesh);

      //示例3：使用帧缓存作纹理,实际应用中如体绘制，风场流场绘制等等都可以运用此技术

      function createGeometry() {
        var p1 = new Cesium.Cartesian3(-50000, 50000, 100);
        var p2 = new Cesium.Cartesian3(-50000, -50000, 100);
        var p3 = new Cesium.Cartesian3(50000, -50000, 100);
        var p4 = new Cesium.Cartesian3(50000, 50000, 100);

        var positions = new Float64Array([
          p1.x, p1.y, p1.z,
          p2.x, p2.y, p2.z,
          p3.x, p3.y, p3.z,
          p4.x, p4.y, p4.z
        ]);
        var indices = new Uint16Array([
          0, 1, 3,
          1, 2, 3,
        ]);
        var sts = new Float32Array([
          1, 1,
          1, 0,
          0, 0,
          0, 1
        ]);
        var geometry = new Cesium.Geometry({
            attributes: {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: positions
                }),
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: sts
                })
            },
            indices: indices,
            primitiveType: Cesium.PrimitiveType.TRIANGLES,
            boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
        });

        return geometry;
    }
    //将上文中的盒子渲染到缓存，作为纹理参与createGeometry（）方法创建的几何体渲染过程
    var framebufferTex = new FramebufferTexture(boxMesh);
    var geometry = createGeometry();
    var customMesh = new Mesh(geometry, new MeshMaterial({

        uniforms: {
            u_textureMap: framebufferTex//Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/STK.png')
        },
        side: MeshMaterial.Sides.DOUBLE,
        vertexShader : "\n\
            \n\
            varying vec3 v_position;\n\
            varying vec2 v_st;\n\
            \n\
            void main(void) \n\
            {\n\
            vec4 pos = u_modelViewMatrix * vec4(position,1.0);\n\
            v_position = pos.xyz;\n\
            v_st=st;\n\
            gl_Position = u_projectionMatrix * pos;\n\
            }",
        fragmentShader : "varying vec2 v_st;\
            uniform sampler2D u_textureMap;\
            void main()\
            {\
            gl_FragColor = texture2D(u_textureMap,v_st);\n\
            \
            }\
            "
    }));
    customMesh.position = new Cesium.Cartesian3(100000, 0, 0);
    meshVisualizer.add(customMesh);
*/
function MeshVisualizer(options) {
    initConstants();
    options = options || {};
    this._modelMatrix = defaultValue(options.modelMatrix, Matrix4.IDENTITY);
    this._actualModelMatrix = Matrix4.clone(this._modelMatrix);
    this._ready = true;
    this._modelMatrixNeedsUpdate = true;

    this._isWireframe = false;
    this._up = defaultValue(options.up, new Cartesian3(0, 0, 1));
    this._position = defaultValue(options.position, new Cartesian3(0, 0, 0));
    this._scale = defaultValue(options.scale, new Cartesian3(1, 1, 1));
    this._rotation = defaultValue(options.rotation, { axis: new Cartesian3(0, 0, 1), angle: 0 });
    this._rotation = new _Rotation2.default(this._rotation.axis, this._rotation.angle);
    this._rotation.paramChanged.addEventListener(this.onModelMatrixNeedUpdate, this);

    this._chidren = [];
    this._debug = false;
    this._show = defaultValue(options.show, true);

    this._center = new Cartesian3();
    Cesium.Matrix4.getTranslation(this._modelMatrix, this._center);
    this._framebufferTextures = {};
    this._uniformValueCache = {};
    this._textureCache = {};
    this._uniformMaps = {};
    this.referenceMesh = new _ReferenceMesh2.default({
        axisParameter: defaultValue(options.referenceAxisParameter, { length: 50000 * 2 }),
        show: defaultValue(options.showReference, false)
    });
    this.add(this.referenceMesh);
    this._pickIds = [];
    this.beforeUpdate = new Cesium.Event();
    this._scene = options.scene;
}

MeshVisualizer.prototype = {
    /**
    *@param {Cesium.Mesh}mesh
    */
    remove: function remove(mesh) {

        for (var i = 0; i < this._chidren.length; i++) {
            if (this._chidren[i] == mesh) {

                this._chidren.splice(i, 1);
            }
        }
        MeshVisualizer.traverse(mesh, function () {
            if (mesh._drawCommand) {
                mesh._drawCommand.destroy && mesh._drawCommand.destroy();
                // var material = mesh.material;
                // if (material && material.removeReference) {
                //     material.removeReference();
                // }
            }
            if (mesh._actualMesh && mesh._actualMesh._drawCommand) {
                // var material = mesh._actualMesh.material
                // if (material && material.removeReference) {
                //     material.removeReference();
                // }
                var actualMesh = mesh._actualMesh;
                actualMesh && actualMesh.destroy();

                Cesium.destroyObject(actualMesh._drawCommand);
                Cesium.destroyObject(actualMesh.geometry);
                Cesium.destroyObject(actualMesh);
                // Cesium.destroyObject(mesh);
            }
        }, false);
    },
    /**
    *
    *拾取点，用局部坐标系表达。内部使用Cesium.Scene.pickPosition和MeshVisualizer.worldCoordinatesToLocal实现。
    *@param {Cesium.Cartesian2}windowPosition
    *@param {Cesium.Cartesian3}[result]
    *@return {Cesium.Cartesian3}
    */
    pickPosition: function pickPosition(windowPosition, result) {
        if (!this._scene) {
            return undefined;
        }
        this._scene.pickPosition(windowPosition, surfacePointLocal);

        if (!surfacePointLocal) {
            return undefined;
        }

        this.worldCoordinatesToLocal(surfacePointLocal, surfacePointLocal);
        Cesium.Cartesian3.clone(surfacePointLocal, result);
        return result;
    },
    /**
    *
    *创建一条射线，用局部坐标系表达
    *@param {Cesium.Cartesian2}windowPosition
    *@param {Cesium.Ray}[result]
    *@return {Cesium.Ray}
    */
    getPickRay: function getPickRay(windowPosition, result) {
        if (!this._scene) {
            return undefined;
        }
        if (!result) {
            result = Cesium.Ray();
        }
        this._scene.camera.getPickRay(windowPosition, scratchRay); //ray用于计算小球发射点位置，这里射线的起始点是世界坐标，不能像Threejs那样直接拿来计算，需要转成局部坐标
        this._scene.pickPosition(windowPosition, surfacePointLocal); //射线和局部场景的交点

        if (!surfacePointLocal) {
            return undefined;
        }

        Cesium.Cartesian3.clone(scratchRay.direction, rayDir);

        //世界坐标转局部坐标
        this.worldCoordinatesToLocal(scratchRay.origin, rayOriginLocal);
        this.worldCoordinatesToLocal(surfacePointLocal, surfacePointLocal);

        Cesium.Cartesian3.add(rayOriginLocal, rayDir, pos);
        //计算发射方向
        Cesium.Cartesian3.subtract(surfacePointLocal, pos, rayDir);
        Cesium.Cartesian3.clone(surfacePointLocal, result.origin);
        Cesium.Cartesian3.clone(rayDir, result.direction);
        return result;
    },
    /**
    *世界坐标到局部坐标
    *@param {Cesium.Cartesian3}worldCoordinates
    *@param {Cesium.Cartesian3}[result]
    *@return {Cesium.Cartesian3}
    */
    worldCoordinatesToLocal: function worldCoordinatesToLocal(worldCoordinates, result) {
        if (!result) {
            result = new Cartesian3();
        }
        Cesium.Matrix4.inverseTransformation(this._actualModelMatrix, world2localMatrix);
        Cesium.Matrix4.multiplyByPoint(world2localMatrix, worldCoordinates, result);
        return result;
    },
    /**
    *局部坐标到世界坐标
    *@param {Cesium.Cartesian3}localCoordinates
    *@param {Cesium.Cartesian3}[result]
    *@return {Cesium.Cartesian3}
    */
    localToWorldCoordinates: function localToWorldCoordinates(localCoordinates, result) {
        if (!result) {
            result = new Cartesian3();
        }
        Cesium.Matrix4.multiplyByPoint(this._actualModelMatrix, localCoordinates, result);
        return result;
    },
    onModelMatrixNeedUpdate: function onModelMatrixNeedUpdate() {
        this._modelMatrixNeedsUpdate = true;
    },
    /**
     *
     *@param {Number}x
     *@param {Number}y
     *@param {Number}z
     */
    setPosition: function setPosition(x, y, z) {
        var changed = false;
        if (arguments.length == 1) {
            if (typeof x == 'number') {
                if (x != this._position.x) changed = true;
                this._position.x = x;
            } else if (x instanceof Cesium.Cartesian3) {
                if (x != this._position.x || y != this._position.y || z != this._position.z) {
                    changed = true;
                }

                this._position.x = x.x;
                this._position.y = x.y;
                this._position.z = x.z;
            }
        }
        if (arguments.length == 2 && typeof y == 'number') {
            if (y != this._position.y) changed = true;
            this._position.y = y;
        }
        if (arguments.length == 3 && typeof z == 'number') {
            if (z != this._position.z) changed = true;
            this._position.z = z;
        }
        if (changed) {
            this._modelMatrixNeedsUpdate = true;
        }
    },
    /**
     *
     *@param {Number}x
     *@param {Number}y
     *@param {Number}z
     */
    setScale: function setScale(x, y, z) {
        var changed = false;
        if (arguments.length == 1) {
            if (typeof x == 'number') {
                if (x != this._scale.x) changed = true;
                this._scale.x = x;
            } else if (x instanceof Cesium.Cartesian3) {
                if (x != this._scale.x || y != this._scale.y || z != this._scale.z) {
                    changed = true;
                }

                this._scale.x = x.x;
                this._scale.y = x.y;
                this._scale.z = x.z;
            }
        }
        if (arguments.length == 2 && typeof y == 'number') {
            if (y != this._scale.y) changed = true;
            this._scale.y = y;
        }
        if (arguments.length == 3 && typeof z == 'number') {
            if (z != this._scale.z) changed = true;
            this._scale.z = z;
        }
        if (changed) {
            this._modelMatrixNeedsUpdate = true;
        }
    },

    toWireframe: function toWireframe(geometry) {
        if (geometry.primitiveType !== Cesium.PrimitiveType.TRIANGLES && geometry.primitiveType !== Cesium.PrimitiveType.TRIANGLE_FAN && geometry.primitiveType !== Cesium.PrimitiveType.TRIANGLE_STRIP) {
            return geometry;
        }
        if (!geometry.triangleIndices) {
            geometry.triangleIndices = geometry.indices;
        }
        //if (geometry.lineIndices) {
        //    geometry.indices = geometry.lineIndices;
        //    return geometry;
        //}
        geometry = GeometryPipeline.toWireframe(geometry);
        //geometry.lineIndices = geometry.indices;
        return geometry;
    },

    restoreFromWireframe: function restoreFromWireframe(geometry) {
        if (geometry.primitiveType == Cesium.PrimitiveType.POINTS) {
            return geometry;
        }
        if (geometry.triangleIndices) {
            geometry.indices = geometry.triangleIndices;
        }
        geometry.primitiveType = Cesium.PrimitiveType.TRIANGLES;
        return geometry;
    },
    createBoundingSphere: function createBoundingSphere(mesh) {
        var instancesLength = mesh._instances.length;
        var points = new Array(instancesLength);
        for (var i = 0; i < instancesLength; ++i) {
            points[i] = Matrix4.getTranslation(mesh._instances[i].modelMatrix, new Cartesian3());
        }

        mesh._boundingSphere = Cesium.BoundingSphere.fromPoints(points);
        Cartesian3.clone(mesh._boundingSphere.center, mesh._center);
    },
    /**
    * 
    *@param {Cesium.Mesh} mesh
    *@param {Cesium.FrameState} frameState
    *@return {Cesium.DrawCommand} 
    *@private
    */
    createDrawCommand: function createDrawCommand(mesh, frameState) {
        var that = this;
        var context = frameState.context;
        var geometry = mesh.geometry;
        var material = mesh.material;

        var pickObject = {
            primitive: this,
            id: mesh
        };
        var pickId = context.createPickId(pickObject);
        that._pickIds.push(pickId);

        var command = new Cesium.DrawCommand({
            // pickId: mesh.material.allowPick ? pickId : undefined,
            modelMatrix: mesh._instances && mesh._instances.length > 0 ? undefined : Matrix4.clone(this.modelMatrix),
            owner: mesh,
            primitiveType: geometry.primitiveType,
            cull: false, // material.cullFrustum,
            instanceCount: mesh._instances && mesh._instances.length > 0 ? mesh._availableInstances.length : undefined,
            pass: material.translucent ? Cesium.Pass.TRANSLUCENT : Cesium.Pass.OPAQUE
            // , boundingVolume: geometry.boundingSphere
        });

        var attributeLocations = GeometryPipeline.createAttributeLocations(geometry);
        var vertexArrayAttributes;
        if (mesh._instances && mesh._instances.length) {
            this.createBoundingSphere(mesh);

            vertexArrayAttributes = [];
            var maxAttribLocation = 0;
            for (var location in attributeLocations) {
                if (attributeLocations.hasOwnProperty(location)) {
                    maxAttribLocation = Math.max(maxAttribLocation, attributeLocations[location]);
                }
            }
            // command.instanceCount = mesh._instances.length;
            var collection = mesh;

            collection._pickIds = createPickIds(collection, frameState.context);

            createVertexBuffer(collection, frameState.context);

            var vertexSizeInFloats = 12;
            var componentSizeInBytes = ComponentDatatype.getSizeInBytes(ComponentDatatype.FLOAT);

            var instancedAttributes = {
                czm_modelMatrixRow0: {
                    index: maxAttribLocation + 1,
                    vertexBuffer: collection._vertexBuffer,
                    componentsPerAttribute: 4,
                    componentDatatype: ComponentDatatype.FLOAT,
                    normalize: false,
                    offsetInBytes: 0,
                    strideInBytes: componentSizeInBytes * vertexSizeInFloats,
                    instanceDivisor: 1
                },
                czm_modelMatrixRow1: {
                    index: maxAttribLocation + 2,
                    vertexBuffer: collection._vertexBuffer,
                    componentsPerAttribute: 4,
                    componentDatatype: ComponentDatatype.FLOAT,
                    normalize: false,
                    offsetInBytes: componentSizeInBytes * 4,
                    strideInBytes: componentSizeInBytes * vertexSizeInFloats,
                    instanceDivisor: 1
                },
                czm_modelMatrixRow2: {
                    index: maxAttribLocation + 3,
                    vertexBuffer: collection._vertexBuffer,
                    componentsPerAttribute: 4,
                    componentDatatype: ComponentDatatype.FLOAT,
                    normalize: false,
                    offsetInBytes: componentSizeInBytes * 8,
                    strideInBytes: componentSizeInBytes * vertexSizeInFloats,
                    instanceDivisor: 1
                }
            };

            instancedAttributes.a_pickColor = {
                index: maxAttribLocation + 4,
                vertexBuffer: collection._pickIdBuffer,
                componentsPerAttribute: 4,
                componentDatatype: ComponentDatatype.UNSIGNED_BYTE,
                normalize: true,
                offsetInBytes: 0,
                strideInBytes: 0,
                instanceDivisor: 1
            };

            for (var location in instancedAttributes) {
                if (instancedAttributes.hasOwnProperty(location)) {
                    attributeLocations[location] = ++maxAttribLocation;
                    vertexArrayAttributes.push(instancedAttributes[location]);
                }
            }

            maxAttribLocation = createInstancedAttributes(mesh, frameState.context, vertexArrayAttributes, attributeLocations, maxAttribLocation);
        }

        command.vertexArray = VertexArray.fromGeometry({
            context: context,
            geometry: geometry,
            attributeLocations: attributeLocations,
            bufferUsage: BufferUsage.STATIC_DRAW,

            vertexArrayAttributes: vertexArrayAttributes
        });
        if (vertexArrayAttributes && vertexArrayAttributes.length) {
            command._cacehVertexArrayAttributes = vertexArrayAttributes.map(function (a) {
                return a;
            });
        }
        command.vertexArray._attributeLocations = attributeLocations;

        var pickColor = pickId.color;

        var shader = {
            fragmentShader: this.getFragmentShaderSource(material),
            vertexShader: this.getVertexShaderSource(mesh, material)
        };
        if (material.material3js) {
            shader = _ShaderUtils2.default.processShader3js(material.material3js, shader);
        }

        if (mesh._instances && mesh._instances.length) {

            var vs = shader.vertexShader;
            var renamedSource = Cesium.ShaderSource.replaceMain(vs, 'czm_instancing_main');

            var pickAttribute = 'attribute vec4 a_pickColor;\n' + 'varying vec4 czm_pickColor;\n';
            var pickVarying = '    czm_pickColor = a_pickColor;\n';

            vs = //'mat4 czm_instanced_modelView;\n' +
            'attribute vec4 czm_modelMatrixRow0;\n' + 'attribute vec4 czm_modelMatrixRow1;\n' + 'attribute vec4 czm_modelMatrixRow2;\n' + 'uniform mat4 czm_instanced_modifiedModelView;\n' +
            // batchIdAttribute +
            pickAttribute + renamedSource + 'void main()\n' + '{\n' + '    modelMatrix = mat4(czm_modelMatrixRow0.x, czm_modelMatrixRow1.x, czm_modelMatrixRow2.x, 0.0, czm_modelMatrixRow0.y, czm_modelMatrixRow1.y, czm_modelMatrixRow2.y, 0.0, czm_modelMatrixRow0.z, czm_modelMatrixRow1.z, czm_modelMatrixRow2.z, 0.0, czm_modelMatrixRow0.w, czm_modelMatrixRow1.w, czm_modelMatrixRow2.w, 1.0);\n' + '    modelViewMatrix = czm_instanced_modifiedModelView * modelMatrix;\n' + '    u_modelMatrix =modelMatrix;\n' + '    u_modelViewMatrix = modelViewMatrix ;\n' +
            // globalVarsMain +
            '    czm_instancing_main();\n' + pickVarying + '}\n';
            shader.vertexShader = vs;
        }

        var vs = new Cesium.ShaderSource({
            sources: [shader.vertexShader]
        });
        var fs = new Cesium.ShaderSource({
            sources: [shader.fragmentShader]
        });
        // if (this.onlySunLighting) {
        //fs.defines.push('ONLY_SUN_LIGHTING');
        // }
        var translucent = material.translucent;
        if (!translucent && context.fragmentDepth) {
            fs.defines.push('WRITE_DEPTH');
        }
        var logDepthExtension = '#ifdef GL_EXT_frag_depth \n' + '#extension GL_EXT_frag_depth : enable \n' + '#endif \n\n';

        // if (this._useLogDepth) {
        vs.defines.push('LOG_DEPTH');
        fs.defines.push('LOG_DEPTH');
        //fs.sources.push(logDepthExtension);
        // }


        command._sp = ShaderProgram.fromCache({
            context: context,
            fragmentShaderSource: fs, //shader.fragmentShader,//this.getFragmentShaderSource(material),
            vertexShaderSource: vs, //shader.vertexShader,//this.getVertexShaderSource(geometry, material),
            attributeLocations: attributeLocations
        });
        if (!Cesium.defined(mesh.material.allowPick)) {
            mesh.material.allowPick = true;
        }
        if (mesh.material.allowPick) {}
        command.shaderProgram = command._sp;
        command.renderState = this.getRenderState(material);

        command._renderStateOptions = material._renderStateOptions;

        command.uniformMap = this.getUniformMap(material, frameState);
        command.uniformMap.czm_pickColor = function () {
            return pickId.color;
        };
        command.uniformMap.czm_instanced_modifiedModelView = this.getModifiedModelViewCallback(context, mesh);

        var pickCommand = new Cesium.DrawCommand({
            owner: mesh,
            pickOnly: true,
            instanceCount: mesh._instances && mesh._instances.length > 0 ? mesh._availableInstances.length : undefined,
            modelMatrix: mesh._instances && mesh._instances.length > 0 ? undefined : Matrix4.clone(this.modelMatrix),
            primitiveType: geometry.primitiveType,
            cull: material.cullFrustum,
            pass: material.translucent ? Cesium.Pass.TRANSLUCENT : Cesium.Pass.OPAQUE
        });
        // Recompile shader when material changes


        vs = new Cesium.ShaderSource({
            sources: [shader.vertexShader]
        });
        fs = new Cesium.ShaderSource({
            sources: [shader.fragmentShader],
            pickColorQualifier: mesh._instances && mesh._instances.length ? 'varying' : material.pickColorQualifier || 'uniform'
        });
        // if (this.onlySunLighting) {
        fs.defines.push('ONLY_SUN_LIGHTING');
        // }
        translucent = material.translucent;
        if (!translucent && context.fragmentDepth) {
            fs.defines.push('WRITE_DEPTH');
        }

        // if (this._useLogDepth) {
        vs.defines.push('LOG_DEPTH');
        fs.defines.push('LOG_DEPTH');
        fs.sources.push(logDepthExtension);
        // }


        var _pickSP = ShaderProgram.replaceCache({
            context: context,
            shaderProgram: _pickSP,
            vertexShaderSource: vs,
            fragmentShaderSource: fs,
            attributeLocations: attributeLocations
        });

        pickCommand.vertexArray = command.vertexArray;
        pickCommand.renderState = this.getRenderState(material);
        pickCommand.shaderProgram = _pickSP;
        pickCommand.uniformMap = command.uniformMap;
        pickCommand.executeInClosestFrustum = translucent;
        mesh._pickCommand = pickCommand;

        return command;
    },

    getModifiedModelViewCallback: function getModifiedModelViewCallback(context, mesh) {
        return function () {
            if (!mesh._rtcTransform) {
                mesh._rtcTransform = new Matrix4();
            }
            if (!mesh._rtcModelView) {
                mesh._rtcModelView = new Matrix4();
            }
            Matrix4.multiplyByTranslation(mesh.modelMatrix, mesh._center, mesh._rtcTransform);

            return Matrix4.multiply(context.uniformState.view, mesh._rtcTransform, mesh._rtcModelView);
        };
    },
    /**
    *
    *
    *@param {THREE.Material}material 
    *@return {Cesium.RenderState}frameState
    *@private
    */
    getRenderState_old: function getRenderState_old(material) {
        var renderState = {
            blending: material.blending ? BlendingState.ALPHA_BLEND : BlendingState.DISABLED,
            depthTest: {
                enabled: material.depthTest,
                func: DepthFunction.GREATER //LESS
            },
            cull: {
                enabled: true,
                face: CullFace.FRONT
            },
            depthRange: {
                near: 0,
                far: 1
            },
            colorMask: {
                red: true,
                green: true,
                blue: true,
                alpha: true
            },
            depthMask: material.depthMask
        };
        renderState.cull.enabled = true;
        renderState.blending.color = {
            red: 0.0,
            green: 0.0,
            blue: 0.0,
            alpha: 0.0
        };
        switch (material.side) {
            case _MeshMaterial2.default.Sides.FRONT:
                renderState.cull.face = CullFace.BACK;
                break;
            case _MeshMaterial2.default.Sides.BACK:
                renderState.cull.face = CullFace.FRONT;
                break;
            default:
                renderState.cull.enabled = false;
                break;
        }

        renderState = RenderState.fromCache(renderState);

        return renderState;
    },

    /**
    *
    *
    *@param {THREE.Material}material 
    *@return {Cesium.RenderState}frameState
    *@private
    */
    getRenderState: function getRenderState(material) {
        var renderStateOpts = {
            blending: material.blending ? BlendingState.ALPHA_BLEND : BlendingState.DISABLED,
            depthTest: {
                enabled: material.depthTest,
                func: DepthFunction.LESS
            },
            cull: {
                enabled: false,
                face: CullFace.FRONT
            },
            depthRange: {
                near: 0,
                far: 1
            },
            colorMask: {
                red: true,
                green: true,
                blue: true,
                alpha: true
            },
            depthMask: material.depthMask
        };
        renderStateOpts.cull.enabled = true;

        // renderStateOpts.blending.color = {
        //     red: 0.0,
        //     green: 0.0,
        //     blue: 0.0,
        //     alpha: 0.0
        // };
        switch (material.side) {
            case _MeshMaterial2.default.Sides.FRONT:
                renderStateOpts.cull.face = CullFace.BACK;
                break;
            case _MeshMaterial2.default.Sides.BACK:
                renderStateOpts.cull.face = CullFace.FRONT;
                break;
            default:
                renderStateOpts.cull.enabled = false;
                break;
        }

        material._renderStateOptions = renderStateOpts;
        var renderState = RenderState.fromCache(renderStateOpts);

        return renderState;
    },

    /**
    *
    *
    *@param {THREE.Material}material 
    *@param {Cesium.FrameState}frameState
    *@private
    */
    getUniformMap: function getUniformMap(material, frameState) {
        if (this._uniformMaps[material.uuid] && !material.needsUpdate) {
            return this._uniformMaps[material.uuid];
        }
        var uniformMap = {};
        this._uniformMaps[material.uuid] = uniformMap;

        material.needsUpdate = false;

        uniformMap.cameraPosition = function () {
            return frameState.camera.position;
        };
        uniformMap.u_cameraPosition = function () {
            return frameState.camera.position;
        };
        //base matrix
        uniformMap.u_normalMatrix = function () {
            return frameState.context.uniformState.normal;
        };
        uniformMap.u_projectionMatrix = function () {
            return frameState.context.uniformState.projection;
        };

        uniformMap.u_modelViewMatrix = function () {
            return frameState.context.uniformState.modelView;
        };
        //base matrix for threejs
        uniformMap.normalMatrix = function () {
            return frameState.context.uniformState.normal;
        };
        uniformMap.projectionMatrix = function () {
            return frameState.context.uniformState.projection;
        };

        uniformMap.modelViewMatrix = function () {
            return frameState.context.uniformState.modelView;
        };
        uniformMap.modelMatrix = function () {
            return frameState.context.uniformState.model;
        };
        uniformMap.u_modelMatrix = function () {
            return frameState.context.uniformState.model;
        };
        uniformMap.u_viewMatrix = function () {
            return frameState.context.uniformState.view;
        };
        uniformMap.viewMatrix = function () {
            return frameState.context.uniformState.view;
        };
        uniformMap.logDepthBufFC = function () {
            return 2.0 / (Math.log(frameState.camera.frustum.far + 1.0) / Math.LN2);
        };

        if (material.uniformStateUsed && material.uniformStateUsed.length) {
            material.uniformStateUsed.forEach(function (item) {
                if (!uniformMap[item.glslVarName]) {
                    if (!frameState.context.uniformState[item.uniformStateName]) {
                        throw new Error(item.uniformStateName + "不是Cesium引擎的内置对象");
                    }
                    uniformMap[item.glslVarName] = function () {
                        return frameState.context.uniformState[item.uniformStateName];
                    };
                }
            });
        }
        var that = this;

        function getCubeTextureCallback(name, item, mtl) {
            var callback = function callback() {
                if (!that._textureCache[item.uuid] || item.needsUpdate) {
                    if (!callback.allLoaded && !callback.isLoading) {
                        var promises = [];
                        for (var i = 0; i < item.value.length; i++) {
                            if (item.value[i] instanceof HTMLCanvasElement || item.value[i] instanceof HTMLVideoElement || item.value[i] instanceof HTMLImageElement) {
                                var deferred = Cesium.when.defer();
                                requestAnimationFrame(function () {
                                    deferred.resolve(item.value[i]);
                                });
                                promises.push(deferred);
                            } else if (typeof item.value[i] === 'string') {
                                promises.push(loadImage(item.value[i]));
                            } else {
                                throw Error(name + "" + i + "给定值“ " + item[i] + "” 不是有效的纹理图片");
                            }
                        }
                        callback.isLoading = true;
                        item.needsUpdate = false;
                        Cesium.when.all(promises, function (images) {

                            that._textureCache[item.uuid] = new Cesium.CubeMap({
                                context: frameState.context,
                                source: {
                                    positiveX: images[0],
                                    negativeX: images[1],
                                    positiveY: images[2],
                                    negativeY: images[3],
                                    positiveZ: images[4],
                                    negativeZ: images[5]
                                }
                            });
                            if (item.onDispose) {
                                item.onDispose(function () {
                                    if (that._textureCache[item.uuid]) {
                                        that._textureCache[item.uuid].destroy();
                                        delete that._textureCache[item.uuid];
                                    }
                                });
                            }
                            callback.allLoaded = true;
                            callback.isLoading = false;
                        });
                    }
                }
                if (callback.allLoaded) {
                    return that._textureCache[item.uuid];
                } else {
                    if (!that.defaultCubeMap) {

                        if (!that.defaultTextureImage) {
                            that.defaultTextureImage = document.createElement("canvas");
                            that.defaultTextureImage.width = 1;
                            that.defaultTextureImage.height = 1;
                        }

                        that.defaultCubeMap = new Cesium.CubeMap({
                            context: frameState.context,
                            source: {
                                positiveX: that.defaultTextureImage,
                                negativeX: that.defaultTextureImage,
                                positiveY: that.defaultTextureImage,
                                negativeY: that.defaultTextureImage,
                                positiveZ: that.defaultTextureImage,
                                negativeZ: that.defaultTextureImage
                            }
                        });
                    }
                    return that.defaultCubeMap;
                }
            };
            if (callback.allLoaded) {
                callback.allLoaded = false;
                callback.isLoading = false;
            }
            return callback;
        }

        function createTexture(texture, context) {

            var TextureMinificationFilter = Cesium.TextureMinificationFilter;
            var TextureWrap = Cesium.TextureWrap;

            var sampler = texture.sampler;

            var mipmap = sampler.minificationFilter === TextureMinificationFilter.NEAREST_MIPMAP_NEAREST || sampler.minificationFilter === TextureMinificationFilter.NEAREST_MIPMAP_LINEAR || sampler.minificationFilter === TextureMinificationFilter.LINEAR_MIPMAP_NEAREST || sampler.minificationFilter === TextureMinificationFilter.LINEAR_MIPMAP_LINEAR;
            var requiresNpot = mipmap || sampler.wrapS === TextureWrap.REPEAT || sampler.wrapS === TextureWrap.MIRRORED_REPEAT || sampler.wrapT === TextureWrap.REPEAT || sampler.wrapT === TextureWrap.MIRRORED_REPEAT;

            var source = texture.source;
            var npot = !CesiumMath.isPowerOfTwo(source.width) || !CesiumMath.isPowerOfTwo(source.height);

            if (requiresNpot && npot) {
                // WebGL requires power-of-two texture dimensions for mipmapping and REPEAT/MIRRORED_REPEAT wrap modes.
                var canvas = document.createElement('canvas');
                canvas.width = CesiumMath.nextPowerOfTwo(source.width);
                canvas.height = CesiumMath.nextPowerOfTwo(source.height);
                var canvasContext = canvas.getContext('2d');
                canvasContext.drawImage(source, 0, 0, source.width, source.height, 0, 0, canvas.width, canvas.height);
                source = canvas;
            }

            var tx;

            if (texture.target === WebGLConstants.TEXTURE_2D) {
                tx = new Texture({
                    context: context,
                    source: source,
                    width: texture.width,
                    height: texture.height,
                    pixelFormat: texture.internalFormat,
                    pixelDatatype: texture.type,
                    sampler: sampler,
                    flipY: texture.flipY
                });
            }
            // GLTF_SPEC: Support TEXTURE_CUBE_MAP.  https://github.com/KhronosGroup/glTF/issues/40

            if (mipmap) {
                tx.generateMipmap();
            }

            return tx;
        }
        var WebGLConstants = Cesium.WebGLConstants;
        function onTextureImageLoaded(image, item) {
            var tex;
            if (defined(image.internalFormat)) {
                tex = new Texture({
                    context: frameState.context,
                    pixelFormat: image.internalFormat,
                    width: image.width,
                    height: image.height,
                    source: {
                        arrayBufferView: image.bufferView
                    },
                    flipY: item.flipY
                });
            } else {
                var format = Cesium.WebGLConstants.RGB;
                if (image instanceof HTMLCanvasElement || image instanceof HTMLVideoElement || image.src && image.src.toLocaleLowerCase().indexOf(".png") >= 0) {
                    format = Cesium.WebGLConstants.RGBA;
                }
                if (item.sampler) {
                    tex = createTexture({
                        context: frameState.context,
                        source: image,
                        target: WebGLConstants.TEXTURE_2D,
                        width: item.width,
                        height: item.height,
                        pixelFormat: format,
                        flipY: item.flipY,
                        sampler: new Cesium.Sampler(item.sampler)
                    }, frameState.context);
                } else {
                    tex = new Texture({
                        context: frameState.context,
                        source: image,
                        target: WebGLConstants.TEXTURE_2D,
                        width: item.width,
                        height: item.height,
                        pixelFormat: format,
                        flipY: Cesium.defined(item.flipY) ? item.flipY : true
                    });
                }
            }
            return tex;
        }

        function getTextureCallback(item) {

            var callback = function callback() {

                var cacheKey = typeof item.value == 'string' ? item.value : null;
                if (!cacheKey) {
                    if (item.value instanceof HTMLImageElement || item.value instanceof HTMLCanvasElement || item.value instanceof HTMLVideoElement) {
                        if (!item.value.uuid) {
                            item.value.uuid = item.uuid;
                        }
                        cacheKey = item.value.uuid;
                    }
                }

                if (!that._textureCache[cacheKey] || item.needsUpdate) {

                    if (item.value instanceof HTMLImageElement || item.value instanceof HTMLCanvasElement || item.value instanceof HTMLVideoElement) {
                        var image = item.value;
                        if (!item.value.id) {
                            item.value.id = item.uuid;
                        }
                        that._textureCache[cacheKey] = onTextureImageLoaded(image, item);

                        if (item.onDispose) {
                            item.onDispose(function () {
                                if (that._textureCache[cacheKey]) {
                                    that._textureCache[cacheKey].destroy();
                                    delete that._textureCache[cacheKey];
                                }
                            });
                        }
                        item.needsUpdate = false;
                        return that._textureCache[cacheKey];
                    } else {
                        if (typeof item.value === "string" && !callback.isLoading) {
                            callback.isLoading = true;
                            item.needsUpdate = false;
                            var url = item.value.toLocaleLowerCase();

                            var extension = _Path2.default.GetExtension(url).slice(1);
                            if (extension == 'tif') {
                                //处理tif纹理

                                loadArrayBuffer(url).then(function (imageArrayBuffer) {
                                    var tiffParser = new _tiff2.default();
                                    var tiffCanvas = tiffParser.parseTIFF(imageArrayBuffer);
                                    if (that._textureCache[cacheKey]) {
                                        that._textureCache[cacheKey].destroy && that._textureCache[cacheKey].destroy();
                                    }
                                    that._textureCache[cacheKey] = onTextureImageLoaded(tiffCanvas, item);
                                    if (item.onDispose) {
                                        item.onDispose(function () {
                                            if (that._textureCache[cacheKey]) {
                                                that._textureCache[cacheKey].destroy();
                                                delete that._textureCache[cacheKey];
                                            }
                                        });
                                    }
                                    callback.isLoading = false;
                                }).otherwise(function (err) {
                                    console.log(err);
                                });
                            } else {
                                loadImage(item.value).then(function (image) {
                                    if (that._textureCache[cacheKey]) {
                                        that._textureCache[cacheKey].destroy && that._textureCache[cacheKey].destroy();
                                    }
                                    that._textureCache[cacheKey] = onTextureImageLoaded(image, item);
                                    if (item.onDispose) {
                                        item.onDispose(function () {
                                            if (that._textureCache[cacheKey]) {
                                                that._textureCache[cacheKey].destroy();
                                                delete that._textureCache[cacheKey];
                                            }
                                        });
                                    }
                                    callback.isLoading = false;
                                }).otherwise(function (err) {
                                    console.log(err);
                                });
                            }
                        }

                        if (!that.defaultTextureImage) {
                            that.defaultTextureImage = document.createElement("canvas");
                            that.defaultTextureImage.width = 1;
                            that.defaultTextureImage.height = 1;
                        }
                        if (!that.defaultTexture) {
                            that.defaultTexture = new Texture({
                                context: frameState.context,
                                source: that.defaultTextureImage
                            });
                        }

                        return that.defaultTexture;
                    }
                } else {
                    return that._textureCache[cacheKey];
                }
            };

            return callback;
        }

        if (material.uniforms) {
            var setUniformCallbackFunc = function setUniformCallbackFunc(name, item) {

                if (item !== undefined && item !== null) {
                    //item may be 0
                    var isImageUrl = typeof item.value === "string";
                    var isCssColorString = typeof item.value === "string";
                    if (typeof item.value === "string") {
                        var itemLowerCase = item.value.toLocaleLowerCase();
                        if (itemLowerCase.endsWith(".png") || itemLowerCase.endsWith(".jpg") || itemLowerCase.endsWith(".bmp") || itemLowerCase.endsWith(".gif") || itemLowerCase.endsWith(".tif") || itemLowerCase.endsWith(".tiff") || itemLowerCase.startsWith("data:")) {
                            isImageUrl = true;
                            isCssColorString = false;
                        } else {
                            try {
                                Cesium.Color.fromCssColorString(item.value);
                                isImageUrl = true;
                                isCssColorString = false;
                            } catch (e) {
                                isImageUrl = false;
                                isCssColorString = false;
                            }
                        }
                    }

                    if (item.value instanceof Cesium.Cartesian2 || item.value instanceof Cesium.Cartesian3 || item.value instanceof Cesium.Cartesian4 || item.value instanceof Cesium.Color || item.value instanceof Cesium.Matrix4 || item.value instanceof Cesium.Matrix3 || item.value instanceof Cesium.Matrix2 || item.value instanceof Cesium.Texture || typeof item.value === "number" || typeof item.value === "boolean" || isCssColorString || item.isColor || item.isCartesian2 || item.isCartesian3 || item.isCartesian4 || item.value instanceof Cesium.Texture || item.value instanceof Array && (typeof item.value[0] === 'number' || item.value[0] instanceof Cesium.Cartesian2 || item.value[0] instanceof Cesium.Cartesian3 || item.value[0] instanceof Cesium.Cartesian4)) {
                        if (!that._uniformValueCache) {
                            that._uniformValueCache = {};
                        }
                        that._uniformValueCache[item.uuid] = item;
                        if (isCssColorString) {
                            item.value = Cesium.Color.fromCssColorString(item.value);
                        }
                        uniformMap[name] = function () {
                            return that._uniformValueCache[item.uuid].value;
                        };
                        if (item.onDispose) {
                            item.onDispose(function () {
                                if (that._uniformValueCache[item.uuid]) {
                                    delete that._uniformValueCache[item.uuid];
                                }
                            });
                        }
                    } else if (item.value instanceof Array && item.value.length == 6) {
                        uniformMap[name] = getCubeTextureCallback(name, item);
                    } else if (isImageUrl || item.value instanceof HTMLImageElement || item.value instanceof HTMLCanvasElement || item.value instanceof HTMLVideoElement) {
                        uniformMap[name] = getTextureCallback(item, material);
                    } else if (item.value instanceof _FramebufferTexture2.default) {
                        if (!that._renderToTextureCommands) {
                            that._renderToTextureCommands = [];
                        }
                        if (!that._framebufferTextures[item.uuid]) {
                            that._framebufferTextures[item.uuid] = item;
                        }
                        uniformMap[name] = function () {
                            if (!that._framebufferTextures[item.uuid] || !that._framebufferTextures[item.uuid].value.texture) {
                                return frameState.context.defaultTexture;
                            }
                            return that._framebufferTextures[item.uuid].value.texture;
                        };
                    }
                }
            };

            var uniforms = material.uniforms;
            for (var name in uniforms) {

                if (uniforms.hasOwnProperty(name) && Cesium.defined(uniforms[name].value) && uniforms[name].value != null) {
                    if (Array.isArray(uniforms[name].value) && uniforms[name].value.length == 0) {
                        continue;
                    }
                    var item = uniforms[name];
                    if (item == undefined || item == null) {
                        continue;
                    }
                    setUniformCallbackFunc(name, item);
                }
            }
        }

        return this._uniformMaps[material.uuid];
    },
    /**
    *
    *@param {Cesium.Geometry} geometry
    *@param {Cesium.Material} material
    *@return {String}
    *@private  
    */
    getVertexShaderSource: function getVertexShaderSource(mesh, material) {
        var geometry = mesh.geometry;
        function getAttributeDefineBlok(userDefine) {
            var glsl = "";

            var attrs = geometry.attributes;
            for (var name in attrs) {

                if (attrs.hasOwnProperty(name)) {
                    var attr = attrs[name];
                    if (attr) {

                        var type = null;
                        switch (attr.componentsPerAttribute) {
                            case 1:
                                type = "float";
                                break;
                            case 2:
                                type = "vec2";
                                break;
                            case 3:
                                type = "vec3";
                                break;
                            case 4:
                                type = "vec4";
                                break;
                            default:
                        }

                        if (type) {
                            if (userDefine.indexOf("attribute " + type + " " + name) >= 0) {
                                continue;
                            }
                            glsl += "attribute " + type + " " + name + ";\n";
                        }
                    }
                }
            }
            return glsl;
        }

        var uniforms = "\n\
        uniform mat4 modelViewMatrix;\n\
        uniform mat4 viewMatrix;\n\
        uniform mat4 modelMatrix;\n\
        uniform mat4 projectionMatrix;\n\
        uniform mat3 normalMatrix;\n\
        uniform mat4 u_modelViewMatrix;\n\
        uniform mat4 u_viewMatrix;\n\
        uniform mat4 u_modelMatrix;\n\
        uniform mat4 u_projectionMatrix;\n\
        uniform mat3 u_normalMatrix;\n\
        uniform vec3 cameraPosition;\n\
        uniform vec3 u_cameraPosition;\n";

        var innerUniforms = [mesh._instances && mesh._instances.length > 0 ? 'mat4 modelViewMatrix' : "uniform mat4 modelViewMatrix", mesh._instances && mesh._instances.length > 0 ? 'mat4 modelMatrix' : "uniform mat4 modelMatrix", "uniform mat4 projectionMatrix", "uniform mat3 normalMatrix", mesh._instances && mesh._instances.length > 0 ? 'mat4 u_modelViewMatrix' : "uniform mat4 u_modelViewMatrix", mesh._instances && mesh._instances.length > 0 ? 'mat4 u_modelMatrix' : "uniform mat4 u_modelMatrix", "uniform mat4 u_projectionMatrix", "uniform mat3 u_normalMatrix", "uniform mat4 u_viewMatrix", "uniform mat4 viewMatrix", "uniform vec3 cameraPosition", "uniform vec3 u_cameraPosition"];
        if (material.vertexShader) {
            uniforms = "";
            innerUniforms.forEach(function (item) {
                if (material.vertexShader.indexOf(item) < 0) {
                    uniforms += item + ";\n";
                }
            });
            var vs = getAttributeDefineBlok(material.vertexShader) + uniforms + material.vertexShader;

            vs = _ShaderChunk2.default.parseIncludes(vs);

            return vs;
        } else {
            throw new Error("material.vertexShader 是必须参数");
        }
    },
    /**
     * 
     *@param {Cesium.Material} material
     *@return {String} 
     *@private
     */
    getFragmentShaderSource: function getFragmentShaderSource(material) {

        if (material.fragmentShader) {
            var fs = _ShaderChunk2.default.parseIncludes(material.fragmentShader);
            return fs;
        } else {
            throw new Error("material.fragmentShader 是必须参数");
        }
    }
};

MeshVisualizer.prototype._computeModelMatrix = function (mesh, frameState) {
    if (mesh._actualMesh) {
        mesh = mesh._actualMesh;
    }
    var that = this;
    if (mesh instanceof _LOD2.default || mesh instanceof _ReferenceMesh2.default || typeof mesh.update === 'function') {
        if (mesh.parent) {
            if (mesh.parent == that) {
                mesh.update(that._actualModelMatrix, frameState);
            } else if (mesh.parent.modelMatrix) {
                mesh.update(mesh.parent.modelMatrix, frameState);
            } else {
                mesh.update(that._actualModelMatrix, frameState);
            }
        } else {
            mesh.update(that._actualModelMatrix, frameState);
        }
    } else {
        var position = mesh.position;
        if (mesh.parent instanceof _LOD2.default) {
            Matrix4.clone(mesh.parent.modelMatrix, mesh.modelMatrix);
        } else if (mesh._modelMatrixNeedsUpdate) {
            var rotation = mesh.quaternion ? mesh.quaternion : mesh.rotation;

            if (mesh.parent && mesh.parent.modelMatrix) {

                var actualModelMatrix = mesh.parent.modelMatrix ? mesh.parent.modelMatrix : mesh._drawCommand.modelMatrix;
                _RendererUtils2.default.computeModelMatrix(actualModelMatrix, mesh.position, rotation, mesh.scale, mesh.modelMatrix);
            } else {
                _RendererUtils2.default.computeModelMatrix(that._actualModelMatrix, mesh.position, rotation, mesh.scale, mesh.modelMatrix);
            }

            mesh._modelMatrixNeedsUpdate = false;
        }
    }
};
/**
*
*@param {Cesium.FrameState}frameState
*/
MeshVisualizer.prototype.update = function (frameState) {
    if (!this._scene) {
        this._scene = frameState.camera._scene;
    }
    if (!this._ready || !this.show && this._chidren.length > 0) {
        //如果未准备好则不加入渲染队列
        return;
    }
    this.beforeUpdate.raiseEvent(frameState);

    var that = this;
    var wireframeChanged = false;
    var sysWireframe = frameState.camera._scene._globe._surface.tileProvider._debug.wireframe;
    if (this.debug) {
        sysWireframe = true;
    }

    if (sysWireframe != this._isWireframe) {
        wireframeChanged = true;
    }
    if (this._modelMatrixNeedsUpdate) {
        this._actualModelMatrix = _RendererUtils2.default.computeModelMatrix(this._modelMatrix, this._position, this._rotation, this._scale, this._actualModelMatrix);
        if (this._up && this._up.y) {
            this._actualModelMatrix = _RendererUtils2.default.yUp2Zup(this._actualModelMatrix, this._actualModelMatrix);
        }
        Cesium.Cartesian3.clone(this._scale, this._oldScale);
        Cesium.Cartesian3.clone(this._position, this._oldPosition);
        this._modelMatrixNeedsUpdate = false;
    }

    MeshVisualizer.traverse(this, function (mesh) {
        if (!mesh.show) return;

        if (mesh._instances && mesh._instances.length) {
            mesh._availableInstances = mesh._availableInstances || [];
            mesh._availableInstances.splice(0);

            if (!mesh.geometry.boundingSphere) {
                mesh.geometry.boundingSphere = Cesium.BoundingSphere.fromVertices(mesh.geometry.attributes.position.values);
            }

            mesh._instances.forEach(function (instance) {
                if (!instance.show) return;
                Matrix4.getTranslation(instance.modelMatrix, instance.boundingSphere.center);
                instance.boundingSphere.radius = mesh.geometry.boundingSphere.radius;
                var intersect = frameState.cullingVolume.computeVisibility(instance.boundingSphere);
                if (intersect != Cesium.Intersect.OUTSIDE) {
                    mesh._availableInstances.push(instance);
                }
            });
            if (mesh._availableInstances.length == 0) return;
        }

        if (_MeshUtils2.default.isMesh3js(mesh)) {
            var needsUpdate = !mesh._actualMesh || mesh.needsUpdate || mesh.geometry.needsUpdate;

            if (needsUpdate) {
                mesh._actualMesh = _MeshUtils2.default.fromMesh3js(mesh);
                mesh.modelMatrixNeedsUpdate = true;
            } else {
                for (var pn in mesh.geometry.attributes) {
                    if (mesh.geometry.attributes.hasOwnProperty(pn)) {
                        mesh._actualMesh.geometry.attributes[pn].needsUpdate = mesh.geometry.attributes[pn].needsUpdate;
                    }
                }
                var index = mesh.geometry.index;
                if (index && index.needsUpdate) {
                    mesh._actualMesh.geometry.needsUpdate = true;
                }
            }

            mesh._actualMesh.quaternion = Cesium.Quaternion.clone(mesh.quaternion);
            mesh._actualMesh.position = mesh.position;
            mesh._actualMesh.scale = mesh.scale;
            mesh._actualMesh.modelMatrixNeedsUpdate = mesh.modelMatrixNeedsUpdate;
            mesh = mesh._actualMesh;
            _MaterialUtils2.default.updateMaterialFrom3js(mesh.material);
        }

        that._computeModelMatrix(mesh, frameState);

        if (typeof mesh.update !== 'function') {
            if (frameState.passes.pick && !mesh.material.allowPick) {
                return;
            }

            if (!mesh._drawCommand || mesh.needsUpdate || mesh.geometry.needsUpdate || wireframeChanged) {
                //重新构建绘图命令，比如geometry完全不同于之前一帧 或者顶点和索引数量都发生改变等时，执行这段

                if (sysWireframe || mesh.material.wireframe) {
                    that.toWireframe(mesh.geometry);
                } else {
                    that.restoreFromWireframe(mesh.geometry);
                }

                if (mesh._drawCommand) mesh._drawCommand.destroy();
                mesh._drawCommand = that.createDrawCommand(mesh, frameState);

                mesh.needsUpdate = false;
                mesh.geometry.needsUpdate = false;
            } else {
                //在不需要重新构建绘图命令时，检查各个属性和索引是否需要更新，需要则将更新相应的缓冲区

                //更新属性缓冲区
                for (var name in mesh.geometry.attributes) {
                    if (mesh.geometry.attributes.hasOwnProperty(name)) {
                        if (mesh.geometry.attributes[name] && mesh.geometry.attributes[name].needsUpdate) {
                            var attrLocation = mesh._drawCommand.vertexArray._attributeLocations[name];
                            var vb = mesh._drawCommand.vertexArray._attributes[attrLocation].vertexBuffer;
                            var arrayView = mesh.geometry.attributes[name].values;
                            var gl = vb._gl;
                            var target = vb._bufferTarget;
                            gl.bindBuffer(target, vb._buffer);
                            gl.bufferData(target, arrayView, BufferUsage.STATIC_DRAW);
                            gl.bindBuffer(target, null);

                            // vb.copyFromArrayView(mesh.geometry.attributes[name].values, 0);
                        }
                    }
                }
                //更新索引缓冲区
                if (mesh.geometry.indexNeedsUpdate) {
                    var vb = mesh._drawCommand.vertexArray.indexBuffer;
                    var gl = vb._gl;
                    var target = vb._bufferTarget;
                    gl.bindBuffer(target, vb._buffer);
                    gl.bufferData(target, mesh.geometry.indices, BufferUsage.STATIC_DRAW);
                    gl.bindBuffer(target, null);
                    mesh.geometry.indexNeedsUpdate = false;
                    // vb.copyFromArrayView(mesh.geometry.indices, 0);
                }

                if (mesh._instances && mesh._instances.length) {
                    updateVertexBuffer(mesh, frameState.context);
                }
            }

            mesh._drawCommand.modelMatrix = mesh.modelMatrix;

            if (mesh._instances && mesh._instances.length) {
                mesh._drawCommand.boundingVolume = mesh._boundingSphere;
                mesh._drawCommand.instanceCount = mesh._availableInstances.length;
                mesh._pickCommand && (mesh._pickCommand.instanceCount = mesh._availableInstances.length);
            } else {
                if (!mesh._drawCommand.boundingVolume) {
                    if (!mesh.geometry.boundingSphere) {
                        mesh.geometry.boundingSphere = Cesium.BoundingSphere.fromVertices(mesh.geometry.attributes.position.values);
                    }
                    mesh._drawCommand.boundingVolume = Cesium.BoundingSphere.clone(mesh.geometry.boundingSphere);
                }
                Cesium.Matrix4.getTranslation(mesh.modelMatrix, mesh._drawCommand.boundingVolume.center);
            }
            mesh._pickCommand.boundingVolume = mesh._drawCommand.boundingVolume;

            mesh._drawCommand.uniformMap = that.getUniformMap(mesh.material, frameState);
            if (frameState.passes.pick) {

                var command = mesh._pickCommand;
                frameState.commandList.push(command);
            } else {
                mesh.material._renderStateOptions.depthTest.enabled = mesh.material.depthTest;
                mesh._drawCommand.renderState = RenderState.fromCache(mesh.material._renderStateOptions);
                // mesh._drawCommand.renderState.depthTest.enabled = mesh.material.depthTest;

                mesh._drawCommand.shaderProgram = mesh._drawCommand._sp;
                frameState.commandList.push(mesh._drawCommand);
            }
        } else {
            mesh.needsUpdate = false;
        }
    }, true);

    //执行帧缓冲绘图命令
    for (var i in that._framebufferTextures) {
        if (that._framebufferTextures.hasOwnProperty(i)) {
            var item = that._framebufferTextures[i].value;
            that.updateFrameBufferTexture(frameState, item);
        }
    }

    this._isWireframe = sysWireframe;
    wireframeChanged = false;
    this._modelMatrixNeedsUpdate = false;
    this._geometryChanged = false;
};

///////2020.04.20  --start


/**
*单独渲染frameBufferTexture中的mesh，最终更新frameBufferTexture中的texture
*@param {Cesium.FrameState}frameState
*@param {Cesium.FramebufferTexture}frameBufferTexture
@param {{x:number,y:number,width:number,height:number}}viewport
*/
MeshVisualizer.prototype.initFrameBufferTexture = function (frameState, frameBufferTexture, viewport) {
    var that = this;

    var item = frameBufferTexture;
    if (item instanceof _FramebufferTexture2.default) {

        item.drawCommands = [];
        MeshVisualizer.traverse(item.mesh, function (mesh) {
            if (_MeshUtils2.default.isMesh3js(mesh)) {
                var needsUpdate = !mesh._actualMesh || mesh.needsUpdate || mesh.geometry.needsUpdate;

                if (needsUpdate) {
                    mesh._actualMesh = _MeshUtils2.default.fromMesh3js(mesh);
                }
                if (!needsUpdate) {
                    for (var pn in mesh.geometry.attributes) {
                        if (mesh.geometry.attributes.hasOwnProperty(pn)) {
                            mesh._actualMesh.geometry[pn].needsUpdate = mesh.geometry.attributes[pn].needsUpdate;
                        }
                    }
                    var index = mesh.geometry.getIndex();
                    if (index && index.needsUpdate) {
                        mesh._actualMesh.geometry.needsUpdate = true;
                    }
                }

                mesh._actualMesh.quaternion = Cesium.Quaternion.clone(mesh.quaternion);
                mesh._actualMesh.position = mesh.position;
                mesh._actualMesh.scale = mesh.scale;
                mesh._actualMesh.modelMatrixNeedsUpdate = mesh.modelMatrixNeedsUpdate;
                mesh = mesh._actualMesh;
                _MaterialUtils2.default.updateMaterialFrom3js(mesh.material);
            }
            that._computeModelMatrix(mesh, frameState);

            if (!mesh._textureCommand || mesh.needsUpdate || mesh.geometry.needsUpdate) {
                if (mesh.material.wireframe) {
                    that.toWireframe(mesh.geometry);
                } else {
                    that.restoreFromWireframe(mesh.geometry);
                }

                mesh._textureCommand = that.createDrawCommand(mesh, frameState);
                //mesh._textureCommand.boundingVolume = mesh.geometry.boundingSphere;
                mesh.needsUpdate = false;
                mesh.material.needsUpdate = false;
            } else {
                //在不需要重新构建绘图命令时，检查各个属性和索引是否需要更新，需要则将更新相应的缓冲区

                var vaNeedsUpdate = false;
                //更新属性缓冲区
                for (var name in mesh.geometry.attributes) {
                    if (mesh.geometry.attributes.hasOwnProperty(name) && mesh.geometry.attributes[name]) {

                        if (mesh.geometry.attributes[name] && mesh.geometry.attributes[name].needsUpdate) {
                            var attrLocation = mesh._textureCommand.vertexArray._attributeLocations[name];
                            var vb = mesh._textureCommand.vertexArray._attributes[attrLocation].vertexBuffer;
                            var arrayView = mesh.geometry.attributes[name].values;
                            var gl = vb._gl;
                            if (vb._sizeInBytes == arrayView * arrayView.constructor.BYTES_PER_ELEMENT) {
                                var target = vb._bufferTarget;
                                gl.bindBuffer(target, vb._buffer);
                                gl.bufferData(target, arrayView, BufferUsage.STATIC_DRAW);
                                gl.bindBuffer(target, null);
                            } else {
                                vaNeedsUpdate = true;
                                break;
                            }

                            //vb.copyFromArrayView(mesh.geometry.attributes[name].values, 0);
                        }
                    }
                }

                //更新索引缓冲区
                if (!vaNeedsUpdate && mesh.geometry.indexNeedsUpdate) {

                    var arrayBufferView = mesh.geometry.indices;

                    var vb = mesh._textureCommand.vertexArray.indexBuffer;
                    if (vb._sizeInBytes != arrayBufferView.length * arrayBufferView.constructor.BYTES_PER_ELEMENT) {
                        vb.destroy();
                        var buffer = Buffer.createIndexBuffer({
                            context: frameState.context,
                            typedArray: arrayBufferView,
                            usage: BufferUsage.STATIC_DRAW,
                            indexDatatype: arrayBufferView instanceof Uint16Array ? Cesium.IndexDatatype.UNSIGNED_SHORT : Cesium.IndexDatatype.UNSIGNED_INT
                        });
                        mesh._textureCommand.vertexArray._indexBuffer = buffer;
                    } else {
                        var gl = vb._gl;
                        var target = vb._bufferTarget;
                        gl.bindBuffer(target, vb._buffer);
                        gl.bufferData(target, arrayBufferView, BufferUsage.STATIC_DRAW);
                        gl.bindBuffer(target, null);
                    }

                    mesh.geometry.indexNeedsUpdate = false;
                }

                if (vaNeedsUpdate) {
                    var command = mesh._textureCommand;
                    var attributeLocations = command.vertexArray._attributeLocations;
                    var vertexArrayAttributes = command._cacehVertexArrayAttributes;
                    command.vertexArray.destroy();
                    command.vertexArray = VertexArray.fromGeometry({
                        context: frameState.context,
                        geometry: mesh.geometry,
                        attributeLocations: attributeLocations,
                        bufferUsage: BufferUsage.STATIC_DRAW,

                        vertexArrayAttributes: vertexArrayAttributes
                    });
                    if (vertexArrayAttributes && vertexArrayAttributes.length) {
                        command._cacehVertexArrayAttributes = vertexArrayAttributes.map(function (a) {
                            return a;
                        });
                    }
                    command.vertexArray._attributeLocations = attributeLocations;

                    for (var name in mesh.geometry.attributes) {
                        if (mesh.geometry.attributes.hasOwnProperty(name) && mesh.geometry.attributes[name]) {
                            mesh.geometry.attributes[name].needsUpdate = false;
                        }
                    }
                }
            }

            mesh._textureCommand.modelMatrix = mesh.modelMatrix;

            var context = frameState.context;
            var drawingBufferWidth = context.drawingBufferWidth;
            var drawingBufferHeight = context.drawingBufferHeight;
            var fbNeedsUpdate = false;

            if (!item.texture || item.texture.width != drawingBufferWidth || item.texture.height != drawingBufferHeight) {
                var notFullScreen = item._notFullScreen || Cesium.defined(item.texture);
                if (!notFullScreen) {
                    item.texture = new Texture({
                        context: context,
                        width: drawingBufferWidth,
                        height: drawingBufferHeight,
                        pixelFormat: PixelFormat.RGBA
                        // ,pixelDatatype:PixelDatatype.FLOAT
                    });
                    fbNeedsUpdate = true;
                }
                item._notFullScreen = notFullScreen;
            }
            if (!item.depthTexture || item.depthTexture.width != item.texture.width || item.depthTexture.height != item.texture.height) {
                item.depthTexture = new Cesium.Texture({
                    context: context,
                    width: item.texture.width,
                    height: item.texture.height,
                    pixelFormat: Cesium.PixelFormat.DEPTH_COMPONENT,
                    pixelDatatype: Cesium.PixelDatatype.UNSIGNED_SHORT
                });
                fbNeedsUpdate = true;
            }
            if (!item.framebuffer || fbNeedsUpdate) {
                item.framebuffer = new Cesium.Framebuffer({
                    context: context,
                    colorTextures: [item.texture],
                    destroyAttachments: false,
                    depthTexture: item.depthTexture
                });
            }

            mesh.material._renderStateOptions.depthTest.enabled = mesh.material.depthTest;
            //mesh._textureCommand.renderState.depthTest.enabled = mesh.depthTest;
            if (viewport) {
                mesh.material._renderStateOptions.viewport = viewport;
            }
            mesh._textureCommand.renderState = RenderState.fromCache(mesh.material._renderStateOptions);

            item.drawCommands.push(mesh._textureCommand);
        }, true);
    }
};

/**
*单独渲染frameBufferTexture中的mesh，最终更新frameBufferTexture中的texture
*@param {Cesium.FrameState}frameState
*@param {Cesium.FramebufferTexture}frameBufferTexture
@param {{x:number,y:number,width:number,height:number}}viewport
*/
MeshVisualizer.prototype.updateFrameBufferTexture = function (frameState, frameBufferTexture, viewport) {
    this.initFrameBufferTexture(frameState, frameBufferTexture, viewport);
    var item = frameBufferTexture;
    if (item.drawCommands && item.drawCommands.length > 0) {
        // item.depthTexture = RendererUtils.renderToTexture(item.drawCommands, frameState, item.texture, item.depthTexture);
        _RendererUtils2.default.renderToTexture(item.drawCommands, frameState, item.framebuffer);

        for (var i = 0; i < item.drawCommands.length; i++) {

            item.drawCommands[i]._renderStateOptions.viewport = void 0;
            item.drawCommands[i].renderState = RenderState.fromCache(item.drawCommands[i]._renderStateOptions);
        }
    }
    if (!frameBufferTexture.ready) {
        frameBufferTexture.ready = true;
        frameBufferTexture.readyPromise.resolve(frameBufferTexture);
    }
};

/**
*单独渲染frameBufferTexture中的mesh，最终更新frameBufferTexture中的texture，并读取缓冲区的像素,可以用于实现并行计算(参看MeshVisualizer.prototype.compute)
*@param {Cesium.FrameState}frameState
*@param {Cesium.FramebufferTexture}frameBufferTexture
*@param {Object}[viewport] 可选，视口设置
*@param {Number}viewport.x 视口位置x坐标（屏幕坐标系，左上角为原点）
*@param {Number}viewport.y 视口位置y坐标（屏幕坐标系，左上角为原点）
*@param {Number}viewport.width 视口宽度
*@param {Number}viewport.height 视口高度
*@param {Cesium.PixelDatatype}[viewport.pixelDatatype=Cesium.PixelDatatype.UNSIGNED_BYTE] 输出数据中像素值的rgba各项的数据类型，注意：有的移动设备不支持浮点型 
*@param {Object}[readState] 可选，读取设置
*@param {Number}readState.x 读取区域位置x坐标（屏幕坐标系，左上角为原点）
*@param {Number}readState.y 读取区域位置y坐标（屏幕坐标系，左上角为原点）
*@param {Number}readState.width 读取区域宽度
*@param {Number}readState.height 读取区域高度
*@param {Cesium.PixelDatatype}[readState.pixelDatatype=Cesium.PixelDatatype.UNSIGNED_BYTE] 输出数据中像素值的rgba各项的数据类型，注意：有的移动设备不支持浮点型 
*@param {Array.<Number>}outputPixels 
*@return {Array.<Number>}outputPixels  输出的像素
*/
MeshVisualizer.prototype.getPixels = function (frameState, frameBufferTexture, viewport, readState, pixels) {
    viewport = viewport ? viewport : {};
    viewport.x = viewport.x ? viewport.x : 0;
    viewport.y = viewport.y ? viewport.y : 0;
    if (!viewport.width) {
        viewport.width = frameState.context._canvas.width;
    }
    if (!viewport.height) {
        viewport.height = frameState.context._canvas.height;
    }

    this.initFrameBufferTexture(frameState, frameBufferTexture, viewport);
    var item = frameBufferTexture;
    if (item.drawCommands && item.drawCommands.length > 0) {
        if (!item._computeTexture || item._computeTexture && (item._computeTexture.width != viewport.width || item._computeTexture.height != viewport.height)) {
            var pixelDatatype = viewport.pixelDatatype;
            var pixelFormat = viewport.pixelFormat;
            if (pixelDatatype == Cesium.PixelDatatype.FLOAT && !frameState.context._gl.getExtension('OES_texture_float')) {
                throw new Cesium.DeveloperError("此设备不支持浮点型纹理");
            }
            if (item._computeTexture) {
                item._computeTexture.destroy();
                item._computeTexture = null;
            }
            item._computeTexture = new Cesium.Texture({
                context: frameState.context,
                width: viewport.width,
                height: viewport.height,
                pixelFormat: pixelFormat, //PixelFormat.RGBA,
                pixelDatatype: pixelDatatype
            });
        }

        pixels = _RendererUtils2.default.renderToPixels(item.drawCommands, frameState, item._computeTexture, readState ? readState : viewport, pixels);
        for (var i = 0; i < item.drawCommands.length; i++) {
            item.drawCommands[i].renderState.viewport = void 0;
        }
        return pixels;
    } else {
        return null;
    }
};
///////2020.04.20  --end

/**
*
*@param {Cesium.Mesh}mesh
*/
MeshVisualizer.prototype.add = function (mesh) {
    this._chidren.push(mesh);
};

/**
*
*/
MeshVisualizer.prototype.destroy = function () {
    this._ready = false;
    MeshVisualizer.traverse(this, function (mesh) {
        if (mesh._drawCommand) {
            delete mesh._drawCommand;
        }
    }, false);
    for (var i in this._uniformValueCache) {
        if (this._uniformValueCache.hasOwnProperty(i)) {
            delete this._uniformValueCache[i];
        }
    }
    for (var i in this._textureCache) {
        if (this._textureCache.hasOwnProperty(i)) {
            delete this._textureCache[i];
        }
    }
    for (var i in this._uniformMaps) {
        if (this._uniformMaps.hasOwnProperty(i)) {
            delete this._uniformMaps[i];
        }
    }
    for (var i in this._framebufferTextures) {
        if (this._framebufferTextures.hasOwnProperty(i)) {
            delete this._framebufferTextures[i];
        }
    }
    this._uniformValueCache = {};
    this._textureCache = {};
    this._uniformMaps = {};
    this._framebufferTextures = {};
    if (this._pickIds) {
        for (i = 0; i < this._pickIds.length; ++i) {
            this._pickIds[i].destroy && this._pickIds[i].destroy();
        }
    }
};

/**
*
*遍历节点
*@param {Cesium.MeshVisualizer|Cesium.Mesh}root
*@param {Cesium.MeshVisualizer~TraverseCallback}traverseFunc 访问每个节点时回调该函数，进行相关操作。回调函数包含一个参数，traverseArgs，其中封装了一个属性cancelCurrent，可以通过改变此属性达到终止遍历当前节点的子节点
*@param {Boolean}visibleOnly visibleOnly为true时仅遍历可见的节点，如果父级节点不可见则不再访问其子节点
*/
MeshVisualizer.traverse = function (node, traverseFunc, visibleOnly, scratchTraverseArgs) {
    if (!node) {
        return;
    }
    if (!scratchTraverseArgs) {
        scratchTraverseArgs = {
            cancelCurrent: false,
            cancelAll: false
        };
    }
    scratchTraverseArgs.cancelCurrent = false;
    if (visibleOnly && !node.show && !node.visible) {
        return;
    }
    if (node.geometry && node.material || node instanceof _LOD2.default || node instanceof _ReferenceMesh2.default) {
        traverseFunc(node, scratchTraverseArgs);
    }

    if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
            if (scratchTraverseArgs.cancelCurrent) {
                continue;
            }
            if (scratchTraverseArgs.cancelAll) {
                break;
            }
            MeshVisualizer.traverse(node.children[i], traverseFunc, visibleOnly, scratchTraverseArgs);
        }
    }
};

/**
*
*@Cesium.MeshVisualizer~TraverseCallback
*@param {Cesium.Mesh|Cesium.LOD|Cesium.MeshVisualizer|Object}node
*@param {Object}traverseArgs
*@param {Boolean}traverseArgs.cancelCurrent 为true时终止遍历当前节点的子节点
*@param {Boolean}traverseArgs.cancelAll 为true时终止遍历，退出遍历循环
*/

Object.defineProperties(MeshVisualizer.prototype, {
    scene: {
        set: function set(val) {
            this._scene = val;
        },
        get: function get() {
            return this._scene;
        }
    },
    frameState: {
        get: function get() {
            if (!this._scene) {
                return undefined;
            }
            return this._scene.frameState;
        }
    },
    modelMatrixNeedsUpdate: {
        get: function get() {
            return this._modelMatrixNeedsUpdate;
        },
        set: function set(val) {
            this._modelMatrixNeedsUpdate = val;
            if (val) {
                MeshVisualizer.traverse(this, function (child) {
                    child._modelMatrixNeedsUpdate = val;
                }, false);
            }
        }
    },
    showReference: {
        get: function get() {
            return this.referenceMesh.show;
        },
        set: function set(val) {
            this.referenceMesh.show = val;
        }
    },
    children: {
        get: function get() {
            return this._chidren;
        },
        set: function set(val) {
            this._chidren = val;
        }
    },
    show: {
        get: function get() {
            return this._show;
        },
        set: function set(val) {
            this._show = val;
        }
    },
    debug: {
        get: function get() {
            return this._debug;
        },
        set: function set(val) {
            this._debug = val;
        }
    },
    ready: {
        get: function get() {
            return this._ready;
        }
    },
    modelMatrix: {
        get: function get() {
            return this._modelMatrix;
        },
        set: function set(val) {
            this._modelMatrix = val;
            this._modelMatrixNeedsUpdate = true;
        }
    },
    rotation: {
        get: function get() {
            return this._rotation;
        },
        set: function set(val) {
            if (val != this._rotation) {
                this._rotation = val;
                this._needUpdate = true;
            }
            this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged);
            this._rotation = val;
            this._rotation.paramChanged.addEventListener(this._onNeedUpdateChanged);
        }
    },
    position: {
        get: function get() {
            return this._position;
        },
        set: function set(val) {
            if (val.x != this._position.x || val.y != this._position.y || val.z != this._position.z) {
                this._position = val;
                this._modelMatrixNeedsUpdate = true;
            }
            this._position = val;
        }
    },
    scale: {
        get: function get() {
            return this._scale;
        },
        set: function set(val) {
            if (val.x != this._scale.x || val.y != this._scale.y || val.z != this._scale.z) {
                this._scale = val;
                this._modelMatrixNeedsUpdate = true;
            }
            this._scale = val;
        }
    }
});
exports.default = MeshVisualizer;

},{"../ThirdParty/tiff-js/tiff.js":33,"../Util/Path.js":35,"./FramebufferTexture.js":4,"./LOD.js":6,"./MaterialUtils.js":7,"./MeshMaterial.js":9,"./MeshUtils.js":11,"./ReferenceMesh.js":15,"./RendererUtils.js":16,"./Rotation.js":17,"./ShaderUtils.js":18,"./Shaders/ShaderChunk.js":19}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BasicGeometry = require('./BasicGeometry.js');

var _BasicGeometry2 = _interopRequireDefault(_BasicGeometry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
*
* :
*
*                       -----width----+(width/2,height/2)
*                       |             |
*                       |    (0,0)    |
*                       |      +    height
*                       |             |
*                       |             |
*                        +----width-----
*        (-width/2,-height/2)
*    
*@param {Number}width
*@param {Number}height
*@param {Number}widthSegments
*@param {Number}heightSegments
*@constructor
*@memberof Cesium
*/
function PlaneBufferGeometry(width, height, widthSegments, heightSegments) {
    this.width = width;
    this.height = height;
    this.widthSegments = widthSegments;
    this.heightSegments = heightSegments;
}

/**
*
*@param {}
*/
PlaneBufferGeometry.createGeometry = function (planeBufferGeometry) {

    var width = planeBufferGeometry.width,
        height = planeBufferGeometry.height,
        widthSegments = planeBufferGeometry.widthSegments,
        heightSegments = planeBufferGeometry.heightSegments;

    width = width || 1;
    height = height || 1;

    var width_half = width / 2;
    var height_half = height / 2;

    var gridX = Math.floor(widthSegments) || 1;
    var gridY = Math.floor(heightSegments) || 1;

    var gridX1 = gridX + 1;
    var gridY1 = gridY + 1;

    var segment_width = width / gridX;
    var segment_height = height / gridY;

    var ix, iy;

    // buffers

    var indices = [];
    var vertices = [];
    var normals = [];
    var uvs = [];

    // generate vertices, normals and uvs

    for (iy = 0; iy < gridY1; iy++) {

        var y = iy * segment_height - height_half;

        for (ix = 0; ix < gridX1; ix++) {

            var x = ix * segment_width - width_half;

            vertices.push(x, -y, 0);

            normals.push(0, 0, 1);

            uvs.push(ix / gridX);
            uvs.push(1 - iy / gridY);
        }
    }

    // indices

    for (iy = 0; iy < gridY; iy++) {

        for (ix = 0; ix < gridX; ix++) {

            var a = ix + gridX1 * iy;
            var b = ix + gridX1 * (iy + 1);
            var c = ix + 1 + gridX1 * (iy + 1);
            var d = ix + 1 + gridX1 * iy;

            // faces

            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }

    var geom = _BasicGeometry2.default.createGeometry({
        positions: new Float32Array(vertices),
        normals: new Float32Array(normals),
        uvs: new Float32Array(uvs),
        indices: new Int32Array(indices)
    });

    return geom;
};

exports.default = PlaneBufferGeometry;

},{"./BasicGeometry.js":2}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
*:
*
*       p1------------p4
*       |          +  |
*       |       +     |
*       |     +       |
*       |   +         |
*       | +           |
*       p2------------p3
*    
*@param {Object}options 
*@param {Array<Number|Cesium.Cartesian3>}options.positions [p1,p2,p3,p4]或者[p1.x,p1.y,p1.z,p2.x,...,p4.z] 
*
*@property {Array<Number|Cesium.Cartesian3>}positions 
*
*@constructor
*@memberof Cesium
*/
function PlaneGeometry(options) {
    //positions, widthSegments, heightSegments) {
    this.type = 'PlaneGeometry';
    if (!options || !options.positions) {
        throw new Error("缺少positions参数");
    }
    if (options.positions.length != 4 && options.positions.length / 3 != 4) {
        throw new Error("positions参数必须包含四个顶点的位置坐标");
    }
    this.positions = options.positions;
}
/**
*
*@param {Cesium.PlaneGeometry}
*@return {Cesium.Geometry}
*/
PlaneGeometry.createGeometry = function (planeGeometry) {
    var positions = planeGeometry.positions;

    var positionsVal;
    if (Array.isArray(positions)) {
        if (positions[0] instanceof Cesium.Cartesian3) {
            positionsVal = new Float32Array(12);
            for (var i = 0; i < positions.length; i++) {
                var p = positions[i];
                positionsVal[i * 3] = p.x;
                positionsVal[i * 3 + 1] = p.y;
                positionsVal[i * 3 + 2] = p.z;
            }
        } else if (typeof positions[0] === 'number') {
            positionsVal = new Float32Array(positionsVal);
        } else {
            throw new Error("positions参数有误");
        }
    } else {
        throw new Error("positions参数必须是数组类型");
    }
    var indices = new Int32Array([0, 1, 3, 1, 2, 3]);
    var attributes = {
        position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: positions
        })
    };
    var bs = Cesium.BoundingSphere.fromVertices(positions);
    var geo = new Cesium.Geometry({
        attributes: attributes,
        indices: new Int32Array(indices),
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: bs
    });
    return geo;
};
exports.default = PlaneGeometry;

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ArrowGeometry = require('./ArrowGeometry.js');

var _ArrowGeometry2 = _interopRequireDefault(_ArrowGeometry);

var _Mesh = require('./Mesh.js');

var _Mesh2 = _interopRequireDefault(_Mesh);

var _MeshMaterial = require('./MeshMaterial.js');

var _MeshMaterial2 = _interopRequireDefault(_MeshMaterial);

var _Rotation = require('./Rotation.js');

var _Rotation2 = _interopRequireDefault(_Rotation);

var _RendererUtils = require('./RendererUtils.js');

var _RendererUtils2 = _interopRequireDefault(_RendererUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultValue;
/**
*
*@param {Object}[options]   
*@param {Cesium.ArrowGeometry}[options.axisParameter]
*@param {Boolean}[options.show=true]  
*@param {Cesium.Cartesian3}[options.position]
*@param {Cesium.VolumeRendering.Rotation}[options.rotation]
*@param {Cesium.Cartesian3}[options.scale]    
* 
*@property {Boolean}show  
*@property {Cesium.Cartesian3}position
*@property {Cesium.Rotation}rotation
*@property {Cesium.Cartesian3}scale   
*@property {Boolean}needUpdate
*
*@constructor
*@memberof Cesium 
*/
function ReferenceMesh(options) {
    defaultValue = defaultValue || Cesium.defaultValue;
    options = Cesium.defaultValue(options, {});
    this._axisParameter = new _ArrowGeometry2.default(options.axisParameter);
    this._axisParameterY = new _ArrowGeometry2.default(options.axisParameter);
    this._axisParameterY.reverse = true;

    var materialZ = new _MeshMaterial2.default({
        defaultColor: "rgba(255,0,0,1)",
        wireframe: false,
        side: _MeshMaterial2.default.Sides.DOUBLE,
        translucent: false

    });
    var materialY = new _MeshMaterial2.default({
        defaultColor: "rgba(0,255,0,1)",
        wireframe: false,
        side: _MeshMaterial2.default.Sides.DOUBLE,
        translucent: true

    });
    var materialX = new _MeshMaterial2.default({
        defaultColor: "rgba(0,0,255,1)",
        wireframe: false,
        side: _MeshMaterial2.default.Sides.DOUBLE,
        translucent: false

    });

    var axisLine = _ArrowGeometry2.default.createGeometry(new _ArrowGeometry2.default(this._axisParameter));
    var axisLineY = _ArrowGeometry2.default.createGeometry(new _ArrowGeometry2.default(this._axisParameterY));

    var meshZ = new _Mesh2.default(axisLine, materialZ);
    var meshY = new _Mesh2.default(axisLineY, materialY);
    var meshX = new _Mesh2.default(axisLine, materialX);
    meshZ.position.z = this._axisParameter.length / 2;

    meshY.position.y = -this._axisParameter.length / 2;
    meshY.rotation.axis.y = 1;
    meshY.rotation.angle = -180;

    meshX.position.x = this._axisParameter.length / 2;
    meshX.rotation.axis.x = 1;
    meshX.rotation.angle = -180;

    meshX.parent = this;
    meshY.parent = this;
    meshZ.parent = this;

    this._children = [meshX, meshY, meshZ];
    this.x = meshX;
    this.y = meshY;
    this.z = meshZ;

    this.uuid = Cesium.createGuid();
    this.show = defaultValue(options.show, true);
    this._position = defaultValue(options.position, new Cesium.Cartesian3(0, 0, 0));
    this._scale = defaultValue(options.scale, new Cesium.Cartesian3(1, 1, 1));
    this._rotation = defaultValue(options.rotation, { axis: new Cesium.Cartesian3(0, 0, 1), angle: 0 });
    this._rotation = new _Rotation2.default(this._rotation.axis, this._rotation.angle);
    this._needsUpdate = true;
    this._modelMatrixNeedsUpdate = true;
    this._modelMatrix = new Cesium.Matrix4();
    Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY, this._modelMatrix);

    this._onNeedUpdateChanged = function () {
        this._modelMatrixNeedsUpdate = true;
    };
    this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged);
    this._parent = null;
}
function removeByValue(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            arr.splice(i, 1);
            break;
        }
    }
}
Object.defineProperties(ReferenceMesh.prototype, {
    modelMatrix: {
        get: function get() {
            return this._modelMatrix;
        }
    },
    parent: {
        get: function get() {
            return this._parent;
        },
        set: function set(val) {
            if (val && (val._children && Array.isArray(val._children) || val.children && Array.isArray(val.children))) {

                if (this._parent && this._parent != val) {
                    var children = this._parent._children ? this._parent._children : this._parent.children;
                    if (Array.isArray(children)) {
                        removeByValue(children, this);
                    }
                }
                this._parent = val;
                if (typeof this._parent.add === 'function') {
                    this._parent.add(this);
                } else {
                    var children = val._children ? val._children : val.children;
                    children.push(this);
                }
            }
            this.modelMatrixNeedsUpdate = true;
        }
    },
    modelMatrixNeedsUpdate: {
        get: function get() {
            return this._modelMatrixNeedsUpdate;
        },
        set: function set(val) {
            this._modelMatrixNeedsUpdate = val;
            if (this._modelMatrixNeedsUpdate) {
                _Mesh2.default.traverse(this, function (mesh) {
                    mesh._modelMatrixNeedsUpdate = val;
                });
            }
        }
    },
    children: {
        get: function get() {
            return this._children;
        }
    },
    needsUpdate: {
        get: function get() {
            return this._needsUpdate;
        },
        set: function set(val) {
            this._needsUpdate = val;
        }
    },
    rotation: {
        get: function get() {
            return this._rotation;
        },
        set: function set(val) {
            if (val != this._rotation) {
                this._rotation = val;
                this.modelMatrixNeedsUpdate = true;
            }
            this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged);
            this._rotation = val;
            this._rotation.paramChanged.addEventListener(this._onNeedUpdateChanged);
        }
    },
    position: {
        get: function get() {
            return this._position;
        },
        set: function set(val) {
            if (val.x != this._position.x || val.y != this._position.y || val.z != this._position.z) {
                this._position = val;
                this.modelMatrixNeedsUpdate = true;
            }
            this._position = val;
        }
    },
    scale: {
        get: function get() {
            return this._scale;
        },
        set: function set(val) {
            if (val.x != this._scale.x || val.y != this._scale.y || val.z != this._scale.z) {
                this._scale = val;
                this.modelMatrixNeedsUpdate = true;
            }
            this._scale = val;
        }
    }
});

/**
*
*@param {Cesium.Matrix4}meshVisulizerModelMatrix
*@param {Cesium.FrameState}frameState
*/
ReferenceMesh.prototype.update = function (parentModelMatrix, frameState) {

    if (this._modelMatrixNeedsUpdate || this._needsUpdate) {

        _RendererUtils2.default.computeModelMatrix(parentModelMatrix, this.position, this.rotation, this.scale, this.modelMatrix);

        this._modelMatrixNeedsUpdate = false;
    }
};

exports.default = ReferenceMesh;

},{"./ArrowGeometry.js":1,"./Mesh.js":8,"./MeshMaterial.js":9,"./RendererUtils.js":16,"./Rotation.js":17}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});


var yUpToZUp, scratchTranslation, scratchQuaternion, scratchScale, scratchTranslationQuaternionRotationScale, clearCommandScratch;

/**
*
*@constructor
*@memberof Cesium
*/
function RendererUtils() {}
/**
*使用帧缓冲技术，执行渲染命令，渲染到纹理  
*@param {Cesium.DrawCommand|Array<Cesium.DrawCommand>}drawCommand 渲染命令（集合）
*@param {Cesium.FrameState}frameState 帧状态对象，可以从Cesium.Scene中获取
*@param {Cesium.Texture}outpuTexture 将渲染到的目标纹理对象
*@param {Cesium.Texture}[outputDepthTexture] 可选，输出的深度纹理
*/
RendererUtils.renderToTexture = function (drawCommand, frameState, outputTexture, outputDepthTexture) {
    var drawCommands = Array.isArray(drawCommand) ? drawCommand : [drawCommand];
    var context = frameState.context;

    var framebuffer = null,
        destroy = false;
    if (outputTexture instanceof Cesium.Framebuffer) {
        framebuffer = outputTexture;
    }
    if (!framebuffer) {
        if (!outputDepthTexture || outputDepthTexture.width != outputTexture.width || outputDepthTexture.height != outputTexture.height) {
            outputDepthTexture = new Cesium.Texture({
                context: context,
                width: outputTexture.width,
                height: outputTexture.height,
                pixelFormat: Cesium.PixelFormat.DEPTH_COMPONENT,
                pixelDatatype: Cesium.PixelDatatype.UNSIGNED_SHORT
            });
        }
        framebuffer = new Cesium.Framebuffer({
            context: context,
            colorTextures: [outputTexture],
            destroyAttachments: false,
            depthTexture: outputDepthTexture
        });
        destroy = true;
    }
    if (!clearCommandScratch) {
        clearCommandScratch = new Cesium.ClearCommand({
            color: new Cesium.Color(0.0, 0.0, 0.0, 0.0)
        });
    }
    var clearCommand = clearCommandScratch;
    clearCommand.framebuffer = framebuffer;
    clearCommand.renderState = frameState.renderState;
    clearCommand.execute(context);

    drawCommands.forEach(function (drawCommand) {
        drawCommand.framebuffer = framebuffer;
        drawCommand.execute(context);
    });
    if (destroy) {
        framebuffer.destroy();
    }
};

/**
*使用帧缓冲技术，执行渲染命令，渲染到纹理并读取像素值，可以用于实现并行计算  
*@param {Cesium.DrawCommand|Array<Cesium.DrawCommand>}drawCommand 渲染命令（集合）
*@param {Cesium.FrameState}frameState 帧状态对象，可以从Cesium.Scene中获取
*@param {Cesium.Texture}outpuTexture 将渲染到的目标纹理对象
*@param {Object}[options] 
*@param {Array.<Number>}outputPixels 
*@return {Array.<Number>}outputPixels  输出的像素
*/
RendererUtils.renderToPixels = function (drawCommand, frameState, outputTexture, options, pixels) {
    var drawCommands = Array.isArray(drawCommand) ? drawCommand : [drawCommand];
    var context = frameState.context;

    var framebuffer = null,
        destroy = false;
    if (outputTexture instanceof Cesium.Framebuffer) {
        framebuffer = outputTexture;
    }

    if (!framebuffer) {

        var outputDepthTexture = new Cesium.Texture({
            context: context,
            width: outputTexture.width,
            height: outputTexture.height,
            pixelFormat: Cesium.PixelFormat.DEPTH_COMPONENT,
            pixelDatatype: Cesium.PixelDatatype.UNSIGNED_SHORT
        });

        framebuffer = new Cesium.Framebuffer({
            context: context,
            colorTextures: [outputTexture],
            depthTexture: context.depthTexture ? outputDepthTexture : undefined,
            destroyAttachments: false
        });
        destroy = true;
    }
    if (!clearCommandScratch) {
        clearCommandScratch = new Cesium.ClearCommand({
            color: new Cesium.Color(0.0, 0.0, 0.0, 0.0)
        });
    }
    var clearCommand = clearCommandScratch;
    clearCommand.framebuffer = framebuffer;
    clearCommand.renderState = frameState.renderState;
    clearCommand.execute(context);

    drawCommands.forEach(function (drawCommand) {
        drawCommand.framebuffer = framebuffer;
        drawCommand.execute(context);
    });
    options = options ? options : {};

    pixels = RendererUtils.readPixels(frameState, Object.assign(options, {
        framebuffer: framebuffer
    }), pixels);
    delete options.framebuffer;
    if (destroy) {
        framebuffer.destroy();
    }
    return pixels;
};

var scratchBackBufferArray;

/**
 * Validates a framebuffer.
 * Available in debug builds only.
 * @private
 */
function validateFramebuffer(context) {
    //>>includeStart('debug', pragmas.debug);
    if (context.validateFramebuffer) {
        var gl = context._gl;
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            var message;

            switch (status) {
                case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                    message = 'Framebuffer is not complete.  Incomplete attachment: at least one attachment point with a renderbuffer or texture attached has its attached object no longer in existence or has an attached image with a width or height of zero, or the color attachment point has a non-color-renderable image attached, or the depth attachment point has a non-depth-renderable image attached, or the stencil attachment point has a non-stencil-renderable image attached.  Color-renderable formats include GL_RGBA4, GL_RGB5_A1, and GL_RGB565. GL_DEPTH_COMPONENT16 is the only depth-renderable format. GL_STENCIL_INDEX8 is the only stencil-renderable format.';
                    break;
                case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                    message = 'Framebuffer is not complete.  Incomplete dimensions: not all attached images have the same width and height.';
                    break;
                case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                    message = 'Framebuffer is not complete.  Missing attachment: no images are attached to the framebuffer.';
                    break;
                case gl.FRAMEBUFFER_UNSUPPORTED:
                    message = 'Framebuffer is not complete.  Unsupported: the combination of internal formats of the attached images violates an implementation-dependent set of restrictions.';
                    break;
            }

            throw new DeveloperError(message);
        }
    }
    //>>includeEnd('debug');
}
function bindFramebuffer(context, framebuffer) {
    if (framebuffer !== context._currentFramebuffer) {
        // this check must use typeof, not defined, because defined doesn't work with undeclared variables.
        if (typeof WebGLRenderingContext !== 'undefined') {
            scratchBackBufferArray = [Cesium.WebGLConstants.BACK];
        }
        context._currentFramebuffer = framebuffer;
        var buffers = scratchBackBufferArray;

        if (Cesium.defined(framebuffer)) {
            framebuffer._bind();
            validateFramebuffer(context);

            // TODO: Need a way for a command to give what draw buffers are active.
            buffers = framebuffer._getActiveColorAttachments();
        } else {
            var gl = context._gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        if (context.drawBuffers) {
            context.glDrawBuffers(buffers);
        }
    }
}
//var pixels;
var scratchPixelFormat;
var scratchPixelDatatype;
/**
 * @param {Cesium.FrameState}frameState
 * @param {Object}[readState]
 * @param {number}readState.x
 * @param {number}readState.y
 * @param {number}readState.width
 * @param {number}readState.height
 * @param {Cesium.PixelDatatype}readState.pixelDatatype
 * @param {Cesium.PixelFormat}readState.pixelFormat
 * @param {ArrayBufferView}pixels
 * @return {ArrayBufferView}
 */
RendererUtils.readPixels = function (frameState, readState, pixels) {
    var gl = frameState.context._gl;

    readState = readState || {};
    var x = Math.max(readState.x || 0, 0);
    var y = Math.max(readState.y || 0, 0);
    var width = readState.width || gl.drawingBufferWidth;
    var height = readState.height || gl.drawingBufferHeight;
    var pixelDatatype = readState.pixelDatatype || Cesium.PixelDatatype.UNSIGNED_BYTE;
    var pixelFormat = readState.pixelFormat || Cesium.PixelFormat.RGBA;
    var framebuffer = readState.framebuffer;

    if (width <= 0) {
        throw new Cesium.DeveloperError('readState.width must be greater than zero.');
    }

    if (height <= 0) {
        throw new Cesium.DeveloperError('readState.height must be greater than zero.');
    }

    bindFramebuffer(this, framebuffer);
    var size = 4;
    if (pixelFormat == Cesium.PixelFormat.RGB) {
        size = 3;
    } else if (pixelFormat == Cesium.PixelFormat.ALPHA) {
        size = 1;
    }

    if (!pixels) {
        //|| pixels.length !== size * width * height
        //|| scratchPixelFormat != pixelFormat || scratchPixelDatatype != pixelDatatype) {

        if (pixelDatatype == Cesium.PixelDatatype.FLOAT) {
            pixelDatatype = gl.FLOAT;
            pixels = new Float32Array(size * width * height);
        } else if (pixelDatatype == Cesium.PixelDatatype.UNSIGNED_BYTE) {
            pixels = new Uint8Array(size * width * height);
        } else {
            pixels = new Uint16Array(size * width * height);
        }
    }
    gl.readPixels(x, y, width, height, pixelFormat, pixelDatatype, pixels);
    scratchPixelFormat = pixelFormat;
    scratchPixelDatatype = pixelDatatype;
    return pixels;
};

/**
*
*@param {Cesium.Matrix4}srcMatrix
*@param {Cesium.Matrix4}dstMatrix
*@return {Cesium.Matrix4}
*/
RendererUtils.yUp2Zup = function (srcMatrix, dstMatrix) {
    if (!yUpToZUp) {
        yUpToZUp = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationX(Cesium.Math.PI_OVER_TWO));
    }
    return Cesium.Matrix4.multiplyTransformation(srcMatrix, yUpToZUp, dstMatrix);
};
/**
*平移、旋转或缩放，返回计算之后的模型转换矩阵
*@param {Cesium.Cartesian3}[translation=undefined]
*@param {Object}[rotation=undefined] 旋转参数
*@param {Cesium.Cartesian3}[rotation.axis] 旋转轴
*@param {Number}[rotation.angle] 旋转角度
*@param {Cesium.Cartesian3}[rotation.scale] 缩放
*@param {Cesium.Matrix4}[outModelMatrix] 计算结果矩阵，和返回值一样，但是传递此参数时则返回值不是新创建的Cesium.Matrix4实例
*@return {Cesium.Matrix4}
*/
RendererUtils.computeModelMatrix = function (srcModelMatrix, translation, rotation, scale, outModelMatrix) {
    if (arguments.length == 0) {
        return srcModelMatrix;
    }
    if (!scratchTranslation) scratchTranslation = new Cesium.Cartesian3();
    if (!scratchQuaternion) scratchQuaternion = new Cesium.Quaternion();
    if (!scratchScale) scratchScale = new Cesium.Cartesian3();
    if (!scratchTranslationQuaternionRotationScale) scratchTranslationQuaternionRotationScale = new Cesium.Matrix4();

    var Matrix4 = Cesium.Matrix4;
    if (!outModelMatrix) {
        outModelMatrix = new Matrix4();
    }
    Matrix4.clone(srcModelMatrix, outModelMatrix);

    if (!translation) {
        scratchTranslation.x = 0;
        scratchTranslation.y = 0;
        scratchTranslation.z = 0;
    }
    scratchTranslation.x = translation.x;
    scratchTranslation.y = translation.y;
    scratchTranslation.z = translation.z;

    if (!scale) {
        scratchScale.x = 0;
        scratchScale.y = 0;
        scratchScale.z = 0;
    }
    scratchScale.x = scale.x;
    scratchScale.y = scale.y;
    scratchScale.z = scale.z;

    if (rotation instanceof Cesium.Quaternion) {
        Cesium.Quaternion.clone(rotation, scratchQuaternion);
    } else {
        var axis = rotation.axis;
        var angle = rotation.angle;
        Cesium.Quaternion.fromAxisAngle(new Cesium.Cartesian3(axis.x, axis.y, axis.z), //axis.y=1 y是旋转轴
        Cesium.Math.toRadians(angle), scratchQuaternion);
    }

    //translate,rotate,scale

    Matrix4.fromTranslationQuaternionRotationScale(scratchTranslation, scratchQuaternion, scratchScale, scratchTranslationQuaternionRotationScale);

    Matrix4.multiplyTransformation(outModelMatrix, scratchTranslationQuaternionRotationScale, outModelMatrix);
    return outModelMatrix;
};

exports.default = RendererUtils;

},{}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
*
*@param {Cesium.Cartesian3}axis 旋转轴
*@param {Number}angle 旋转角度
*
*@property {Cesium.Cartesian3}axis 旋转轴
*@property {Number}angle 旋转角度
*@property {Cesium.Event}paramChanged  
*@constructor
*@memberof Cesium
*/
function Rotation(axis, angle) {
    this._axis = axis;
    this._angle = angle;
    this.paramChanged = new Cesium.Event();
}
Object.defineProperties(Rotation.prototype, {
    axis: {
        set: function set(val) {
            if (val.x != this._axis.x || val.y != this._axis.y || val.z != this._axis.z) {
                this._axis = val;
                this.paramChanged.raiseEvent();
            }
            this._axis = val;
        },
        get: function get() {
            return this._axis;
        }
    },
    angle: {
        set: function set(val) {
            if (val != this._angle) {
                this._angle = val;
                this.paramChanged.raiseEvent();
            }
            this._angle = val;
        },
        get: function get() {
            return this._angle;
        }
    }
});

exports.default = Rotation;

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
*
*@memberof Cesium
*@constructor
*/
function ShaderUtils() {}

/**
*
*
*/
ShaderUtils.processShader3js = function (material3js, shader) {
    var program = new WebGLProgram(material3js, shader);
    return program;
};

if (typeof THREE != 'undefined') {
    var getTextureEncodingFromMap = function getTextureEncodingFromMap(map, gammaOverrideLinear) {

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
    };

    var getParameters = function getParameters(material) {
        //, lights, fog, nClipPlanes, nClipIntersection, object) {

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

        var currentRenderTarget = null; // renderer.getCurrentRenderTarget();
        var renderer = {};
        var parameters = {

            shaderID: shaderID,

            precision: "high", //precision,
            supportsVertexTextures: true, // capabilities.vertexTextures,
            outputEncoding: getTextureEncodingFromMap(!currentRenderTarget ? null : currentRenderTarget.texture, renderer.gammaOutput),
            map: !!material.map,
            mapEncoding: getTextureEncodingFromMap(material.map, renderer.gammaInput),
            envMap: !!material.envMap,
            envMapMode: material.envMap && material.envMap.mapping,
            envMapEncoding: getTextureEncodingFromMap(material.envMap, renderer.gammaInput),
            envMapCubeUV: !!material.envMap && (material.envMap.mapping === CubeUVReflectionMapping || material.envMap.mapping === CubeUVRefractionMapping),
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

            fog: false, //!!fog,
            useFog: material.fog,
            fogExp: false, //(fog && fog.isFogExp2),

            flatShading: material.shading === FlatShading,

            sizeAttenuation: material.sizeAttenuation,
            logarithmicDepthBuffer: false, // capabilities.logarithmicDepthBuffer,

            skinning: material.skinning,
            //maxBones: maxBones,
            //useVertexTexture: capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture,

            morphTargets: material.morphTargets,
            morphNormals: material.morphNormals,
            //maxMorphTargets: renderer.maxMorphTargets,
            //maxMorphNormals: renderer.maxMorphNormals,

            numDirLights: 0, // lights.directional.length,
            numPointLights: 0, // lights.point.length,
            numSpotLights: 0, // lights.spot.length,
            numRectAreaLights: 0, // lights.rectArea.length,
            numHemiLights: 0, // lights.hemi.length,

            numClippingPlanes: 0, //nClipPlanes,
            numClipIntersection: 0, //nClipIntersection,

            //shadowMapEnabled:  renderer.shadowMap.enabled && object.receiveShadow && lights.shadows.length > 0,
            //shadowMapType: renderer.shadowMap.type,

            //toneMapping: renderer.toneMapping,
            //physicallyCorrectLights: renderer.physicallyCorrectLights,

            premultipliedAlpha: material.premultipliedAlpha,

            alphaTest: material.alphaTest,
            doubleSided: material.side === DoubleSide,
            flipSided: material.side === BackSide,

            depthPacking: material.depthPacking !== undefined ? material.depthPacking : false

        };

        return parameters;
    };

    var getEncodingComponents = function getEncodingComponents(encoding) {

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
    };

    var getTexelDecodingFunction = function getTexelDecodingFunction(functionName, encoding) {

        var components = getEncodingComponents(encoding);
        return "vec4 " + functionName + "( vec4 value ) {  return " + components[0] + "ToLinear" + components[1] + " ; }";
    };

    var getTexelEncodingFunction = function getTexelEncodingFunction(functionName, encoding) {

        var components = getEncodingComponents(encoding);
        return "vec4 " + functionName + "( vec4 value ) { return LinearTo" + components[0] + components[1] + " ; }";
    };

    var getToneMappingFunction = function getToneMappingFunction(functionName, toneMapping) {

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
    };

    var generateExtensions = function generateExtensions(extensions, parameters, rendererExtensions) {

        extensions = extensions || {};

        var chunks = [extensions.derivatives || parameters.envMapCubeUV || parameters.bumpMap || parameters.normalMap || parameters.flatShading ? '#extension GL_OES_standard_derivatives : enable' : '', (extensions.fragDepth || parameters.logarithmicDepthBuffer) && rendererExtensions.get('EXT_frag_depth') ? '#extension GL_EXT_frag_depth : enable' : '', extensions.drawBuffers && rendererExtensions.get('WEBGL_draw_buffers') ? '#extension GL_EXT_draw_buffers : require' : '', (extensions.shaderTextureLOD || parameters.envMap) && rendererExtensions.get('EXT_shader_texture_lod') ? '#extension GL_EXT_shader_texture_lod : enable' : ''];

        return chunks.filter(filterEmptyLine).join('\n');
    };

    var generateDefines = function generateDefines(defines) {

        var chunks = [];

        for (var name in defines) {

            var value = defines[name];

            if (value === false) continue;

            chunks.push('#define ' + name + ' ' + value);
        }

        return chunks.join('\n');
    };

    var filterEmptyLine = function filterEmptyLine(string) {

        return string !== '';
    };

    var replaceLightNums = function replaceLightNums(string, parameters) {

        return string.replace(/NUM_DIR_LIGHTS/g, parameters.numDirLights).replace(/NUM_SPOT_LIGHTS/g, parameters.numSpotLights).replace(/NUM_RECT_AREA_LIGHTS/g, parameters.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, parameters.numPointLights).replace(/NUM_HEMI_LIGHTS/g, parameters.numHemiLights);
    };

    var parseIncludes = function parseIncludes(string) {

        var pattern = /^[ \t]*#include +<([\w\d.]+)>/gm;

        function replace(match, include) {

            var replace = ShaderChunk[include];

            if (replace === undefined) {

                throw new Error('Can not resolve #include <' + include + '>');
            }

            return parseIncludes(replace);
        }

        return string.replace(pattern, replace);
    };

    var unrollLoops = function unrollLoops(string) {

        var pattern = /for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g;

        function replace(match, start, end, snippet) {

            var unroll = '';

            for (var i = parseInt(start); i < parseInt(end); i++) {

                unroll += snippet.replace(/\[ i \]/g, '[ ' + i + ' ]');
            }

            return unroll;
        }

        return string.replace(pattern, replace);
    };

    var _WebGLProgram = function _WebGLProgram(material, shader) {
        //, parameters) {

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

        var gammaFactorDefine = 1.0; // (renderer.gammaFactor > 0) ? renderer.gammaFactor : 1.0;


        // var customExtensions = generateExtensions(extensions, parameters, renderer.extensions);

        var customDefines = generateDefines(defines);

        var prefixVertex, prefixFragment;

        if (material.isRawShaderMaterial) {

            prefixVertex = [customDefines, '\n'].filter(filterEmptyLine).join('\n');

            prefixFragment = [

            //customExtensions,
            customDefines, '\n'].filter(filterEmptyLine).join('\n');
        } else {

            prefixVertex = [

            //'precision ' + parameters.precision + ' float;',
            //'precision ' + parameters.precision + ' int;',

            '#define SHADER_NAME ' + shader.name,

            //customDefines,

            parameters.supportsVertexTextures ? '#define VERTEX_TEXTURES' : '', '#define GAMMA_FACTOR ' + gammaFactorDefine, '#define MAX_BONES ' + parameters.maxBones,
            //(parameters.useFog && parameters.fog) ? '#define USE_FOG' : '',
            //(parameters.useFog && parameters.fogExp) ? '#define FOG_EXP2' : '',

            parameters.map ? '#define USE_MAP' : '', parameters.envMap ? '#define USE_ENVMAP' : '', parameters.envMap ? '#define ' + envMapModeDefine : '', parameters.lightMap ? '#define USE_LIGHTMAP' : '', parameters.aoMap ? '#define USE_AOMAP' : '', parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '', parameters.bumpMap ? '#define USE_BUMPMAP' : '', parameters.normalMap ? '#define USE_NORMALMAP' : '', parameters.displacementMap && parameters.supportsVertexTextures ? '#define USE_DISPLACEMENTMAP' : '', parameters.specularMap ? '#define USE_SPECULARMAP' : '', parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '', parameters.metalnessMap ? '#define USE_METALNESSMAP' : '', parameters.alphaMap ? '#define USE_ALPHAMAP' : '', parameters.vertexColors ? '#define USE_COLOR' : '', parameters.flatShading ? '#define FLAT_SHADED' : '', parameters.skinning ? '#define USE_SKINNING' : '', parameters.useVertexTexture ? '#define BONE_TEXTURE' : '', parameters.morphTargets ? '#define USE_MORPHTARGETS' : '', parameters.morphNormals && parameters.flatShading === false ? '#define USE_MORPHNORMALS' : '', parameters.doubleSided ? '#define DOUBLE_SIDED' : '', parameters.flipSided ? '#define FLIP_SIDED' : '', '#define NUM_CLIPPING_PLANES ' + parameters.numClippingPlanes, parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '', parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '', parameters.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '', parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
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

            '#ifdef USE_COLOR', '	attribute vec3 color;', '#endif', '#ifdef USE_MORPHTARGETS', '	attribute vec3 morphTarget0;', '	attribute vec3 morphTarget1;', '	attribute vec3 morphTarget2;', '	attribute vec3 morphTarget3;', '	#ifdef USE_MORPHNORMALS', '		attribute vec3 morphNormal0;', '		attribute vec3 morphNormal1;', '		attribute vec3 morphNormal2;', '		attribute vec3 morphNormal3;', '	#else', '		attribute vec3 morphTarget4;', '		attribute vec3 morphTarget5;', '		attribute vec3 morphTarget6;', '		attribute vec3 morphTarget7;', '	#endif', '#endif', '#ifdef USE_SKINNING', '	attribute vec4 skinIndex;', '	attribute vec4 skinWeight;', '#endif', '\n'].filter(filterEmptyLine).join('\n');

            prefixFragment = [

            //customExtensions,

            //'precision ' + parameters.precision + ' float;',
            //'precision ' + parameters.precision + ' int;',

            '#define SHADER_NAME ' + shader.name, customDefines, parameters.alphaTest ? '#define ALPHATEST ' + parameters.alphaTest : '', '#define GAMMA_FACTOR ' + gammaFactorDefine, parameters.useFog && parameters.fog ? '#define USE_FOG' : '', parameters.useFog && parameters.fogExp ? '#define FOG_EXP2' : '', parameters.map ? '#define USE_MAP' : '', parameters.envMap ? '#define USE_ENVMAP' : '', parameters.envMap ? '#define ' + envMapTypeDefine : '', parameters.envMap ? '#define ' + envMapModeDefine : '', parameters.envMap ? '#define ' + envMapBlendingDefine : '', parameters.lightMap ? '#define USE_LIGHTMAP' : '', parameters.aoMap ? '#define USE_AOMAP' : '', parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '', parameters.bumpMap ? '#define USE_BUMPMAP' : '', parameters.normalMap ? '#define USE_NORMALMAP' : '', parameters.specularMap ? '#define USE_SPECULARMAP' : '', parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '', parameters.metalnessMap ? '#define USE_METALNESSMAP' : '', parameters.alphaMap ? '#define USE_ALPHAMAP' : '', parameters.vertexColors ? '#define USE_COLOR' : '', parameters.gradientMap ? '#define USE_GRADIENTMAP' : '', parameters.flatShading ? '#define FLAT_SHADED' : '', parameters.doubleSided ? '#define DOUBLE_SIDED' : '', parameters.flipSided ? '#define FLIP_SIDED' : '', '#define NUM_CLIPPING_PLANES ' + parameters.numClippingPlanes, '#define UNION_CLIPPING_PLANES ' + (parameters.numClippingPlanes - parameters.numClipIntersection), parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '', parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '', parameters.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : '', parameters.physicallyCorrectLights ? "#define PHYSICALLY_CORRECT_LIGHTS" : '', parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
            //parameters.logarithmicDepthBuffer && renderer.extensions.get('EXT_frag_depth') ? '#define USE_LOGDEPTHBUF_EXT' : '',

            //parameters.envMap && renderer.extensions.get('EXT_shader_texture_lod') ? '#define TEXTURE_LOD_EXT' : '',

            'uniform mat4 viewMatrix;', 'uniform vec3 cameraPosition;',

            //(parameters.toneMapping !== THREE.NoToneMapping) ? "#define TONE_MAPPING" : '',
            //(parameters.toneMapping !== THREE.NoToneMapping) ? ShaderChunk['tonemapping_pars_fragment'] : '',  // this code is required here because it is used by the toneMapping() function defined below
            //(parameters.toneMapping !== THREE.NoToneMapping) ? getToneMappingFunction("toneMapping", parameters.toneMapping) : '',

            parameters.dithering ? '#define DITHERING' : '', parameters.outputEncoding || parameters.mapEncoding || parameters.envMapEncoding || parameters.emissiveMapEncoding ? ShaderChunk['encodings_pars_fragment'] : '', // this code is required here because it is used by the various encoding/decoding function defined below
            parameters.mapEncoding ? getTexelDecodingFunction('mapTexelToLinear', parameters.mapEncoding) : '', parameters.envMapEncoding ? getTexelDecodingFunction('envMapTexelToLinear', parameters.envMapEncoding) : '', parameters.emissiveMapEncoding ? getTexelDecodingFunction('emissiveMapTexelToLinear', parameters.emissiveMapEncoding) : '', parameters.outputEncoding ? getTexelEncodingFunction("linearToOutputTexel", parameters.outputEncoding) : '', parameters.depthPacking ? "#define DEPTH_PACKING " + material.depthPacking : '', '\n'].filter(filterEmptyLine).join('\n');
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
    };

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

    var parameterNames = ["precision", "supportsVertexTextures", "map", "mapEncoding", "envMap", "envMapMode", "envMapEncoding", "lightMap", "aoMap", "emissiveMap", "emissiveMapEncoding", "bumpMap", "normalMap", "displacementMap", "specularMap", "roughnessMap", "metalnessMap", "gradientMap", "alphaMap", "combine", "vertexColors", "fog", "useFog", "fogExp", "flatShading", "sizeAttenuation", "logarithmicDepthBuffer", "skinning", "maxBones", "useVertexTexture", "morphTargets", "morphNormals", "maxMorphTargets", "maxMorphNormals", "premultipliedAlpha", "numDirLights", "numPointLights", "numSpotLights", "numHemiLights", "numRectAreaLights", "shadowMapEnabled", "shadowMapType", "toneMapping", 'physicallyCorrectLights', "alphaTest", "doubleSided", "flipSided", "numClippingPlanes", "numClipIntersection", "depthPacking"];
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

    ;

    /**
     * @author mrdoob / http://mrdoob.com/
     */

    var programIdCount = 0;
}
exports.default = ShaderUtils;

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _none_frag = require('./none_frag.js');

var _none_frag2 = _interopRequireDefault(_none_frag);

var _none_vert = require('./none_vert.js');

var _none_vert2 = _interopRequireDefault(_none_vert);

var _normals_frag = require('./normals_frag.js');

var _normals_frag2 = _interopRequireDefault(_normals_frag);

var _normals_vert = require('./normals_vert.js');

var _normals_vert2 = _interopRequireDefault(_normals_vert);

var _texture_frag = require('./texture_frag.js');

var _texture_frag2 = _interopRequireDefault(_texture_frag);

var _texture_vert = require('./texture_vert.js');

var _texture_vert2 = _interopRequireDefault(_texture_vert);

var _texture_normals_frag = require('./texture_normals_frag.js');

var _texture_normals_frag2 = _interopRequireDefault(_texture_normals_frag);

var _texture_normals_vert = require('./texture_normals_vert.js');

var _texture_normals_vert2 = _interopRequireDefault(_texture_normals_vert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var alphamap_fragment = "#ifdef USE_ALPHAMAP\n\tdiffuseColor.a *= texture2D( alphaMap, vUv ).g;\n#endif\n";

var alphamap_pars_fragment = "#ifdef USE_ALPHAMAP\n\tuniform sampler2D alphaMap;\n#endif\n";

var alphatest_fragment = "#ifdef ALPHATEST\n\tif ( diffuseColor.a < ALPHATEST ) discard;\n#endif\n";

var aomap_fragment = "#ifdef USE_AOMAP\n\tfloat ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;\n\treflectedLight.indirectDiffuse *= ambientOcclusion;\n\t#if defined( USE_ENVMAP ) && defined( PHYSICAL )\n\t\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\t\treflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.specularRoughness );\n\t#endif\n#endif\n";

var aomap_pars_fragment = "#ifdef USE_AOMAP\n\tuniform sampler2D aoMap;\n\tuniform float aoMapIntensity;\n#endif";

var begin_vertex = "\nvec3 transformed = vec3( position );\n";

var beginnormal_vertex = "\nvec3 objectNormal = vec3( normal );\n";

var bsdfs = "float punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {\n\tif( decayExponent > 0.0 ) {\n#if defined ( PHYSICALLY_CORRECT_LIGHTS )\n\t\tfloat distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );\n\t\tfloat maxDistanceCutoffFactor = pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );\n\t\treturn distanceFalloff * maxDistanceCutoffFactor;\n#else\n\t\treturn pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );\n#endif\n\t}\n\treturn 1.0;\n}\nvec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {\n\treturn RECIPROCAL_PI * diffuseColor;\n}\nvec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {\n\tfloat fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );\n\treturn ( 1.0 - specularColor ) * fresnel + specularColor;\n}\nfloat G_GGX_Smith( const in float alpha, const in float dotNL, const in float dotNV ) {\n\tfloat a2 = pow2( alpha );\n\tfloat gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n\tfloat gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n\treturn 1.0 / ( gl * gv );\n}\nfloat G_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {\n\tfloat a2 = pow2( alpha );\n\tfloat gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n\tfloat gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n\treturn 0.5 / max( gv + gl, EPSILON );\n}\nfloat D_GGX( const in float alpha, const in float dotNH ) {\n\tfloat a2 = pow2( alpha );\n\tfloat denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;\n\treturn RECIPROCAL_PI * a2 / pow2( denom );\n}\nvec3 BRDF_Specular_GGX( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {\n\tfloat alpha = pow2( roughness );\n\tvec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );\n\tfloat dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );\n\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\tfloat dotNH = saturate( dot( geometry.normal, halfDir ) );\n\tfloat dotLH = saturate( dot( incidentLight.direction, halfDir ) );\n\tvec3 F = F_Schlick( specularColor, dotLH );\n\tfloat G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n\tfloat D = D_GGX( alpha, dotNH );\n\treturn F * ( G * D );\n}\nvec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {\n\tconst float LUT_SIZE  = 64.0;\n\tconst float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;\n\tconst float LUT_BIAS  = 0.5 / LUT_SIZE;\n\tfloat theta = acos( dot( N, V ) );\n\tvec2 uv = vec2(\n\t\tsqrt( saturate( roughness ) ),\n\t\tsaturate( theta / ( 0.5 * PI ) ) );\n\tuv = uv * LUT_SCALE + LUT_BIAS;\n\treturn uv;\n}\nfloat LTC_ClippedSphereFormFactor( const in vec3 f ) {\n\tfloat l = length( f );\n\treturn max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );\n}\nvec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {\n\tfloat x = dot( v1, v2 );\n\tfloat y = abs( x );\n\tfloat a = 0.86267 + (0.49788 + 0.01436 * y ) * y;\n\tfloat b = 3.45068 + (4.18814 + y) * y;\n\tfloat v = a / b;\n\tfloat theta_sintheta = (x > 0.0) ? v : 0.5 * inversesqrt( 1.0 - x * x ) - v;\n\treturn cross( v1, v2 ) * theta_sintheta;\n}\nvec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {\n\tvec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];\n\tvec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];\n\tvec3 lightNormal = cross( v1, v2 );\n\tif( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );\n\tvec3 T1, T2;\n\tT1 = normalize( V - N * dot( V, N ) );\n\tT2 = - cross( N, T1 );\n\tmat3 mat = mInv * transpose( mat3( T1, T2, N ) );\n\tvec3 coords[ 4 ];\n\tcoords[ 0 ] = mat * ( rectCoords[ 0 ] - P );\n\tcoords[ 1 ] = mat * ( rectCoords[ 1 ] - P );\n\tcoords[ 2 ] = mat * ( rectCoords[ 2 ] - P );\n\tcoords[ 3 ] = mat * ( rectCoords[ 3 ] - P );\n\tcoords[ 0 ] = normalize( coords[ 0 ] );\n\tcoords[ 1 ] = normalize( coords[ 1 ] );\n\tcoords[ 2 ] = normalize( coords[ 2 ] );\n\tcoords[ 3 ] = normalize( coords[ 3 ] );\n\tvec3 vectorFormFactor = vec3( 0.0 );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );\n\tvec3 result = vec3( LTC_ClippedSphereFormFactor( vectorFormFactor ) );\n\treturn result;\n}\nvec3 BRDF_Specular_GGX_Environment( const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {\n\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\tconst vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );\n\tconst vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );\n\tvec4 r = roughness * c0 + c1;\n\tfloat a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;\n\tvec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;\n\treturn specularColor * AB.x + AB.y;\n}\nfloat G_BlinnPhong_Implicit( ) {\n\treturn 0.25;\n}\nfloat D_BlinnPhong( const in float shininess, const in float dotNH ) {\n\treturn RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n}\nvec3 BRDF_Specular_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {\n\tvec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );\n\tfloat dotNH = saturate( dot( geometry.normal, halfDir ) );\n\tfloat dotLH = saturate( dot( incidentLight.direction, halfDir ) );\n\tvec3 F = F_Schlick( specularColor, dotLH );\n\tfloat G = G_BlinnPhong_Implicit( );\n\tfloat D = D_BlinnPhong( shininess, dotNH );\n\treturn F * ( G * D );\n}\nfloat GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {\n\treturn ( 2.0 / pow2( ggxRoughness + 0.0001 ) - 2.0 );\n}\nfloat BlinnExponentToGGXRoughness( const in float blinnExponent ) {\n\treturn sqrt( 2.0 / ( blinnExponent + 2.0 ) );\n}\n";

var bumpmap_pars_fragment = "#ifdef USE_BUMPMAP\n\tuniform sampler2D bumpMap;\n\tuniform float bumpScale;\n\tvec2 dHdxy_fwd() {\n\t\tvec2 dSTdx = dFdx( vUv );\n\t\tvec2 dSTdy = dFdy( vUv );\n\t\tfloat Hll = bumpScale * texture2D( bumpMap, vUv ).x;\n\t\tfloat dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;\n\t\tfloat dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;\n\t\treturn vec2( dBx, dBy );\n\t}\n\tvec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {\n\t\tvec3 vSigmaX = vec3( dFdx( surf_pos.x ), dFdx( surf_pos.y ), dFdx( surf_pos.z ) );\n\t\tvec3 vSigmaY = vec3( dFdy( surf_pos.x ), dFdy( surf_pos.y ), dFdy( surf_pos.z ) );\n\t\tvec3 vN = surf_norm;\n\t\tvec3 R1 = cross( vSigmaY, vN );\n\t\tvec3 R2 = cross( vN, vSigmaX );\n\t\tfloat fDet = dot( vSigmaX, R1 );\n\t\tvec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n\t\treturn normalize( abs( fDet ) * surf_norm - vGrad );\n\t}\n#endif\n";

var clipping_planes_fragment = "#if NUM_CLIPPING_PLANES > 0\n\tfor ( int i = 0; i < UNION_CLIPPING_PLANES; ++ i ) {\n\t\tvec4 plane = clippingPlanes[ i ];\n\t\tif ( dot( vViewPosition, plane.xyz ) > plane.w ) discard;\n\t}\n\t\t\n\t#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n\t\tbool clipped = true;\n\t\tfor ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; ++ i ) {\n\t\t\tvec4 plane = clippingPlanes[ i ];\n\t\t\tclipped = ( dot( vViewPosition, plane.xyz ) > plane.w ) && clipped;\n\t\t}\n\t\tif ( clipped ) discard;\n\t\n\t#endif\n#endif\n";

var clipping_planes_pars_fragment = "#if NUM_CLIPPING_PLANES > 0\n\t#if ! defined( PHYSICAL ) && ! defined( PHONG )\n\t\tvarying vec3 vViewPosition;\n\t#endif\n\tuniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];\n#endif\n";

var clipping_planes_pars_vertex = "#if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG )\n\tvarying vec3 vViewPosition;\n#endif\n";

var clipping_planes_vertex = "#if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG )\n\tvViewPosition = - mvPosition.xyz;\n#endif\n";

var color_fragment = "#ifdef USE_COLOR\n\tdiffuseColor.rgb *= vColor;\n#endif";

var color_pars_fragment = "#ifdef USE_COLOR\n\tvarying vec3 vColor;\n#endif\n";

var color_pars_vertex = "#ifdef USE_COLOR\n\tvarying vec3 vColor;\n#endif";

var color_vertex = "#ifdef USE_COLOR\n\tvColor.xyz = color.xyz;\n#endif";

var common = "#define PI 3.14159265359\n#define PI2 6.28318530718\n#define PI_HALF 1.5707963267949\n#define RECIPROCAL_PI 0.31830988618\n#define RECIPROCAL_PI2 0.15915494\n#define LOG2 1.442695\n#define EPSILON 1e-6\n#define saturate(a) clamp( a, 0.0, 1.0 )\n#define whiteCompliment(a) ( 1.0 - saturate( a ) )\nfloat pow2( const in float x ) { return x*x; }\nfloat pow3( const in float x ) { return x*x*x; }\nfloat pow4( const in float x ) { float x2 = x*x; return x2*x2; }\nfloat average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }\nhighp float rand( const in vec2 uv ) {\n\tconst highp float a = 12.9898, b = 78.233, c = 43758.5453;\n\thighp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );\n\treturn fract(sin(sn) * c);\n}\nstruct IncidentLight {\n\tvec3 color;\n\tvec3 direction;\n\tbool visible;\n};\nstruct ReflectedLight {\n\tvec3 directDiffuse;\n\tvec3 directSpecular;\n\tvec3 indirectDiffuse;\n\tvec3 indirectSpecular;\n};\nstruct GeometricContext {\n\tvec3 position;\n\tvec3 normal;\n\tvec3 viewDir;\n};\nvec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n\treturn normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n}\nvec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {\n\treturn normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );\n}\nvec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\tfloat distance = dot( planeNormal, point - pointOnPlane );\n\treturn - distance * planeNormal + point;\n}\nfloat sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\treturn sign( dot( point - pointOnPlane, planeNormal ) );\n}\nvec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\treturn lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;\n}\nmat3 transpose( const in mat3 v ) {\n\tmat3 tmp;\n\ttmp[0] = vec3(v[0].x, v[1].x, v[2].x);\n\ttmp[1] = vec3(v[0].y, v[1].y, v[2].y);\n\ttmp[2] = vec3(v[0].z, v[1].z, v[2].z);\n\treturn tmp;\n}\n";

var cube_uv_reflection_fragment = "#ifdef ENVMAP_TYPE_CUBE_UV\n#define cubeUV_textureSize (1024.0)\nint getFaceFromDirection(vec3 direction) {\n\tvec3 absDirection = abs(direction);\n\tint face = -1;\n\tif( absDirection.x > absDirection.z ) {\n\t\tif(absDirection.x > absDirection.y )\n\t\t\tface = direction.x > 0.0 ? 0 : 3;\n\t\telse\n\t\t\tface = direction.y > 0.0 ? 1 : 4;\n\t}\n\telse {\n\t\tif(absDirection.z > absDirection.y )\n\t\t\tface = direction.z > 0.0 ? 2 : 5;\n\t\telse\n\t\t\tface = direction.y > 0.0 ? 1 : 4;\n\t}\n\treturn face;\n}\n#define cubeUV_maxLods1  (log2(cubeUV_textureSize*0.25) - 1.0)\n#define cubeUV_rangeClamp (exp2((6.0 - 1.0) * 2.0))\nvec2 MipLevelInfo( vec3 vec, float roughnessLevel, float roughness ) {\n\tfloat scale = exp2(cubeUV_maxLods1 - roughnessLevel);\n\tfloat dxRoughness = dFdx(roughness);\n\tfloat dyRoughness = dFdy(roughness);\n\tvec3 dx = dFdx( vec * scale * dxRoughness );\n\tvec3 dy = dFdy( vec * scale * dyRoughness );\n\tfloat d = max( dot( dx, dx ), dot( dy, dy ) );\n\td = clamp(d, 1.0, cubeUV_rangeClamp);\n\tfloat mipLevel = 0.5 * log2(d);\n\treturn vec2(floor(mipLevel), fract(mipLevel));\n}\n#define cubeUV_maxLods2 (log2(cubeUV_textureSize*0.25) - 2.0)\n#define cubeUV_rcpTextureSize (1.0 / cubeUV_textureSize)\nvec2 getCubeUV(vec3 direction, float roughnessLevel, float mipLevel) {\n\tmipLevel = roughnessLevel > cubeUV_maxLods2 - 3.0 ? 0.0 : mipLevel;\n\tfloat a = 16.0 * cubeUV_rcpTextureSize;\n\tvec2 exp2_packed = exp2( vec2( roughnessLevel, mipLevel ) );\n\tvec2 rcp_exp2_packed = vec2( 1.0 ) / exp2_packed;\n\tfloat powScale = exp2_packed.x * exp2_packed.y;\n\tfloat scale = rcp_exp2_packed.x * rcp_exp2_packed.y * 0.25;\n\tfloat mipOffset = 0.75*(1.0 - rcp_exp2_packed.y) * rcp_exp2_packed.x;\n\tbool bRes = mipLevel == 0.0;\n\tscale =  bRes && (scale < a) ? a : scale;\n\tvec3 r;\n\tvec2 offset;\n\tint face = getFaceFromDirection(direction);\n\tfloat rcpPowScale = 1.0 / powScale;\n\tif( face == 0) {\n\t\tr = vec3(direction.x, -direction.z, direction.y);\n\t\toffset = vec2(0.0+mipOffset,0.75 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;\n\t}\n\telse if( face == 1) {\n\t\tr = vec3(direction.y, direction.x, direction.z);\n\t\toffset = vec2(scale+mipOffset, 0.75 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;\n\t}\n\telse if( face == 2) {\n\t\tr = vec3(direction.z, direction.x, direction.y);\n\t\toffset = vec2(2.0*scale+mipOffset, 0.75 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;\n\t}\n\telse if( face == 3) {\n\t\tr = vec3(direction.x, direction.z, direction.y);\n\t\toffset = vec2(0.0+mipOffset,0.5 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;\n\t}\n\telse if( face == 4) {\n\t\tr = vec3(direction.y, direction.x, -direction.z);\n\t\toffset = vec2(scale+mipOffset, 0.5 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;\n\t}\n\telse {\n\t\tr = vec3(direction.z, -direction.x, direction.y);\n\t\toffset = vec2(2.0*scale+mipOffset, 0.5 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;\n\t}\n\tr = normalize(r);\n\tfloat texelOffset = 0.5 * cubeUV_rcpTextureSize;\n\tvec2 s = ( r.yz / abs( r.x ) + vec2( 1.0 ) ) * 0.5;\n\tvec2 base = offset + vec2( texelOffset );\n\treturn base + s * ( scale - 2.0 * texelOffset );\n}\n#define cubeUV_maxLods3 (log2(cubeUV_textureSize*0.25) - 3.0)\nvec4 textureCubeUV(vec3 reflectedDirection, float roughness ) {\n\tfloat roughnessVal = roughness* cubeUV_maxLods3;\n\tfloat r1 = floor(roughnessVal);\n\tfloat r2 = r1 + 1.0;\n\tfloat t = fract(roughnessVal);\n\tvec2 mipInfo = MipLevelInfo(reflectedDirection, r1, roughness);\n\tfloat s = mipInfo.y;\n\tfloat level0 = mipInfo.x;\n\tfloat level1 = level0 + 1.0;\n\tlevel1 = level1 > 5.0 ? 5.0 : level1;\n\tlevel0 += min( floor( s + 0.5 ), 5.0 );\n\tvec2 uv_10 = getCubeUV(reflectedDirection, r1, level0);\n\tvec4 color10 = envMapTexelToLinear(texture2D(envMap, uv_10));\n\tvec2 uv_20 = getCubeUV(reflectedDirection, r2, level0);\n\tvec4 color20 = envMapTexelToLinear(texture2D(envMap, uv_20));\n\tvec4 result = mix(color10, color20, t);\n\treturn vec4(result.rgb, 1.0);\n}\n#endif\n";

var defaultnormal_vertex = "vec3 transformedNormal = normalMatrix * objectNormal;\n#ifdef FLIP_SIDED\n\ttransformedNormal = - transformedNormal;\n#endif\n";

var displacementmap_pars_vertex = "#ifdef USE_DISPLACEMENTMAP\n\tuniform sampler2D displacementMap;\n\tuniform float displacementScale;\n\tuniform float displacementBias;\n#endif\n";

var displacementmap_vertex = "#ifdef USE_DISPLACEMENTMAP\n\ttransformed += normalize( objectNormal ) * ( texture2D( displacementMap, uv ).x * displacementScale + displacementBias );\n#endif\n";

var emissivemap_fragment = "#ifdef USE_EMISSIVEMAP\n\tvec4 emissiveColor = texture2D( emissiveMap, vUv );\n\temissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;\n\ttotalEmissiveRadiance *= emissiveColor.rgb;\n#endif\n";

var emissivemap_pars_fragment = "#ifdef USE_EMISSIVEMAP\n\tuniform sampler2D emissiveMap;\n#endif\n";

var encodings_fragment = "  gl_FragColor = linearToOutputTexel( gl_FragColor );\n";

var encodings_pars_fragment = "\nvec4 LinearToLinear( in vec4 value ) {\n\treturn value;\n}\nvec4 GammaToLinear( in vec4 value, in float gammaFactor ) {\n\treturn vec4( pow( value.xyz, vec3( gammaFactor ) ), value.w );\n}\nvec4 LinearToGamma( in vec4 value, in float gammaFactor ) {\n\treturn vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );\n}\nvec4 sRGBToLinear( in vec4 value ) {\n\treturn vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.w );\n}\nvec4 LinearTosRGB( in vec4 value ) {\n\treturn vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.w );\n}\nvec4 RGBEToLinear( in vec4 value ) {\n\treturn vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );\n}\nvec4 LinearToRGBE( in vec4 value ) {\n\tfloat maxComponent = max( max( value.r, value.g ), value.b );\n\tfloat fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );\n\treturn vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );\n}\nvec4 RGBMToLinear( in vec4 value, in float maxRange ) {\n\treturn vec4( value.xyz * value.w * maxRange, 1.0 );\n}\nvec4 LinearToRGBM( in vec4 value, in float maxRange ) {\n\tfloat maxRGB = max( value.x, max( value.g, value.b ) );\n\tfloat M      = clamp( maxRGB / maxRange, 0.0, 1.0 );\n\tM            = ceil( M * 255.0 ) / 255.0;\n\treturn vec4( value.rgb / ( M * maxRange ), M );\n}\nvec4 RGBDToLinear( in vec4 value, in float maxRange ) {\n\treturn vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );\n}\nvec4 LinearToRGBD( in vec4 value, in float maxRange ) {\n\tfloat maxRGB = max( value.x, max( value.g, value.b ) );\n\tfloat D      = max( maxRange / maxRGB, 1.0 );\n\tD            = min( floor( D ) / 255.0, 1.0 );\n\treturn vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );\n}\nconst mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );\nvec4 LinearToLogLuv( in vec4 value )  {\n\tvec3 Xp_Y_XYZp = value.rgb * cLogLuvM;\n\tXp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));\n\tvec4 vResult;\n\tvResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;\n\tfloat Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;\n\tvResult.w = fract(Le);\n\tvResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;\n\treturn vResult;\n}\nconst mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );\nvec4 LogLuvToLinear( in vec4 value ) {\n\tfloat Le = value.z * 255.0 + value.w;\n\tvec3 Xp_Y_XYZp;\n\tXp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);\n\tXp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;\n\tXp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;\n\tvec3 vRGB = Xp_Y_XYZp.rgb * cLogLuvInverseM;\n\treturn vec4( max(vRGB, 0.0), 1.0 );\n}\n";

var envmap_fragment = "#ifdef USE_ENVMAP\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\t\tvec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );\n\t\tvec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvec3 reflectVec = reflect( cameraToVertex, worldNormal );\n\t\t#else\n\t\t\tvec3 reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );\n\t\t#endif\n\t#else\n\t\tvec3 reflectVec = vReflect;\n\t#endif\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tvec4 envColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n\t#elif defined( ENVMAP_TYPE_EQUIREC )\n\t\tvec2 sampleUV;\n\t\tsampleUV.y = asin( flipNormal * reflectVec.y ) * RECIPROCAL_PI + 0.5;\n\t\tsampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n\t\tvec4 envColor = texture2D( envMap, sampleUV );\n\t#elif defined( ENVMAP_TYPE_SPHERE )\n\t\tvec3 reflectView = flipNormal * normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0, 0.0, 1.0 ) );\n\t\tvec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );\n\t#else\n\t\tvec4 envColor = vec4( 0.0 );\n\t#endif\n\tenvColor = envMapTexelToLinear( envColor );\n\t#ifdef ENVMAP_BLENDING_MULTIPLY\n\t\toutgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n\t#elif defined( ENVMAP_BLENDING_MIX )\n\t\toutgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n\t#elif defined( ENVMAP_BLENDING_ADD )\n\t\toutgoingLight += envColor.xyz * specularStrength * reflectivity;\n\t#endif\n#endif\n";

var envmap_pars_fragment = "#if defined( USE_ENVMAP ) || defined( PHYSICAL )\n\tuniform float reflectivity;\n\tuniform float envMapIntensity;\n#endif\n#ifdef USE_ENVMAP\n\t#if ! defined( PHYSICAL ) && ( defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) )\n\t\tvarying vec3 vWorldPosition;\n\t#endif\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tuniform samplerCube envMap;\n\t#else\n\t\tuniform sampler2D envMap;\n\t#endif\n\tuniform float flipEnvMap;\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( PHYSICAL )\n\t\tuniform float refractionRatio;\n\t#else\n\t\tvarying vec3 vReflect;\n\t#endif\n#endif\n";

var envmap_pars_vertex = "#ifdef USE_ENVMAP\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\t\tvarying vec3 vWorldPosition;\n\t#else\n\t\tvarying vec3 vReflect;\n\t\tuniform float refractionRatio;\n\t#endif\n#endif\n";

var envmap_vertex = "#ifdef USE_ENVMAP\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\t\tvWorldPosition = worldPosition.xyz;\n\t#else\n\t\tvec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n\t\tvec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvReflect = reflect( cameraToVertex, worldNormal );\n\t\t#else\n\t\t\tvReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n\t\t#endif\n\t#endif\n#endif\n";

var fog_vertex = "\n#ifdef USE_FOG\nfogDepth = -mvPosition.z;\n#endif";

var fog_pars_vertex = "#ifdef USE_FOG\n  varying float fogDepth;\n#endif\n";

var fog_fragment = "#ifdef USE_FOG\n\t#ifdef FOG_EXP2\n\t\tfloat fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDepth * fogDepth * LOG2 ) );\n\t#else\n\t\tfloat fogFactor = smoothstep( fogNear, fogFar, fogDepth );\n\t#endif\n\tgl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );\n#endif\n";

var fog_pars_fragment = "#ifdef USE_FOG\n\tuniform vec3 fogColor;\n\tvarying float fogDepth;\n\t#ifdef FOG_EXP2\n\t\tuniform float fogDensity;\n\t#else\n\t\tuniform float fogNear;\n\t\tuniform float fogFar;\n\t#endif\n#endif\n";

var gradientmap_pars_fragment = "#ifdef TOON\n\tuniform sampler2D gradientMap;\n\tvec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {\n\t\tfloat dotNL = dot( normal, lightDirection );\n\t\tvec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );\n\t\t#ifdef USE_GRADIENTMAP\n\t\t\treturn texture2D( gradientMap, coord ).rgb;\n\t\t#else\n\t\t\treturn ( coord.x < 0.7 ) ? vec3( 0.7 ) : vec3( 1.0 );\n\t\t#endif\n\t}\n#endif\n";

var lightmap_fragment = "#ifdef USE_LIGHTMAP\n\treflectedLight.indirectDiffuse += PI * texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n#endif\n";

var lightmap_pars_fragment = "#ifdef USE_LIGHTMAP\n\tuniform sampler2D lightMap;\n\tuniform float lightMapIntensity;\n#endif";

var lights_lambert_vertex = "vec3 diffuse = vec3( 1.0 );\nGeometricContext geometry;\ngeometry.position = mvPosition.xyz;\ngeometry.normal = normalize( transformedNormal );\ngeometry.viewDir = normalize( -mvPosition.xyz );\nGeometricContext backGeometry;\nbackGeometry.position = geometry.position;\nbackGeometry.normal = -geometry.normal;\nbackGeometry.viewDir = geometry.viewDir;\nvLightFront = vec3( 0.0 );\n#ifdef DOUBLE_SIDED\n\tvLightBack = vec3( 0.0 );\n#endif\nIncidentLight directLight;\nfloat dotNL;\nvec3 directLightColor_Diffuse;\n#if NUM_POINT_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tgetPointDirectLightIrradiance( pointLights[ i ], geometry, directLight );\n\t\tdotNL = dot( geometry.normal, directLight.direction );\n\t\tdirectLightColor_Diffuse = PI * directLight.color;\n\t\tvLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += saturate( -dotNL ) * directLightColor_Diffuse;\n\t\t#endif\n\t}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tgetSpotDirectLightIrradiance( spotLights[ i ], geometry, directLight );\n\t\tdotNL = dot( geometry.normal, directLight.direction );\n\t\tdirectLightColor_Diffuse = PI * directLight.color;\n\t\tvLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += saturate( -dotNL ) * directLightColor_Diffuse;\n\t\t#endif\n\t}\n#endif\n#if NUM_DIR_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tgetDirectionalDirectLightIrradiance( directionalLights[ i ], geometry, directLight );\n\t\tdotNL = dot( geometry.normal, directLight.direction );\n\t\tdirectLightColor_Diffuse = PI * directLight.color;\n\t\tvLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += saturate( -dotNL ) * directLightColor_Diffuse;\n\t\t#endif\n\t}\n#endif\n#if NUM_HEMI_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n\t\tvLightFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += getHemisphereLightIrradiance( hemisphereLights[ i ], backGeometry );\n\t\t#endif\n\t}\n#endif\n";

var lights_pars = "uniform vec3 ambientLightColor;\nvec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {\n\tvec3 irradiance = ambientLightColor;\n\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\tirradiance *= PI;\n\t#endif\n\treturn irradiance;\n}\n#if NUM_DIR_LIGHTS > 0\n\tstruct DirectionalLight {\n\t\tvec3 direction;\n\t\tvec3 color;\n\t\tint shadow;\n\t\tfloat shadowBias;\n\t\tfloat shadowRadius;\n\t\tvec2 shadowMapSize;\n\t};\n\tuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n\tvoid getDirectionalDirectLightIrradiance( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight ) {\n\t\tdirectLight.color = directionalLight.color;\n\t\tdirectLight.direction = directionalLight.direction;\n\t\tdirectLight.visible = true;\n\t}\n#endif\n#if NUM_POINT_LIGHTS > 0\n\tstruct PointLight {\n\t\tvec3 position;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t\tint shadow;\n\t\tfloat shadowBias;\n\t\tfloat shadowRadius;\n\t\tvec2 shadowMapSize;\n\t};\n\tuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n\tvoid getPointDirectLightIrradiance( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight ) {\n\t\tvec3 lVector = pointLight.position - geometry.position;\n\t\tdirectLight.direction = normalize( lVector );\n\t\tfloat lightDistance = length( lVector );\n\t\tdirectLight.color = pointLight.color;\n\t\tdirectLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.distance, pointLight.decay );\n\t\tdirectLight.visible = ( directLight.color != vec3( 0.0 ) );\n\t}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n\tstruct SpotLight {\n\t\tvec3 position;\n\t\tvec3 direction;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t\tfloat coneCos;\n\t\tfloat penumbraCos;\n\t\tint shadow;\n\t\tfloat shadowBias;\n\t\tfloat shadowRadius;\n\t\tvec2 shadowMapSize;\n\t};\n\tuniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];\n\tvoid getSpotDirectLightIrradiance( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight directLight  ) {\n\t\tvec3 lVector = spotLight.position - geometry.position;\n\t\tdirectLight.direction = normalize( lVector );\n\t\tfloat lightDistance = length( lVector );\n\t\tfloat angleCos = dot( directLight.direction, spotLight.direction );\n\t\tif ( angleCos > spotLight.coneCos ) {\n\t\t\tfloat spotEffect = smoothstep( spotLight.coneCos, spotLight.penumbraCos, angleCos );\n\t\t\tdirectLight.color = spotLight.color;\n\t\t\tdirectLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor( lightDistance, spotLight.distance, spotLight.decay );\n\t\t\tdirectLight.visible = true;\n\t\t} else {\n\t\t\tdirectLight.color = vec3( 0.0 );\n\t\t\tdirectLight.visible = false;\n\t\t}\n\t}\n#endif\n#if NUM_RECT_AREA_LIGHTS > 0\n\tstruct RectAreaLight {\n\t\tvec3 color;\n\t\tvec3 position;\n\t\tvec3 halfWidth;\n\t\tvec3 halfHeight;\n\t};\n\tuniform sampler2D ltcMat;\tuniform sampler2D ltcMag;\n\tuniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];\n#endif\n#if NUM_HEMI_LIGHTS > 0\n\tstruct HemisphereLight {\n\t\tvec3 direction;\n\t\tvec3 skyColor;\n\t\tvec3 groundColor;\n\t};\n\tuniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];\n\tvec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in GeometricContext geometry ) {\n\t\tfloat dotNL = dot( geometry.normal, hemiLight.direction );\n\t\tfloat hemiDiffuseWeight = 0.5 * dotNL + 0.5;\n\t\tvec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );\n\t\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\t\tirradiance *= PI;\n\t\t#endif\n\t\treturn irradiance;\n\t}\n#endif\n#if defined( USE_ENVMAP ) && defined( PHYSICAL )\n\tvec3 getLightProbeIndirectIrradiance( const in GeometricContext geometry, const in int maxMIPLevel ) {\n\t\tvec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );\n\t\t#ifdef ENVMAP_TYPE_CUBE\n\t\t\tvec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#elif defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\tvec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );\n\t\t\tvec4 envMapColor = textureCubeUV( queryVec, 1.0 );\n\t\t#else\n\t\t\tvec4 envMapColor = vec4( 0.0 );\n\t\t#endif\n\t\treturn PI * envMapColor.rgb * envMapIntensity;\n\t}\n\tfloat getSpecularMIPLevel( const in float blinnShininessExponent, const in int maxMIPLevel ) {\n\t\tfloat maxMIPLevelScalar = float( maxMIPLevel );\n\t\tfloat desiredMIPLevel = maxMIPLevelScalar - 0.79248 - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );\n\t\treturn clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );\n\t}\n\tvec3 getLightProbeIndirectRadiance( const in GeometricContext geometry, const in float blinnShininessExponent, const in int maxMIPLevel ) {\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvec3 reflectVec = reflect( -geometry.viewDir, geometry.normal );\n\t\t#else\n\t\t\tvec3 reflectVec = refract( -geometry.viewDir, geometry.normal, refractionRatio );\n\t\t#endif\n\t\treflectVec = inverseTransformDirection( reflectVec, viewMatrix );\n\t\tfloat specularMIPLevel = getSpecularMIPLevel( blinnShininessExponent, maxMIPLevel );\n\t\t#ifdef ENVMAP_TYPE_CUBE\n\t\t\tvec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#elif defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\tvec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );\n\t\t\tvec4 envMapColor = textureCubeUV(queryReflectVec, BlinnExponentToGGXRoughness(blinnShininessExponent));\n\t\t#elif defined( ENVMAP_TYPE_EQUIREC )\n\t\t\tvec2 sampleUV;\n\t\t\tsampleUV.y = saturate( reflectVec.y * 0.5 + 0.5 );\n\t\t\tsampleUV.x = atan( reflectVec.z, reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = texture2DLodEXT( envMap, sampleUV, specularMIPLevel );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = texture2D( envMap, sampleUV, specularMIPLevel );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#elif defined( ENVMAP_TYPE_SPHERE )\n\t\t\tvec3 reflectView = normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0,0.0,1.0 ) );\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = texture2DLodEXT( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#endif\n\t\treturn envMapColor.rgb * envMapIntensity;\n\t}\n#endif\n";

var lights_phong_fragment = "BlinnPhongMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularColor = specular;\nmaterial.specularShininess = shininess;\nmaterial.specularStrength = specularStrength;\n";

var lights_phong_pars_fragment = "varying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\nstruct BlinnPhongMaterial {\n\tvec3\tdiffuseColor;\n\tvec3\tspecularColor;\n\tfloat\tspecularShininess;\n\tfloat\tspecularStrength;\n};\nvoid RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n\t#ifdef TOON\n\t\tvec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;\n\t#else\n\t\tfloat dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n\t\tvec3 irradiance = dotNL * directLight.color;\n\t#endif\n\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\tirradiance *= PI;\n\t#endif\n\treflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n\treflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;\n}\nvoid RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n}\n#define RE_Direct\t\t\t\tRE_Direct_BlinnPhong\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_BlinnPhong\n#define Material_LightProbeLOD( material )\t(0)\n";

var lights_physical_fragment = "PhysicalMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );\nmaterial.specularRoughness = clamp( roughnessFactor, 0.04, 1.0 );\n#ifdef STANDARD\n\tmaterial.specularColor = mix( vec3( DEFAULT_SPECULAR_COEFFICIENT ), diffuseColor.rgb, metalnessFactor );\n#else\n\tmaterial.specularColor = mix( vec3( MAXIMUM_SPECULAR_COEFFICIENT * pow2( reflectivity ) ), diffuseColor.rgb, metalnessFactor );\n\tmaterial.clearCoat = saturate( clearCoat );\tmaterial.clearCoatRoughness = clamp( clearCoatRoughness, 0.04, 1.0 );\n#endif\n";

var lights_physical_pars_fragment = "struct PhysicalMaterial {\n\tvec3\tdiffuseColor;\n\tfloat\tspecularRoughness;\n\tvec3\tspecularColor;\n\t#ifndef STANDARD\n\t\tfloat clearCoat;\n\t\tfloat clearCoatRoughness;\n\t#endif\n};\n#define MAXIMUM_SPECULAR_COEFFICIENT 0.16\n#define DEFAULT_SPECULAR_COEFFICIENT 0.04\nfloat clearCoatDHRApprox( const in float roughness, const in float dotNL ) {\n\treturn DEFAULT_SPECULAR_COEFFICIENT + ( 1.0 - DEFAULT_SPECULAR_COEFFICIENT ) * ( pow( 1.0 - dotNL, 5.0 ) * pow( 1.0 - roughness, 2.0 ) );\n}\n#if NUM_RECT_AREA_LIGHTS > 0\n\tvoid RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\t\tvec3 normal = geometry.normal;\n\t\tvec3 viewDir = geometry.viewDir;\n\t\tvec3 position = geometry.position;\n\t\tvec3 lightPos = rectAreaLight.position;\n\t\tvec3 halfWidth = rectAreaLight.halfWidth;\n\t\tvec3 halfHeight = rectAreaLight.halfHeight;\n\t\tvec3 lightColor = rectAreaLight.color;\n\t\tfloat roughness = material.specularRoughness;\n\t\tvec3 rectCoords[ 4 ];\n\t\trectCoords[ 0 ] = lightPos - halfWidth - halfHeight;\t\trectCoords[ 1 ] = lightPos + halfWidth - halfHeight;\n\t\trectCoords[ 2 ] = lightPos + halfWidth + halfHeight;\n\t\trectCoords[ 3 ] = lightPos - halfWidth + halfHeight;\n\t\tvec2 uv = LTC_Uv( normal, viewDir, roughness );\n\t\tfloat norm = texture2D( ltcMag, uv ).a;\n\t\tvec4 t = texture2D( ltcMat, uv );\n\t\tmat3 mInv = mat3(\n\t\t\tvec3(   1,   0, t.y ),\n\t\t\tvec3(   0, t.z,   0 ),\n\t\t\tvec3( t.w,   0, t.x )\n\t\t);\n\t\treflectedLight.directSpecular += lightColor * material.specularColor * norm * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );\n\t\treflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1 ), rectCoords );\n\t}\n#endif\nvoid RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\tfloat dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n\tvec3 irradiance = dotNL * directLight.color;\n\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\tirradiance *= PI;\n\t#endif\n\t#ifndef STANDARD\n\t\tfloat clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, dotNL );\n\t#else\n\t\tfloat clearCoatDHR = 0.0;\n\t#endif\n\treflectedLight.directSpecular += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Specular_GGX( directLight, geometry, material.specularColor, material.specularRoughness );\n\treflectedLight.directDiffuse += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n\t#ifndef STANDARD\n\t\treflectedLight.directSpecular += irradiance * material.clearCoat * BRDF_Specular_GGX( directLight, geometry, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );\n\t#endif\n}\nvoid RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 clearCoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\t#ifndef STANDARD\n\t\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\t\tfloat dotNL = dotNV;\n\t\tfloat clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, dotNL );\n\t#else\n\t\tfloat clearCoatDHR = 0.0;\n\t#endif\n\treflectedLight.indirectSpecular += ( 1.0 - clearCoatDHR ) * radiance * BRDF_Specular_GGX_Environment( geometry, material.specularColor, material.specularRoughness );\n\t#ifndef STANDARD\n\t\treflectedLight.indirectSpecular += clearCoatRadiance * material.clearCoat * BRDF_Specular_GGX_Environment( geometry, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );\n\t#endif\n}\n#define RE_Direct\t\t\t\tRE_Direct_Physical\n#define RE_Direct_RectArea\t\tRE_Direct_RectArea_Physical\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_Physical\n#define RE_IndirectSpecular\t\tRE_IndirectSpecular_Physical\n#define Material_BlinnShininessExponent( material )   GGXRoughnessToBlinnExponent( material.specularRoughness )\n#define Material_ClearCoat_BlinnShininessExponent( material )   GGXRoughnessToBlinnExponent( material.clearCoatRoughness )\nfloat computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {\n\treturn saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );\n}\n";

var lights_template = "\nGeometricContext geometry;\ngeometry.position = - vViewPosition;\ngeometry.normal = normal;\ngeometry.viewDir = normalize( vViewPosition );\nIncidentLight directLight;\n#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n\tPointLight pointLight;\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tpointLight = pointLights[ i ];\n\t\tgetPointDirectLightIrradiance( pointLight, geometry, directLight );\n\t\t#ifdef USE_SHADOWMAP\n\t\tdirectLight.color *= all( bvec2( pointLight.shadow, directLight.visible ) ) ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n#endif\n#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n\tSpotLight spotLight;\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tspotLight = spotLights[ i ];\n\t\tgetSpotDirectLightIrradiance( spotLight, geometry, directLight );\n\t\t#ifdef USE_SHADOWMAP\n\t\tdirectLight.color *= all( bvec2( spotLight.shadow, directLight.visible ) ) ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n#endif\n#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n\tDirectionalLight directionalLight;\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tdirectionalLight = directionalLights[ i ];\n\t\tgetDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );\n\t\t#ifdef USE_SHADOWMAP\n\t\tdirectLight.color *= all( bvec2( directionalLight.shadow, directLight.visible ) ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n#endif\n#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )\n\tRectAreaLight rectAreaLight;\n\tfor ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {\n\t\trectAreaLight = rectAreaLights[ i ];\n\t\tRE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );\n\t}\n#endif\n#if defined( RE_IndirectDiffuse )\n\tvec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n\t#ifdef USE_LIGHTMAP\n\t\tvec3 lightMapIrradiance = texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n\t\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\t\tlightMapIrradiance *= PI;\n\t\t#endif\n\t\tirradiance += lightMapIrradiance;\n\t#endif\n\t#if ( NUM_HEMI_LIGHTS > 0 )\n\t\tfor ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n\t\t\tirradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );\n\t\t}\n\t#endif\n\t#if defined( USE_ENVMAP ) && defined( PHYSICAL ) && defined( ENVMAP_TYPE_CUBE_UV )\n\t\tirradiance += getLightProbeIndirectIrradiance( geometry, 8 );\n\t#endif\n\tRE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );\n#endif\n#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )\n\tvec3 radiance = getLightProbeIndirectRadiance( geometry, Material_BlinnShininessExponent( material ), 8 );\n\t#ifndef STANDARD\n\t\tvec3 clearCoatRadiance = getLightProbeIndirectRadiance( geometry, Material_ClearCoat_BlinnShininessExponent( material ), 8 );\n\t#else\n\t\tvec3 clearCoatRadiance = vec3( 0.0 );\n\t#endif\n\tRE_IndirectSpecular( radiance, clearCoatRadiance, geometry, material, reflectedLight );\n#endif\n";

var logdepthbuf_fragment = "#if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)\n\tgl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;\n#endif";

var logdepthbuf_pars_fragment = "#ifdef USE_LOGDEPTHBUF\n\tuniform float logDepthBufFC;\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvarying float vFragDepth;\n\t#endif\n#endif\n";

var logdepthbuf_pars_vertex = "#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvarying float vFragDepth;\n\t#endif\n\tuniform float logDepthBufFC;\n#endif";

var logdepthbuf_vertex = "#ifdef USE_LOGDEPTHBUF\n\tgl_Position.z = log2(max( EPSILON, gl_Position.w + 1.0 )) * logDepthBufFC;\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvFragDepth = 1.0 + gl_Position.w;\n\t#else\n\t\tgl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;\n\t#endif\n#endif\n";

var map_fragment = "#ifdef USE_MAP\n\tvec4 texelColor = texture2D( map, vUv );\n\ttexelColor = mapTexelToLinear( texelColor );\n\tdiffuseColor *= texelColor;\n#endif\n";

var map_pars_fragment = "#ifdef USE_MAP\n\tuniform sampler2D map;\n#endif\n";

var map_particle_fragment = "#ifdef USE_MAP\n\tvec4 mapTexel = texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) * offsetRepeat.zw + offsetRepeat.xy );\n\tdiffuseColor *= mapTexelToLinear( mapTexel );\n#endif\n";

var map_particle_pars_fragment = "#ifdef USE_MAP\n\tuniform vec4 offsetRepeat;\n\tuniform sampler2D map;\n#endif\n";

var metalnessmap_fragment = "float metalnessFactor = metalness;\n#ifdef USE_METALNESSMAP\n\tvec4 texelMetalness = texture2D( metalnessMap, vUv );\n\tmetalnessFactor *= texelMetalness.b;\n#endif\n";

var metalnessmap_pars_fragment = "#ifdef USE_METALNESSMAP\n\tuniform sampler2D metalnessMap;\n#endif";

var morphnormal_vertex = "#ifdef USE_MORPHNORMALS\n\tobjectNormal += ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];\n\tobjectNormal += ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];\n\tobjectNormal += ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];\n\tobjectNormal += ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];\n#endif\n";

var morphtarget_pars_vertex = "#ifdef USE_MORPHTARGETS\n\t#ifndef USE_MORPHNORMALS\n\tuniform float morphTargetInfluences[ 8 ];\n\t#else\n\tuniform float morphTargetInfluences[ 4 ];\n\t#endif\n#endif";

var morphtarget_vertex = "#ifdef USE_MORPHTARGETS\n\ttransformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];\n\ttransformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];\n\ttransformed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];\n\ttransformed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];\n\t#ifndef USE_MORPHNORMALS\n\ttransformed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];\n\ttransformed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];\n\ttransformed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];\n\ttransformed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];\n\t#endif\n#endif\n";

var normal_flip = "#ifdef DOUBLE_SIDED\n\tfloat flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n#else\n\tfloat flipNormal = 1.0;\n#endif\n";

var normal_fragment = "#ifdef FLAT_SHADED\n\tvec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );\n\tvec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );\n\tvec3 normal = normalize( cross( fdx, fdy ) );\n#else\n\tvec3 normal = normalize( vNormal ) * flipNormal;\n#endif\n#ifdef USE_NORMALMAP\n\tnormal = perturbNormal2Arb( -vViewPosition, normal );\n#elif defined( USE_BUMPMAP )\n\tnormal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );\n#endif\n";

var normalmap_pars_fragment = "#ifdef USE_NORMALMAP\n\tuniform sampler2D normalMap;\n\tuniform vec2 normalScale;\n\tvec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {\n\t\tvec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );\n\t\tvec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );\n\t\tvec2 st0 = dFdx( vUv.st );\n\t\tvec2 st1 = dFdy( vUv.st );\n\t\tvec3 S = normalize( q0 * st1.t - q1 * st0.t );\n\t\tvec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n\t\tvec3 N = normalize( surf_norm );\n\t\tvec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;\n\t\tmapN.xy = normalScale * mapN.xy;\n\t\tmat3 tsn = mat3( S, T, N );\n\t\treturn normalize( tsn * mapN );\n\t}\n#endif\n";

var packing = "vec3 packNormalToRGB( const in vec3 normal ) {\n\treturn normalize( normal ) * 0.5 + 0.5;\n}\nvec3 unpackRGBToNormal( const in vec3 rgb ) {\n\treturn 1.0 - 2.0 * rgb.xyz;\n}\nconst float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;\nconst vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,  256. );\nconst vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );\nconst float ShiftRight8 = 1. / 256.;\nvec4 packDepthToRGBA( const in float v ) {\n\tvec4 r = vec4( fract( v * PackFactors ), v );\n\tr.yzw -= r.xyz * ShiftRight8;\treturn r * PackUpscale;\n}\nfloat unpackRGBAToDepth( const in vec4 v ) {\n\treturn dot( v, UnpackFactors );\n}\nfloat viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {\n\treturn ( viewZ + near ) / ( near - far );\n}\nfloat orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {\n\treturn linearClipZ * ( near - far ) - near;\n}\nfloat viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {\n\treturn (( near + viewZ ) * far ) / (( far - near ) * viewZ );\n}\nfloat perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {\n\treturn ( near * far ) / ( ( far - near ) * invClipZ - far );\n}\n";

var premultiplied_alpha_fragment = "#ifdef PREMULTIPLIED_ALPHA\n\tgl_FragColor.rgb *= gl_FragColor.a;\n#endif\n";

var project_vertex = "vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );\ngl_Position = projectionMatrix * mvPosition;\n";

var dithering_fragment = "#if defined( DITHERING )\n  gl_FragColor.rgb = dithering( gl_FragColor.rgb );\n#endif\n";

var dithering_pars_fragment = "#if defined( DITHERING )\n\tvec3 dithering( vec3 color ) {\n\t\tfloat grid_position = rand( gl_FragCoord.xy );\n\t\tvec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );\n\t\tdither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );\n\t\treturn color + dither_shift_RGB;\n\t}\n#endif\n";

var roughnessmap_fragment = "float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\n\tvec4 texelRoughness = texture2D( roughnessMap, vUv );\n\troughnessFactor *= texelRoughness.g;\n#endif\n";

var roughnessmap_pars_fragment = "#ifdef USE_ROUGHNESSMAP\n\tuniform sampler2D roughnessMap;\n#endif";

var shadowmap_pars_fragment = "#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHTS > 0\n\t\tuniform sampler2D directionalShadowMap[ NUM_DIR_LIGHTS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];\n\t#endif\n\t#if NUM_SPOT_LIGHTS > 0\n\t\tuniform sampler2D spotShadowMap[ NUM_SPOT_LIGHTS ];\n\t\tvarying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHTS ];\n\t#endif\n\t#if NUM_POINT_LIGHTS > 0\n\t\tuniform sampler2D pointShadowMap[ NUM_POINT_LIGHTS ];\n\t\tvarying vec4 vPointShadowCoord[ NUM_POINT_LIGHTS ];\n\t#endif\n\tfloat texture2DCompare( sampler2D depths, vec2 uv, float compare ) {\n\t\treturn step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );\n\t}\n\tfloat texture2DShadowLerp( sampler2D depths, vec2 size, vec2 uv, float compare ) {\n\t\tconst vec2 offset = vec2( 0.0, 1.0 );\n\t\tvec2 texelSize = vec2( 1.0 ) / size;\n\t\tvec2 centroidUV = floor( uv * size + 0.5 ) / size;\n\t\tfloat lb = texture2DCompare( depths, centroidUV + texelSize * offset.xx, compare );\n\t\tfloat lt = texture2DCompare( depths, centroidUV + texelSize * offset.xy, compare );\n\t\tfloat rb = texture2DCompare( depths, centroidUV + texelSize * offset.yx, compare );\n\t\tfloat rt = texture2DCompare( depths, centroidUV + texelSize * offset.yy, compare );\n\t\tvec2 f = fract( uv * size + 0.5 );\n\t\tfloat a = mix( lb, lt, f.y );\n\t\tfloat b = mix( rb, rt, f.y );\n\t\tfloat c = mix( a, b, f.x );\n\t\treturn c;\n\t}\n\tfloat getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n\t\tfloat shadow = 1.0;\n\t\tshadowCoord.xyz /= shadowCoord.w;\n\t\tshadowCoord.z += shadowBias;\n\t\tbvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n\t\tbool inFrustum = all( inFrustumVec );\n\t\tbvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n\t\tbool frustumTest = all( frustumTestVec );\n\t\tif ( frustumTest ) {\n\t\t#if defined( SHADOWMAP_TYPE_PCF )\n\t\t\tvec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n\t\t\tfloat dx0 = - texelSize.x * shadowRadius;\n\t\t\tfloat dy0 = - texelSize.y * shadowRadius;\n\t\t\tfloat dx1 = + texelSize.x * shadowRadius;\n\t\t\tfloat dy1 = + texelSize.y * shadowRadius;\n\t\t\tshadow = (\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n\t\t\tvec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n\t\t\tfloat dx0 = - texelSize.x * shadowRadius;\n\t\t\tfloat dy0 = - texelSize.y * shadowRadius;\n\t\t\tfloat dx1 = + texelSize.x * shadowRadius;\n\t\t\tfloat dy1 = + texelSize.y * shadowRadius;\n\t\t\tshadow = (\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy, shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#else\n\t\t\tshadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );\n\t\t#endif\n\t\t}\n\t\treturn shadow;\n\t}\n\tvec2 cubeToUV( vec3 v, float texelSizeY ) {\n\t\tvec3 absV = abs( v );\n\t\tfloat scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );\n\t\tabsV *= scaleToCube;\n\t\tv *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );\n\t\tvec2 planar = v.xy;\n\t\tfloat almostATexel = 1.5 * texelSizeY;\n\t\tfloat almostOne = 1.0 - almostATexel;\n\t\tif ( absV.z >= almostOne ) {\n\t\t\tif ( v.z > 0.0 )\n\t\t\t\tplanar.x = 4.0 - v.x;\n\t\t} else if ( absV.x >= almostOne ) {\n\t\t\tfloat signX = sign( v.x );\n\t\t\tplanar.x = v.z * signX + 2.0 * signX;\n\t\t} else if ( absV.y >= almostOne ) {\n\t\t\tfloat signY = sign( v.y );\n\t\t\tplanar.x = v.x + 2.0 * signY + 2.0;\n\t\t\tplanar.y = v.z * signY - 2.0;\n\t\t}\n\t\treturn vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );\n\t}\n\tfloat getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n\t\tvec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );\n\t\tvec3 lightToPosition = shadowCoord.xyz;\n\t\tvec3 bd3D = normalize( lightToPosition );\n\t\tfloat dp = ( length( lightToPosition ) - shadowBias ) / 1000.0;\n\t\t#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT )\n\t\t\tvec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;\n\t\t\treturn (\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#else\n\t\t\treturn texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );\n\t\t#endif\n\t}\n#endif\n";

var shadowmap_pars_vertex = "#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHTS > 0\n\t\tuniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHTS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];\n\t#endif\n\t#if NUM_SPOT_LIGHTS > 0\n\t\tuniform mat4 spotShadowMatrix[ NUM_SPOT_LIGHTS ];\n\t\tvarying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHTS ];\n\t#endif\n\t#if NUM_POINT_LIGHTS > 0\n\t\tuniform mat4 pointShadowMatrix[ NUM_POINT_LIGHTS ];\n\t\tvarying vec4 vPointShadowCoord[ NUM_POINT_LIGHTS ];\n\t#endif\n#endif\n";

var shadowmap_vertex = "#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tvDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * worldPosition;\n\t}\n\t#endif\n\t#if NUM_SPOT_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tvSpotShadowCoord[ i ] = spotShadowMatrix[ i ] * worldPosition;\n\t}\n\t#endif\n\t#if NUM_POINT_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tvPointShadowCoord[ i ] = pointShadowMatrix[ i ] * worldPosition;\n\t}\n\t#endif\n#endif\n";

var shadowmask_pars_fragment = "float getShadowMask() {\n\tfloat shadow = 1.0;\n\t#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHTS > 0\n\tDirectionalLight directionalLight;\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tdirectionalLight = directionalLights[ i ];\n\t\tshadow *= bool( directionalLight.shadow ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n\t}\n\t#endif\n\t#if NUM_SPOT_LIGHTS > 0\n\tSpotLight spotLight;\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tspotLight = spotLights[ i ];\n\t\tshadow *= bool( spotLight.shadow ) ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n\t}\n\t#endif\n\t#if NUM_POINT_LIGHTS > 0\n\tPointLight pointLight;\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tpointLight = pointLights[ i ];\n\t\tshadow *= bool( pointLight.shadow ) ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ] ) : 1.0;\n\t}\n\t#endif\n\t#endif\n\treturn shadow;\n}\n";

var skinbase_vertex = "#ifdef USE_SKINNING\n\tmat4 boneMatX = getBoneMatrix( skinIndex.x );\n\tmat4 boneMatY = getBoneMatrix( skinIndex.y );\n\tmat4 boneMatZ = getBoneMatrix( skinIndex.z );\n\tmat4 boneMatW = getBoneMatrix( skinIndex.w );\n#endif";

var skinning_pars_vertex = "#ifdef USE_SKINNING\n\tuniform mat4 bindMatrix;\n\tuniform mat4 bindMatrixInverse;\n\t#ifdef BONE_TEXTURE\n\t\tuniform sampler2D boneTexture;\n\t\tuniform int boneTextureSize;\n\t\tmat4 getBoneMatrix( const in float i ) {\n\t\t\tfloat j = i * 4.0;\n\t\t\tfloat x = mod( j, float( boneTextureSize ) );\n\t\t\tfloat y = floor( j / float( boneTextureSize ) );\n\t\t\tfloat dx = 1.0 / float( boneTextureSize );\n\t\t\tfloat dy = 1.0 / float( boneTextureSize );\n\t\t\ty = dy * ( y + 0.5 );\n\t\t\tvec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\n\t\t\tvec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\n\t\t\tvec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\n\t\t\tvec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\n\t\t\tmat4 bone = mat4( v1, v2, v3, v4 );\n\t\t\treturn bone;\n\t\t}\n\t#else\n\t\tuniform mat4 boneMatrices[ MAX_BONES ];\n\t\tmat4 getBoneMatrix( const in float i ) {\n\t\t\tmat4 bone = boneMatrices[ int(i) ];\n\t\t\treturn bone;\n\t\t}\n\t#endif\n#endif\n";

var skinning_vertex = "#ifdef USE_SKINNING\n\tvec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );\n\tvec4 skinned = vec4( 0.0 );\n\tskinned += boneMatX * skinVertex * skinWeight.x;\n\tskinned += boneMatY * skinVertex * skinWeight.y;\n\tskinned += boneMatZ * skinVertex * skinWeight.z;\n\tskinned += boneMatW * skinVertex * skinWeight.w;\n\ttransformed = ( bindMatrixInverse * skinned ).xyz;\n#endif\n";

var skinnormal_vertex = "#ifdef USE_SKINNING\n\tmat4 skinMatrix = mat4( 0.0 );\n\tskinMatrix += skinWeight.x * boneMatX;\n\tskinMatrix += skinWeight.y * boneMatY;\n\tskinMatrix += skinWeight.z * boneMatZ;\n\tskinMatrix += skinWeight.w * boneMatW;\n\tskinMatrix  = bindMatrixInverse * skinMatrix * bindMatrix;\n\tobjectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n#endif\n";

var specularmap_fragment = "float specularStrength;\n#ifdef USE_SPECULARMAP\n\tvec4 texelSpecular = texture2D( specularMap, vUv );\n\tspecularStrength = texelSpecular.r;\n#else\n\tspecularStrength = 1.0;\n#endif";

var specularmap_pars_fragment = "#ifdef USE_SPECULARMAP\n\tuniform sampler2D specularMap;\n#endif";

var tonemapping_fragment = "#if defined( TONE_MAPPING )\n  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );\n#endif\n";

var tonemapping_pars_fragment = "#define saturate(a) clamp( a, 0.0, 1.0 )\nuniform float toneMappingExposure;\nuniform float toneMappingWhitePoint;\nvec3 LinearToneMapping( vec3 color ) {\n\treturn toneMappingExposure * color;\n}\nvec3 ReinhardToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\treturn saturate( color / ( vec3( 1.0 ) + color ) );\n}\n#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )\nvec3 Uncharted2ToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\treturn saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );\n}\nvec3 OptimizedCineonToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\tcolor = max( vec3( 0.0 ), color - 0.004 );\n\treturn pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );\n}\n";

var uv_pars_fragment = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )\n\tvarying vec2 vUv;\n#endif";

var uv_pars_vertex = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )\n\tvarying vec2 vUv;\n\tuniform vec4 offsetRepeat;\n#endif\n";

var uv_vertex = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )\n\tvUv = uv * offsetRepeat.zw + offsetRepeat.xy;\n#endif";

var uv2_pars_fragment = "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tvarying vec2 vUv2;\n#endif";

var uv2_pars_vertex = "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tattribute vec2 uv2;\n\tvarying vec2 vUv2;\n#endif";

var uv2_vertex = "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tvUv2 = uv2;\n#endif";

var worldpos_vertex = "#if defined( USE_ENVMAP ) || defined( PHONG ) || defined( PHYSICAL ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )\n\tvec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );\n#endif\n";

var cube_frag = "uniform samplerCube tCube;\nuniform float tFlip;\nuniform float opacity;\nvarying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n\tgl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );\n\tgl_FragColor.a *= opacity;\n}\n";

var cube_vert = "varying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n\tvWorldPosition = transformDirection( position, modelMatrix );\n\t#include <begin_vertex>\n\t#include <project_vertex>\n}\n";

var depth_frag = "#if DEPTH_PACKING == 3200\n\tuniform float opacity;\n#endif\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( 1.0 );\n\t#if DEPTH_PACKING == 3200\n\t\tdiffuseColor.a = opacity;\n\t#endif\n\t#include <map_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <logdepthbuf_fragment>\n\t#if DEPTH_PACKING == 3200\n\t\tgl_FragColor = vec4( vec3( gl_FragCoord.z ), opacity );\n\t#elif DEPTH_PACKING == 3201\n\t\tgl_FragColor = packDepthToRGBA( gl_FragCoord.z );\n\t#endif\n}\n";

var depth_vert = "#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <skinbase_vertex>\n\t#ifdef USE_DISPLACEMENTMAP\n\t\t#include <beginnormal_vertex>\n\t\t#include <morphnormal_vertex>\n\t\t#include <skinnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n}\n";

var distanceRGBA_frag = "uniform vec3 lightPos;\nvarying vec4 vWorldPosition;\n#include <common>\n#include <packing>\n#include <clipping_planes_pars_fragment>\nvoid main () {\n\t#include <clipping_planes_fragment>\n\tgl_FragColor = packDepthToRGBA( length( vWorldPosition.xyz - lightPos.xyz ) / 1000.0 );\n}\n";

var distanceRGBA_vert = "varying vec4 vWorldPosition;\n#include <common>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <skinbase_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <worldpos_vertex>\n\t#include <clipping_planes_vertex>\n\tvWorldPosition = worldPosition;\n}\n";

var equirect_frag = "uniform sampler2D tEquirect;\nuniform float tFlip;\nvarying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n\tvec3 direction = normalize( vWorldPosition );\n\tvec2 sampleUV;\n\tsampleUV.y = saturate( tFlip * direction.y * -0.5 + 0.5 );\n\tsampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;\n\tgl_FragColor = texture2D( tEquirect, sampleUV );\n}\n";

var equirect_vert = "varying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n\tvWorldPosition = transformDirection( position, modelMatrix );\n\t#include <begin_vertex>\n\t#include <project_vertex>\n}\n";

var linedashed_frag = "uniform vec3 diffuse;\nuniform float opacity;\nuniform float dashSize;\nuniform float totalSize;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tif ( mod( vLineDistance, totalSize ) > dashSize ) {\n\t\tdiscard;\n\t}\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <color_fragment>\n\toutgoingLight = diffuseColor.rgb;\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <premultiplied_alpha_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}\n";

var linedashed_vert = "uniform float scale;\nattribute float lineDistance;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <color_vertex>\n\tvLineDistance = scale * lineDistance;\n\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\tgl_Position = projectionMatrix * mvPosition;\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <fog_vertex>\n}\n";

var meshbasic_frag = "uniform vec3 diffuse;\nuniform float opacity;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\t#ifdef USE_LIGHTMAP\n\t\treflectedLight.indirectDiffuse += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n\t#else\n\t\treflectedLight.indirectDiffuse += vec3( 1.0 );\n\t#endif\n\t#include <aomap_fragment>\n\treflectedLight.indirectDiffuse *= diffuseColor.rgb;\n\tvec3 outgoingLight = reflectedLight.indirectDiffuse;\n\t#include <normal_flip>\n\t#include <envmap_fragment>\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <premultiplied_alpha_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}\n";

var meshbasic_vert = "#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <skinbase_vertex>\n\t#ifdef USE_ENVMAP\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <worldpos_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <envmap_vertex>\n\t#include <fog_vertex>\n}\n";

var meshlambert_frag = "uniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\n\tvarying vec3 vLightBack;\n#endif\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <bsdfs>\n#include <lights_pars>\n#include <fog_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\t#include <emissivemap_fragment>\n\treflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );\n\t#include <lightmap_fragment>\n\treflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );\n\t#ifdef DOUBLE_SIDED\n\t\treflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;\n\t#else\n\t\treflectedLight.directDiffuse = vLightFront;\n\t#endif\n\treflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n\t#include <normal_flip>\n\t#include <envmap_fragment>\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}\n";

var meshlambert_vert = "#define LAMBERT\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\n\tvarying vec3 vLightBack;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <envmap_pars_vertex>\n#include <bsdfs>\n#include <lights_pars>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <worldpos_vertex>\n\t#include <envmap_vertex>\n\t#include <lights_lambert_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}\n";

var meshphong_frag = "#define PHONG\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <gradientmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars>\n#include <lights_phong_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\t#include <normal_flip>\n\t#include <normal_fragment>\n\t#include <emissivemap_fragment>\n\t#include <lights_phong_fragment>\n\t#include <lights_template>\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n\t#include <envmap_fragment>\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}\n";

var meshphong_vert = "#define PHONG\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <envmap_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}\n";

var meshphysical_frag = "#define PHYSICAL\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float roughness;\nuniform float metalness;\nuniform float opacity;\n#ifndef STANDARD\n\tuniform float clearCoat;\n\tuniform float clearCoatRoughness;\n#endif\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <cube_uv_reflection_fragment>\n#include <lights_pars>\n#include <lights_physical_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <roughnessmap_pars_fragment>\n#include <metalnessmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <roughnessmap_fragment>\n\t#include <metalnessmap_fragment>\n\t#include <normal_flip>\n\t#include <normal_fragment>\n\t#include <emissivemap_fragment>\n\t#include <lights_physical_fragment>\n\t#include <lights_template>\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}\n";

var meshphysical_vert = "#define PHYSICAL\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}\n";

var normal_frag = "#define NORMAL\nuniform float opacity;\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )\n\tvarying vec3 vViewPosition;\n#endif\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <packing>\n#include <uv_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\nvoid main() {\n\t#include <logdepthbuf_fragment>\n\t#include <normal_flip>\n\t#include <normal_fragment>\n\tgl_FragColor = vec4( packNormalToRGB( normal ), opacity );\n}\n";

var normal_vert = "#define NORMAL\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )\n\tvarying vec3 vViewPosition;\n#endif\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )\n\tvViewPosition = - mvPosition.xyz;\n#endif\n}\n";

var points_frag = "uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <color_pars_fragment>\n#include <map_particle_pars_fragment>\n#include <fog_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_particle_fragment>\n\t#include <color_fragment>\n\t#include <alphatest_fragment>\n\toutgoingLight = diffuseColor.rgb;\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <premultiplied_alpha_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}\n";

var points_vert = "uniform float size;\nuniform float scale;\n#include <common>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <color_vertex>\n\t#include <begin_vertex>\n\t#include <project_vertex>\n\t#ifdef USE_SIZEATTENUATION\n\t\tgl_PointSize = size * ( scale / - mvPosition.z );\n\t#else\n\t\tgl_PointSize = size;\n\t#endif\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}\n";

var shadow_frag = "uniform float opacity;\n#include <common>\n#include <packing>\n#include <bsdfs>\n#include <lights_pars>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\nvoid main() {\n\tgl_FragColor = vec4( 0.0, 0.0, 0.0, opacity * ( 1.0 - getShadowMask() ) );\n}\n";

var shadow_vert = "#include <shadowmap_pars_vertex>\nvoid main() {\n\t#include <begin_vertex>\n\t#include <project_vertex>\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n}\n";

var ShaderChunk = {
    alphamap_fragment: alphamap_fragment,
    alphamap_pars_fragment: alphamap_pars_fragment,
    alphatest_fragment: alphatest_fragment,
    aomap_fragment: aomap_fragment,
    aomap_pars_fragment: aomap_pars_fragment,
    begin_vertex: begin_vertex,
    beginnormal_vertex: beginnormal_vertex,
    bsdfs: bsdfs,
    bumpmap_pars_fragment: bumpmap_pars_fragment,
    clipping_planes_fragment: clipping_planes_fragment,
    clipping_planes_pars_fragment: clipping_planes_pars_fragment,
    clipping_planes_pars_vertex: clipping_planes_pars_vertex,
    clipping_planes_vertex: clipping_planes_vertex,
    color_fragment: color_fragment,
    color_pars_fragment: color_pars_fragment,
    color_pars_vertex: color_pars_vertex,
    color_vertex: color_vertex,
    common: common,
    cube_uv_reflection_fragment: cube_uv_reflection_fragment,
    defaultnormal_vertex: defaultnormal_vertex,
    displacementmap_pars_vertex: displacementmap_pars_vertex,
    displacementmap_vertex: displacementmap_vertex,
    emissivemap_fragment: emissivemap_fragment,
    emissivemap_pars_fragment: emissivemap_pars_fragment,
    encodings_fragment: encodings_fragment,
    encodings_pars_fragment: encodings_pars_fragment,
    envmap_fragment: envmap_fragment,
    envmap_pars_fragment: envmap_pars_fragment,
    envmap_pars_vertex: envmap_pars_vertex,
    envmap_vertex: envmap_vertex,
    fog_vertex: fog_vertex,
    fog_pars_vertex: fog_pars_vertex,
    fog_fragment: fog_fragment,
    fog_pars_fragment: fog_pars_fragment,
    gradientmap_pars_fragment: gradientmap_pars_fragment,
    lightmap_fragment: lightmap_fragment,
    lightmap_pars_fragment: lightmap_pars_fragment,
    lights_lambert_vertex: lights_lambert_vertex,
    lights_pars: lights_pars,
    lights_phong_fragment: lights_phong_fragment,
    lights_phong_pars_fragment: lights_phong_pars_fragment,
    lights_physical_fragment: lights_physical_fragment,
    lights_physical_pars_fragment: lights_physical_pars_fragment,
    lights_template: lights_template,
    logdepthbuf_fragment: logdepthbuf_fragment,
    logdepthbuf_pars_fragment: logdepthbuf_pars_fragment,
    logdepthbuf_pars_vertex: logdepthbuf_pars_vertex,
    logdepthbuf_vertex: logdepthbuf_vertex,
    map_fragment: map_fragment,
    map_pars_fragment: map_pars_fragment,
    map_particle_fragment: map_particle_fragment,
    map_particle_pars_fragment: map_particle_pars_fragment,
    metalnessmap_fragment: metalnessmap_fragment,
    metalnessmap_pars_fragment: metalnessmap_pars_fragment,
    morphnormal_vertex: morphnormal_vertex,
    morphtarget_pars_vertex: morphtarget_pars_vertex,
    morphtarget_vertex: morphtarget_vertex,
    normal_flip: normal_flip,
    normal_fragment: normal_fragment,
    normalmap_pars_fragment: normalmap_pars_fragment,
    packing: packing,
    premultiplied_alpha_fragment: premultiplied_alpha_fragment,
    project_vertex: project_vertex,
    dithering_fragment: dithering_fragment,
    dithering_pars_fragment: dithering_pars_fragment,
    roughnessmap_fragment: roughnessmap_fragment,
    roughnessmap_pars_fragment: roughnessmap_pars_fragment,
    shadowmap_pars_fragment: shadowmap_pars_fragment,
    shadowmap_pars_vertex: shadowmap_pars_vertex,
    shadowmap_vertex: shadowmap_vertex,
    shadowmask_pars_fragment: shadowmask_pars_fragment,
    skinbase_vertex: skinbase_vertex,
    skinning_pars_vertex: skinning_pars_vertex,
    skinning_vertex: skinning_vertex,
    skinnormal_vertex: skinnormal_vertex,
    specularmap_fragment: specularmap_fragment,
    specularmap_pars_fragment: specularmap_pars_fragment,
    tonemapping_fragment: tonemapping_fragment,
    tonemapping_pars_fragment: tonemapping_pars_fragment,
    uv_pars_fragment: uv_pars_fragment,
    uv_pars_vertex: uv_pars_vertex,
    uv_vertex: uv_vertex,
    uv2_pars_fragment: uv2_pars_fragment,
    uv2_pars_vertex: uv2_pars_vertex,
    uv2_vertex: uv2_vertex,
    worldpos_vertex: worldpos_vertex,

    cube_frag: cube_frag,
    cube_vert: cube_vert,
    depth_frag: depth_frag,
    depth_vert: depth_vert,
    distanceRGBA_frag: distanceRGBA_frag,
    distanceRGBA_vert: distanceRGBA_vert,
    equirect_frag: equirect_frag,
    equirect_vert: equirect_vert,
    linedashed_frag: linedashed_frag,
    linedashed_vert: linedashed_vert,
    meshbasic_frag: meshbasic_frag,
    meshbasic_vert: meshbasic_vert,
    meshlambert_frag: meshlambert_frag,
    meshlambert_vert: meshlambert_vert,
    meshphong_frag: meshphong_frag,
    meshphong_vert: meshphong_vert,
    meshphysical_frag: meshphysical_frag,
    meshphysical_vert: meshphysical_vert,
    normal_frag: normal_frag,
    normal_vert: normal_vert,
    points_frag: points_frag,
    points_vert: points_vert,
    shadow_frag: shadow_frag,
    shadow_vert: shadow_vert,

    none_frag: _none_frag2.default,
    none_vert: _none_vert2.default,
    normals_frag: _normals_frag2.default,
    normals_vert: _normals_vert2.default,
    texture_frag: _texture_frag2.default,
    texture_vert: _texture_vert2.default,
    texture_normals_frag: _texture_normals_frag2.default,
    texture_normals_vert: _texture_normals_vert2.default
};

ShaderChunk.parseIncludes = function (string) {

    var pattern = /#include +<([\w\d.]+)>/g;

    function replace(match, include) {

        var replace = ShaderChunk[include];

        if (replace === undefined) {

            throw new Error('Can not resolve #include <' + include + '>');
        }

        return ShaderChunk.parseIncludes(replace);
    }

    return string.replace(pattern, replace);
};
exports.default = ShaderChunk;

},{"./none_frag.js":21,"./none_vert.js":22,"./normals_frag.js":23,"./normals_vert.js":24,"./texture_frag.js":27,"./texture_normals_frag.js":28,"./texture_normals_vert.js":29,"./texture_vert.js":30}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ShaderChunk = require('./ShaderChunk.js');

var _ShaderChunk2 = _interopRequireDefault(_ShaderChunk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Uniforms library for shared webgl shaders
 */

var UniformsLib = {

    common: {

        diffuse: {
            value: {
                isColor: true,
                red: 1, green: 1, blue: 1, alpha: 1
                // new Cesium.Color(0xeeeeee)
            } },
        opacity: { value: 1.0 },

        map: { value: null },
        offsetRepeat: {
            value: {
                isCartesian4: true,
                x: 0, y: 0, z: 1, w: 1
                //new Cesium.Cartesian4(0, 0, 1, 1) 
            } },

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
        normalScale: {
            value: {
                isCartesian2: true,
                x: 1, y: 1
                //new Cesium.Cartesian2(1, 1) 
            } }

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
        fogColor: {
            value: {
                isColor: true,
                red: 0, green: 0, blue: 1, alpha: 1
                // new Cesium.Color(0xffffff) 
            } }

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

        diffuse: {
            value: {
                isColor: true,
                red: 1, green: 1, blue: 1, alpha: 1
                // new Cesium.Color(0xeeeeee) 
            } },
        opacity: { value: 1.0 },
        size: { value: 1.0 },
        scale: { value: 1.0 },
        map: { value: null },
        offsetRepeat: {
            value: {
                isCartesian4: true,
                x: 0, y: 0, z: 1, w: 1
                // new Cesium.Cartesian4(0, 0, 1, 1) 
            } }

    }

};

/**
 * Uniform Utilities
 */

var UniformsUtils = {

    merge: function merge(uniforms) {

        var merged = {};

        for (var u = 0; u < uniforms.length; u++) {

            var tmp = this.clone(uniforms[u]);

            for (var p in tmp) {

                merged[p] = tmp[p];
            }
        }

        return merged;
    },

    clone: function clone(uniforms_src) {

        var uniforms_dst = {};

        for (var u in uniforms_src) {

            uniforms_dst[u] = {};

            for (var p in uniforms_src[u]) {

                var parameter_src = uniforms_src[u][p];

                if (typeof Cesium != 'undefined' && parameter_src && (parameter_src instanceof Cesium.Color || parameter_src instanceof Cesium.Matrix3 || parameter_src instanceof Cesium.Matrix4 || parameter_src instanceof Cesium.Cartesian2 || parameter_src instanceof Cesium.Cartesian3 || parameter_src instanceof Cesium.Cartesian4
                //||parameter_src.isTexture
                )) {

                    uniforms_dst[u][p] = parameter_src.constructor.clone(parameter_src); //.clone();
                } else if (Array.isArray(parameter_src)) {

                    uniforms_dst[u][p] = parameter_src.slice();
                } else if (typeof Cesium != 'undefined' && parameter_src) {
                    if (parameter_src.isColor) {
                        uniforms_dst[u][p] = Cesium.Color.clone(parameter_src);
                    } else if (parameter_src.isCartesian2) {
                        uniforms_dst[u][p] = Cesium.Cartesian2.clone(parameter_src);
                    } else if (parameter_src.isCartesian3) {
                        uniforms_dst[u][p] = Cesium.Cartesian3.clone(parameter_src);
                    } else if (parameter_src.isCartesian4) {
                        uniforms_dst[u][p] = Cesium.Cartesian4.clone(parameter_src);
                    } else {

                        uniforms_dst[u][p] = parameter_src;
                    }
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

        uniforms: UniformsUtils.merge([UniformsLib.common, UniformsLib.aomap, UniformsLib.lightmap, UniformsLib.fog]),

        vertexShader: _ShaderChunk2.default.meshbasic_vert,
        fragmentShader: _ShaderChunk2.default.meshbasic_frag

    },

    lambert: {

        uniforms: UniformsUtils.merge([UniformsLib.common, UniformsLib.aomap, UniformsLib.lightmap, UniformsLib.emissivemap, UniformsLib.fog, UniformsLib.lights, {
            emissive: {
                value: {
                    isColor: true,
                    red: 1, green: 1, blue: 1, alpha: 1
                    // new Cesium.Color(0x000000) 
                } }
        }]),

        vertexShader: _ShaderChunk2.default.meshlambert_vert,
        fragmentShader: _ShaderChunk2.default.meshlambert_frag

    },

    phong: {

        uniforms: UniformsUtils.merge([UniformsLib.common, UniformsLib.aomap, UniformsLib.lightmap, UniformsLib.emissivemap, UniformsLib.bumpmap, UniformsLib.normalmap, UniformsLib.displacementmap, UniformsLib.gradientmap, UniformsLib.fog, UniformsLib.lights, {
            emissive: {
                value: {
                    isColor: true,
                    red: 1, green: 1, blue: 1, alpha: 1
                    // new Cesium.Color(0x000000) 
                } },
            specular: {
                value: {
                    isColor: true,
                    red: 1, green: 1, blue: 1, alpha: 1
                    // new Cesium.Color(0x111111) 
                } },
            shininess: { value: 30 }
        }]),

        vertexShader: _ShaderChunk2.default.meshphong_vert,
        fragmentShader: _ShaderChunk2.default.meshphong_frag

    },

    standard: {

        uniforms: UniformsUtils.merge([UniformsLib.common, UniformsLib.aomap, UniformsLib.lightmap, UniformsLib.emissivemap, UniformsLib.bumpmap, UniformsLib.normalmap, UniformsLib.displacementmap, UniformsLib.roughnessmap, UniformsLib.metalnessmap, UniformsLib.fog, UniformsLib.lights, {
            emissive: {
                value: {
                    isColor: true,
                    red: 0, green: 0, blue: 0, alpha: 1
                    // new Cesium.Color(0x000000) 
                } },
            roughness: { value: 0.5 },
            metalness: { value: 0.5 },
            envMapIntensity: { value: 1 // temporary
            } }]),

        vertexShader: _ShaderChunk2.default.meshphysical_vert,
        fragmentShader: _ShaderChunk2.default.meshphysical_frag

    },

    points: {

        uniforms: UniformsUtils.merge([UniformsLib.points, UniformsLib.fog]),

        vertexShader: _ShaderChunk2.default.points_vert,
        fragmentShader: _ShaderChunk2.default.points_frag

    },

    dashed: {

        uniforms: UniformsUtils.merge([UniformsLib.common, UniformsLib.fog, {
            scale: { value: 1 },
            dashSize: { value: 1 },
            totalSize: { value: 2 }
        }]),

        vertexShader: _ShaderChunk2.default.linedashed_vert,
        fragmentShader: _ShaderChunk2.default.linedashed_frag

    },

    depth: {

        uniforms: UniformsUtils.merge([UniformsLib.common, UniformsLib.displacementmap]),

        vertexShader: _ShaderChunk2.default.depth_vert,
        fragmentShader: _ShaderChunk2.default.depth_frag

    },

    normal: {

        uniforms: UniformsUtils.merge([UniformsLib.common, UniformsLib.bumpmap, UniformsLib.normalmap, UniformsLib.displacementmap, {
            opacity: { value: 1.0 }
        }]),

        vertexShader: _ShaderChunk2.default.normal_vert,
        fragmentShader: _ShaderChunk2.default.normal_frag

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

        vertexShader: _ShaderChunk2.default.cube_vert,
        fragmentShader: _ShaderChunk2.default.cube_frag

    },

    /* -------------------------------------------------------------------------
    //	Cube map shader
     ------------------------------------------------------------------------- */

    equirect: {

        uniforms: {
            tEquirect: { value: null },
            tFlip: { value: -1 }
        },

        vertexShader: _ShaderChunk2.default.equirect_vert,
        fragmentShader: _ShaderChunk2.default.equirect_frag

    },

    distanceRGBA: {

        uniforms: {
            lightPos: { value: {
                    isCartesian3: true,
                    x: 0, y: 0, z: 0
                    //new Cesium.Cartesian3() 
                } }
        },

        vertexShader: _ShaderChunk2.default.distanceRGBA_vert,
        fragmentShader: _ShaderChunk2.default.distanceRGBA_frag

    }

};

ShaderLib.physical = {

    uniforms: UniformsUtils.merge([ShaderLib.standard.uniforms, {
        clearCoat: { value: 0 },
        clearCoatRoughness: { value: 0 }
    }]),

    vertexShader: _ShaderChunk2.default.meshphysical_vert,
    fragmentShader: _ShaderChunk2.default.meshphysical_frag

};

exports.default = ShaderLib;

},{"./ShaderChunk.js":19}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
exports.default = none_frag;

},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var none_vert = "\n\
#ifdef GL_ES\n\
    precision highp float;\n\
#endif\n\
\n\
\n\
\n\
varying vec3 v_position;\n\
\n\
void main(void) \n\
{\n\
    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n\
    v_position = pos.xyz;\n\
    gl_Position =  projectionMatrix * pos;\n\
}";
exports.default = none_vert;

},{}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var normals_frag = "\n\
#ifdef GL_ES\n\
    precision highp float;\n\
#endif\n\
\n\
varying vec3 v_position;\n\
varying vec3 v_normal;\n\
\n\
uniform vec4 ambientColor;\n\
uniform vec4 diffuseColor;\n\
uniform vec4 specularColor;\n\
uniform float specularShininess;\n\
uniform float alpha;\n\
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
    vec4 diffuse = diffuseColor;\n\
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
    color = vec4(color.rgb * diffuse.a, diffuse.a*alpha);\n\
    gl_FragColor = color;\n\
    if(picked!=0.0){\n\
        gl_FragColor =mix(color, pickedColor*0.5,1.0);\n\
    }\n\
}";
exports.default = normals_frag;

},{}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var normals_vert = "\n\
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

exports.default = normals_vert;

},{}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var phong_frag = '\n\
varying vec3 v_position;\n\
varying vec3 v_normal;\n\
uniform float picked;\n\
uniform vec4  pickedColor;\n\
uniform vec4  defaultColor;\n\
uniform float specular;\n\
uniform float shininess;\n\
uniform vec3  emission;\n\
uniform vec3  u_cameraPosition;\n\
void main() {\n\
    vec3 positionToEyeEC = -v_position; \n\
    vec3 normalEC =normalize(v_normal);\n\
    vec4 color=defaultColor;\n\
    if(picked!=0.0){\n\
        color = pickedColor;\n\
    }\n\
    czm_material material;\n\
    material.specular = specular;\n\
    material.shininess = shininess;\n\
    material.normal =  normalEC;\n\
    material.emission =emission;//vec3(0.2,0.2,0.2);\n\
    material.diffuse = color.rgb ;\n\
    material.alpha =  color.a;\n\
    vec3 lightDirectionEC=-u_cameraPosition;\n\
    gl_FragColor =  czm_phong(normalize(positionToEyeEC), material,lightDirectionEC);\n\
}';

exports.default = phong_frag;

},{}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

exports.default = phong_vert;

},{}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var texture_frag = "\n\
#ifdef GL_ES\n\
    precision highp float;\n\
#endif\n\
\n\
varying vec3 v_position;\n\
varying vec2 v_texcoord0;\n\
\n\
uniform vec4 ambientColor;\n\
uniform sampler2D diffuseColorMap;\n\
uniform vec4 specularColor;\n\
uniform float specularShininess;\n\
uniform float picked;\n\
uniform vec4  pickedColor;\n\
\n\
uniform float alpha;\n\
\n\
void main(void) \n\
{\n\
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);\n\
    vec3 diffuseLight = vec3(0.0, 0.0, 0.0);\n\
    vec3 lightColor = vec3(1.0,1.0,1.0);\n\
    vec4 ambient = ambientColor;\n\
    vec4 diffuse = texture2D(diffuseColorMap, v_texcoord0);\n\
    vec4 specular = specularColor;\n\
    color.xyz += ambient.xyz;\n\
    color.xyz += diffuse.xyz;\n\
    color.xyz += specular.xyz;\n\
    color = vec4(diffuse.rgb * diffuse.a, diffuse.a*alpha);\n\
    gl_FragColor = color;\n\
    if(picked!=0.0){\n\
        gl_FragColor =mix(color, pickedColor*0.5,1.0);\n\
    }\n\
}";
exports.default = texture_frag;

},{}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

exports.default = texture_normals_frag;

},{}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var texture_normals_vert = "\n\
#ifdef GL_ES\n\
    precision highp float;\n\
#endif\n\
\n\
\n\
\n\
varying vec3 v_position;\n\
varying vec2 v_texcoord0;\n\
varying vec3 v_normal;\n\
\n\
varying vec3 v_light0Direction;\n\
\n\
void main(void) \n\
{\n\
    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n\
    v_normal =  normalMatrix *  normal;\n\
    v_texcoord0 =uv;\n\
    v_position = pos.xyz;\n\
    v_light0Direction = mat3( modelViewMatrix) * vec3(1.0,1.0,1.0);\n\
    gl_Position =  projectionMatrix * pos;\n\
}";
exports.default = texture_normals_vert;

},{}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var texture_vert = "\n\
#ifdef GL_ES\n\
    precision highp float;\n\
#endif\n\
\n\
\n\
\n\
varying vec3 v_position;\n\
varying vec2 v_texcoord0;\n\
\n\
void main(void) \n\
{\n\
    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n\
    v_texcoord0 =  uv;\n\
    v_position = pos.xyz;\n\
    gl_Position =  projectionMatrix * pos;\n\
}";

exports.default = texture_vert;

},{}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defineProperty = exports.ShaderUtils = exports.MaterialUtils = exports.MeshPhongMaterial = exports.CSG = exports.PlaneBufferGeometry = exports.BasicGeometry = exports.BasicMeshMaterial = exports.ReferenceMesh = exports.Rotation = exports.PlaneGeometry = exports.LOD = exports.GeometryUtils = exports.FramebufferTexture = exports.MeshVisualizer = exports.ShaderLib = exports.ShaderChunk = exports.MeshMaterial = exports.Mesh = exports.RendererUtils = undefined;

var _RendererUtils = require('./Core/RendererUtils.js');

var _RendererUtils2 = _interopRequireDefault(_RendererUtils);

var _Mesh = require('./Core/Mesh.js');

var _Mesh2 = _interopRequireDefault(_Mesh);

var _MeshMaterial = require('./Core/MeshMaterial.js');

var _MeshMaterial2 = _interopRequireDefault(_MeshMaterial);

var _ShaderChunk = require('./Core/Shaders/ShaderChunk.js');

var _ShaderChunk2 = _interopRequireDefault(_ShaderChunk);

var _MeshVisualizer = require('./Core/MeshVisualizer.js');

var _MeshVisualizer2 = _interopRequireDefault(_MeshVisualizer);

var _FramebufferTexture = require('./Core/FramebufferTexture.js');

var _FramebufferTexture2 = _interopRequireDefault(_FramebufferTexture);

var _GeometryUtils = require('./Core/GeometryUtils.js');

var _GeometryUtils2 = _interopRequireDefault(_GeometryUtils);

var _LOD = require('./Core/LOD.js');

var _LOD2 = _interopRequireDefault(_LOD);

var _PlaneGeometry = require('./Core/PlaneGeometry.js');

var _PlaneGeometry2 = _interopRequireDefault(_PlaneGeometry);

var _Rotation = require('./Core/Rotation.js');

var _Rotation2 = _interopRequireDefault(_Rotation);

var _ReferenceMesh = require('./Core/ReferenceMesh.js');

var _ReferenceMesh2 = _interopRequireDefault(_ReferenceMesh);

var _BasicMeshMaterial = require('./Core/BasicMeshMaterial.js');

var _BasicMeshMaterial2 = _interopRequireDefault(_BasicMeshMaterial);

var _BasicGeometry = require('./Core/BasicGeometry.js');

var _BasicGeometry2 = _interopRequireDefault(_BasicGeometry);

var _ShaderLib = require('./Core/Shaders/ShaderLib.js');

var _ShaderLib2 = _interopRequireDefault(_ShaderLib);

var _PlaneBufferGeometry = require('./Core/PlaneBufferGeometry.js');

var _PlaneBufferGeometry2 = _interopRequireDefault(_PlaneBufferGeometry);

var _CSG = require('./Util/CSG.js');

var _CSG2 = _interopRequireDefault(_CSG);

var _MeshPhongMaterial = require('./Core/MeshPhongMaterial.js');

var _MeshPhongMaterial2 = _interopRequireDefault(_MeshPhongMaterial);

var _MaterialUtils = require('./Core/MaterialUtils.js');

var _MaterialUtils2 = _interopRequireDefault(_MaterialUtils);

var _ShaderUtils = require('./Core/ShaderUtils.js');

var _ShaderUtils2 = _interopRequireDefault(_ShaderUtils);

var _defineProperty = require('./Util/defineProperty.js');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// var g = typeof window != 'undefined' ? window : (typeof global != 'undefined' ? global : globalThis);
var CesiumMeshVisualizer = {};
if (typeof Cesium !== 'undefined') {
    //     g.Cesium = {};
    // } else {
    CesiumMeshVisualizer = Cesium;
}

CesiumMeshVisualizer.defineProperty = _defineProperty2.default;
CesiumMeshVisualizer.RendererUtils = _RendererUtils2.default;
CesiumMeshVisualizer.MaterialUtils = _MaterialUtils2.default;
CesiumMeshVisualizer.ShaderUtils = _ShaderUtils2.default;
CesiumMeshVisualizer.GeometryUtils = _GeometryUtils2.default;

CesiumMeshVisualizer.Mesh = _Mesh2.default;
CesiumMeshVisualizer.MeshMaterial = _MeshMaterial2.default;
CesiumMeshVisualizer.ShaderChunk = _ShaderChunk2.default;
CesiumMeshVisualizer.ShaderLib = _ShaderLib2.default;
CesiumMeshVisualizer.MeshVisualizer = _MeshVisualizer2.default;
CesiumMeshVisualizer.FramebufferTexture = _FramebufferTexture2.default;
CesiumMeshVisualizer.LOD = _LOD2.default;
CesiumMeshVisualizer.PlaneGeometry = _PlaneGeometry2.default;
CesiumMeshVisualizer.Rotation = _Rotation2.default;
CesiumMeshVisualizer.ReferenceMesh = _ReferenceMesh2.default;
CesiumMeshVisualizer.BasicMeshMaterial = _BasicMeshMaterial2.default;
CesiumMeshVisualizer.BasicGeometry = _BasicGeometry2.default;
CesiumMeshVisualizer.PlaneBufferGeometry = _PlaneBufferGeometry2.default;
CesiumMeshVisualizer.CSG = _CSG2.default;
CesiumMeshVisualizer.MeshPhongMaterial = _MeshPhongMaterial2.default;
CesiumMeshVisualizer.MeshVisualizerVERSION = '1.0.1';

exports.RendererUtils = _RendererUtils2.default;
exports.Mesh = _Mesh2.default;
exports.MeshMaterial = _MeshMaterial2.default;
exports.ShaderChunk = _ShaderChunk2.default;
exports.ShaderLib = _ShaderLib2.default;
exports.MeshVisualizer = _MeshVisualizer2.default;
exports.FramebufferTexture = _FramebufferTexture2.default;
exports.GeometryUtils = _GeometryUtils2.default;
exports.LOD = _LOD2.default;
exports.PlaneGeometry = _PlaneGeometry2.default;
exports.Rotation = _Rotation2.default;
exports.ReferenceMesh = _ReferenceMesh2.default;
exports.BasicMeshMaterial = _BasicMeshMaterial2.default;
exports.BasicGeometry = _BasicGeometry2.default;
exports.PlaneBufferGeometry = _PlaneBufferGeometry2.default;
exports.CSG = _CSG2.default;
exports.MeshPhongMaterial = _MeshPhongMaterial2.default;
exports.MaterialUtils = _MaterialUtils2.default;
exports.ShaderUtils = _ShaderUtils2.default;
exports.defineProperty = _defineProperty2.default;
exports.default = CesiumMeshVisualizer;

if (typeof module != 'undefined') {
    module.exports = CesiumMeshVisualizer;
}

},{"./Core/BasicGeometry.js":2,"./Core/BasicMeshMaterial.js":3,"./Core/FramebufferTexture.js":4,"./Core/GeometryUtils.js":5,"./Core/LOD.js":6,"./Core/MaterialUtils.js":7,"./Core/Mesh.js":8,"./Core/MeshMaterial.js":9,"./Core/MeshPhongMaterial.js":10,"./Core/MeshVisualizer.js":12,"./Core/PlaneBufferGeometry.js":13,"./Core/PlaneGeometry.js":14,"./Core/ReferenceMesh.js":15,"./Core/RendererUtils.js":16,"./Core/Rotation.js":17,"./Core/ShaderUtils.js":18,"./Core/Shaders/ShaderChunk.js":19,"./Core/Shaders/ShaderLib.js":20,"./Util/CSG.js":34,"./Util/defineProperty.js":36}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Constructive Solid Geometry (CSG) is a modeling technique that uses Boolean
// operations like union and intersection to combine 3D solids. This library
// implements CSG operations on meshes elegantly and concisely using BSP trees,
// and is meant to serve as an easily understandable implementation of the
// algorithm. All edge cases involving overlapping coplanar polygons in both
// solids are correctly handled.
// 
// Example usage:
// 
//     var cube = CSG.cube();
//     var sphere = CSG.sphere({ radius: 1.3 });
//     var polygons = cube.subtract(sphere).toPolygons();
// 
// ## Implementation Details
// 
// All CSG operations are implemented in terms of two functions, `clipTo()` and
// `invert()`, which remove parts of a BSP tree inside another BSP tree and swap
// solid and empty space, respectively. To find the union of `a` and `b`, we
// want to remove everything in `a` inside `b` and everything in `b` inside `a`,
// then combine polygons from `a` and `b` into one solid:
// 
//     a.clipTo(b);
//     b.clipTo(a);
//     a.build(b.allPolygons());
// 
// The only tricky part is handling overlapping coplanar polygons in both trees.
// The code above keeps both copies, but we need to keep them in one tree and
// remove them in the other tree. To remove them from `b` we can clip the
// inverse of `b` against `a`. The code for union now looks like this:
// 
//     a.clipTo(b);
//     b.clipTo(a);
//     b.invert();
//     b.clipTo(a);
//     b.invert();
//     a.build(b.allPolygons());
// 
// Subtraction and intersection naturally follow from set operations. If
// union is `A | B`, subtraction is `A - B = ~(~A | B)` and intersection is
// `A & B = ~(~A | ~B)` where `~` is the complement operator.
// 
// ## License
// 
// Copyright (c) 2011 Evan Wallace (http://madebyevan.com/), under the MIT license.

// # class CSG

// Holds a binary space partition tree representing a 3D solid. Two solids can
// be combined using the `union()`, `subtract()`, and `intersect()` methods.

function CSG() {
  this.polygons = [];
};

// Construct a CSG solid from a list of `CSG.Polygon` instances.
CSG.fromPolygons = function (polygons) {
  var csg = new CSG();
  csg.polygons = polygons;
  return csg;
};

CSG.prototype = {
  clone: function clone() {
    var csg = new CSG();
    csg.polygons = this.polygons.map(function (p) {
      return p.clone();
    });
    return csg;
  },

  toPolygons: function toPolygons() {
    return this.polygons;
  },

  // Return a new CSG solid representing space in either this solid or in the
  // solid `csg`. Neither this solid nor the solid `csg` are modified.
  // 
  //     A.union(B)
  // 
  //     +-------+            +-------+
  //     |       |            |       |
  //     |   A   |            |       |
  //     |    +--+----+   =   |       +----+
  //     +----+--+    |       +----+       |
  //          |   B   |            |       |
  //          |       |            |       |
  //          +-------+            +-------+
  // 
  union: function union(csg) {
    var a = new CSG.Node(this.clone().polygons);
    var b = new CSG.Node(csg.clone().polygons);
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    return CSG.fromPolygons(a.allPolygons());
  },

  // Return a new CSG solid representing space in this solid but not in the
  // solid `csg`. Neither this solid nor the solid `csg` are modified.
  // 
  //     A.subtract(B)
  // 
  //     +-------+            +-------+
  //     |       |            |       |
  //     |   A   |            |       |
  //     |    +--+----+   =   |    +--+
  //     +----+--+    |       +----+
  //          |   B   |
  //          |       |
  //          +-------+
  // 
  subtract: function subtract(csg) {
    var a = new CSG.Node(this.clone().polygons);
    var b = new CSG.Node(csg.clone().polygons);
    a.invert();
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    a.invert();
    return CSG.fromPolygons(a.allPolygons());
  },

  // Return a new CSG solid representing space both this solid and in the
  // solid `csg`. Neither this solid nor the solid `csg` are modified.
  // 
  //     A.intersect(B)
  // 
  //     +-------+
  //     |       |
  //     |   A   |
  //     |    +--+----+   =   +--+
  //     +----+--+    |       +--+
  //          |   B   |
  //          |       |
  //          +-------+
  // 
  intersect: function intersect(csg) {
    var a = new CSG.Node(this.clone().polygons);
    var b = new CSG.Node(csg.clone().polygons);
    a.invert();
    b.clipTo(a);
    b.invert();
    a.clipTo(b);
    b.clipTo(a);
    a.build(b.allPolygons());
    a.invert();
    return CSG.fromPolygons(a.allPolygons());
  },

  // Return a new CSG solid with solid and empty space switched. This solid is
  // not modified.
  inverse: function inverse() {
    var csg = this.clone();
    csg.polygons.map(function (p) {
      p.flip();
    });
    return csg;
  }
};

// Construct an axis-aligned solid cuboid. Optional parameters are `center` and
// `radius`, which default to `[0, 0, 0]` and `[1, 1, 1]`. The radius can be
// specified using a single number or a list of three numbers, one for each axis.
// 
// Example code:
// 
//     var cube = CSG.cube({
//       center: [0, 0, 0],
//       radius: 1
//     });
CSG.cube = function (options) {
  options = options || {};
  var c = new CSG.Vector(options.center || [0, 0, 0]);
  var r = !options.radius ? [1, 1, 1] : options.radius.length ? options.radius : [options.radius, options.radius, options.radius];
  return CSG.fromPolygons([[[0, 4, 6, 2], [-1, 0, 0]], [[1, 3, 7, 5], [+1, 0, 0]], [[0, 1, 5, 4], [0, -1, 0]], [[2, 6, 7, 3], [0, +1, 0]], [[0, 2, 3, 1], [0, 0, -1]], [[4, 5, 7, 6], [0, 0, +1]]].map(function (info) {
    return new CSG.Polygon(info[0].map(function (i) {
      var pos = new CSG.Vector(c.x + r[0] * (2 * !!(i & 1) - 1), c.y + r[1] * (2 * !!(i & 2) - 1), c.z + r[2] * (2 * !!(i & 4) - 1));
      return new CSG.Vertex(pos, new CSG.Vector(info[1]));
    }));
  }));
};

// Construct a solid sphere. Optional parameters are `center`, `radius`,
// `slices`, and `stacks`, which default to `[0, 0, 0]`, `1`, `16`, and `8`.
// The `slices` and `stacks` parameters control the tessellation along the
// longitude and latitude directions.
// 
// Example usage:
// 
//     var sphere = CSG.sphere({
//       center: [0, 0, 0],
//       radius: 1,
//       slices: 16,
//       stacks: 8
//     });
CSG.sphere = function (options) {
  options = options || {};
  var c = new CSG.Vector(options.center || [0, 0, 0]);
  var r = options.radius || 1;
  var slices = options.slices || 16;
  var stacks = options.stacks || 8;
  var polygons = [],
      vertices;
  function vertex(theta, phi) {
    theta *= Math.PI * 2;
    phi *= Math.PI;
    var dir = new CSG.Vector(Math.cos(theta) * Math.sin(phi), Math.cos(phi), Math.sin(theta) * Math.sin(phi));
    vertices.push(new CSG.Vertex(c.plus(dir.times(r)), dir));
  }
  for (var i = 0; i < slices; i++) {
    for (var j = 0; j < stacks; j++) {
      vertices = [];
      vertex(i / slices, j / stacks);
      if (j > 0) vertex((i + 1) / slices, j / stacks);
      if (j < stacks - 1) vertex((i + 1) / slices, (j + 1) / stacks);
      vertex(i / slices, (j + 1) / stacks);
      polygons.push(new CSG.Polygon(vertices));
    }
  }
  return CSG.fromPolygons(polygons);
};

// Construct a solid cylinder. Optional parameters are `start`, `end`,
// `radius`, and `slices`, which default to `[0, -1, 0]`, `[0, 1, 0]`, `1`, and
// `16`. The `slices` parameter controls the tessellation.
// 
// Example usage:
// 
//     var cylinder = CSG.cylinder({
//       start: [0, -1, 0],
//       end: [0, 1, 0],
//       radius: 1,
//       slices: 16
//     });
CSG.cylinder = function (options) {
  options = options || {};
  var s = new CSG.Vector(options.start || [0, -1, 0]);
  var e = new CSG.Vector(options.end || [0, 1, 0]);
  var ray = e.minus(s);
  var r = options.radius || 1;
  var slices = options.slices || 16;
  var axisZ = ray.unit(),
      isY = Math.abs(axisZ.y) > 0.5;
  var axisX = new CSG.Vector(isY, !isY, 0).cross(axisZ).unit();
  var axisY = axisX.cross(axisZ).unit();
  var start = new CSG.Vertex(s, axisZ.negated());
  var end = new CSG.Vertex(e, axisZ.unit());
  var polygons = [];
  function point(stack, slice, normalBlend) {
    var angle = slice * Math.PI * 2;
    var out = axisX.times(Math.cos(angle)).plus(axisY.times(Math.sin(angle)));
    var pos = s.plus(ray.times(stack)).plus(out.times(r));
    var normal = out.times(1 - Math.abs(normalBlend)).plus(axisZ.times(normalBlend));
    return new CSG.Vertex(pos, normal);
  }
  for (var i = 0; i < slices; i++) {
    var t0 = i / slices,
        t1 = (i + 1) / slices;
    polygons.push(new CSG.Polygon([start, point(0, t0, -1), point(0, t1, -1)]));
    polygons.push(new CSG.Polygon([point(0, t1, 0), point(0, t0, 0), point(1, t0, 0), point(1, t1, 0)]));
    polygons.push(new CSG.Polygon([end, point(1, t1, 1), point(1, t0, 1)]));
  }
  return CSG.fromPolygons(polygons);
};

// # class Vector

// Represents a 3D vector.
// 
// Example usage:
// 
//     new CSG.Vector(1, 2, 3);
//     new CSG.Vector([1, 2, 3]);
//     new CSG.Vector({ x: 1, y: 2, z: 3 });

CSG.Vector = function (x, y, z) {
  if (arguments.length == 3) {
    this.x = x;
    this.y = y;
    this.z = z;
  } else if ('x' in x) {
    this.x = x.x;
    this.y = x.y;
    this.z = x.z;
  } else {
    this.x = x[0];
    this.y = x[1];
    this.z = x[2];
  }
};

CSG.Vector.prototype = {
  clone: function clone() {
    return new CSG.Vector(this.x, this.y, this.z);
  },

  negated: function negated() {
    return new CSG.Vector(-this.x, -this.y, -this.z);
  },

  plus: function plus(a) {
    return new CSG.Vector(this.x + a.x, this.y + a.y, this.z + a.z);
  },

  minus: function minus(a) {
    return new CSG.Vector(this.x - a.x, this.y - a.y, this.z - a.z);
  },

  times: function times(a) {
    return new CSG.Vector(this.x * a, this.y * a, this.z * a);
  },

  dividedBy: function dividedBy(a) {
    return new CSG.Vector(this.x / a, this.y / a, this.z / a);
  },

  dot: function dot(a) {
    return this.x * a.x + this.y * a.y + this.z * a.z;
  },

  lerp: function lerp(a, t) {
    return this.plus(a.minus(this).times(t));
  },

  length: function length() {
    return Math.sqrt(this.dot(this));
  },

  unit: function unit() {
    return this.dividedBy(this.length());
  },

  cross: function cross(a) {
    return new CSG.Vector(this.y * a.z - this.z * a.y, this.z * a.x - this.x * a.z, this.x * a.y - this.y * a.x);
  }
};

// # class Vertex

// Represents a vertex of a polygon. Use your own vertex class instead of this
// one to provide additional features like texture coordinates and vertex
// colors. Custom vertex classes need to provide a `pos` property and `clone()`,
// `flip()`, and `interpolate()` methods that behave analogous to the ones
// defined by `CSG.Vertex`. This class provides `normal` so convenience
// functions like `CSG.sphere()` can return a smooth vertex normal, but `normal`
// is not used anywhere else.

CSG.Vertex = function (pos, normal) {
  this.pos = new CSG.Vector(pos);
  this.normal = new CSG.Vector(normal);
};

CSG.Vertex.prototype = {
  clone: function clone() {
    return new CSG.Vertex(this.pos.clone(), this.normal.clone());
  },

  // Invert all orientation-specific data (e.g. vertex normal). Called when the
  // orientation of a polygon is flipped.
  flip: function flip() {
    this.normal = this.normal.negated();
  },

  // Create a new vertex between this vertex and `other` by linearly
  // interpolating all properties using a parameter of `t`. Subclasses should
  // override this to interpolate additional properties.
  interpolate: function interpolate(other, t) {
    return new CSG.Vertex(this.pos.lerp(other.pos, t), this.normal.lerp(other.normal, t));
  }
};

// # class Plane

// Represents a plane in 3D space.

CSG.Plane = function (normal, w) {
  this.normal = normal;
  this.w = w;
};

// `CSG.Plane.EPSILON` is the tolerance used by `splitPolygon()` to decide if a
// point is on the plane.
CSG.Plane.EPSILON = 1e-5;

CSG.Plane.fromPoints = function (a, b, c) {
  var n = b.minus(a).cross(c.minus(a)).unit();
  return new CSG.Plane(n, n.dot(a));
};

CSG.Plane.prototype = {
  clone: function clone() {
    return new CSG.Plane(this.normal.clone(), this.w);
  },

  flip: function flip() {
    this.normal = this.normal.negated();
    this.w = -this.w;
  },

  // Split `polygon` by this plane if needed, then put the polygon or polygon
  // fragments in the appropriate lists. Coplanar polygons go into either
  // `coplanarFront` or `coplanarBack` depending on their orientation with
  // respect to this plane. Polygons in front or in back of this plane go into
  // either `front` or `back`.
  splitPolygon: function splitPolygon(polygon, coplanarFront, coplanarBack, front, back) {
    var COPLANAR = 0;
    var FRONT = 1;
    var BACK = 2;
    var SPANNING = 3;

    // Classify each point as well as the entire polygon into one of the above
    // four classes.
    var polygonType = 0;
    var types = [];
    for (var i = 0; i < polygon.vertices.length; i++) {
      var t = this.normal.dot(polygon.vertices[i].pos) - this.w;
      var type = t < -CSG.Plane.EPSILON ? BACK : t > CSG.Plane.EPSILON ? FRONT : COPLANAR;
      polygonType |= type;
      types.push(type);
    }

    // Put the polygon in the correct list, splitting it when necessary.
    switch (polygonType) {
      case COPLANAR:
        (this.normal.dot(polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
        break;
      case FRONT:
        front.push(polygon);
        break;
      case BACK:
        back.push(polygon);
        break;
      case SPANNING:
        var f = [],
            b = [];
        for (var i = 0; i < polygon.vertices.length; i++) {
          var j = (i + 1) % polygon.vertices.length;
          var ti = types[i],
              tj = types[j];
          var vi = polygon.vertices[i],
              vj = polygon.vertices[j];
          if (ti != BACK) f.push(vi);
          if (ti != FRONT) b.push(ti != BACK ? vi.clone() : vi);
          if ((ti | tj) == SPANNING) {
            var t = (this.w - this.normal.dot(vi.pos)) / this.normal.dot(vj.pos.minus(vi.pos));
            var v = vi.interpolate(vj, t);
            f.push(v);
            b.push(v.clone());
          }
        }
        if (f.length >= 3) front.push(new CSG.Polygon(f, polygon.shared));
        if (b.length >= 3) back.push(new CSG.Polygon(b, polygon.shared));
        break;
    }
  }
};

// # class Polygon

// Represents a convex polygon. The vertices used to initialize a polygon must
// be coplanar and form a convex loop. They do not have to be `CSG.Vertex`
// instances but they must behave similarly (duck typing can be used for
// customization).
// 
// Each convex polygon has a `shared` property, which is shared between all
// polygons that are clones of each other or were split from the same polygon.
// This can be used to define per-polygon properties (such as surface color).

CSG.Polygon = function (vertices, shared) {
  this.vertices = vertices;
  this.shared = shared;
  this.plane = CSG.Plane.fromPoints(vertices[0].pos, vertices[1].pos, vertices[2].pos);
};

CSG.Polygon.prototype = {
  clone: function clone() {
    var vertices = this.vertices.map(function (v) {
      return v.clone();
    });
    return new CSG.Polygon(vertices, this.shared);
  },

  flip: function flip() {
    this.vertices.reverse().map(function (v) {
      v.flip();
    });
    this.plane.flip();
  }
};

// # class Node

// Holds a node in a BSP tree. A BSP tree is built from a collection of polygons
// by picking a polygon to split along. That polygon (and all other coplanar
// polygons) are added directly to that node and the other polygons are added to
// the front and/or back subtrees. This is not a leafy BSP tree since there is
// no distinction between internal and leaf nodes.

CSG.Node = function (polygons) {
  this.plane = null;
  this.front = null;
  this.back = null;
  this.polygons = [];
  if (polygons) this.build(polygons);
};

CSG.Node.prototype = {
  clone: function clone() {
    var node = new CSG.Node();
    node.plane = this.plane && this.plane.clone();
    node.front = this.front && this.front.clone();
    node.back = this.back && this.back.clone();
    node.polygons = this.polygons.map(function (p) {
      return p.clone();
    });
    return node;
  },

  // Convert solid space to empty space and empty space to solid space.
  invert: function invert() {
    for (var i = 0; i < this.polygons.length; i++) {
      this.polygons[i].flip();
    }
    this.plane.flip();
    if (this.front) this.front.invert();
    if (this.back) this.back.invert();
    var temp = this.front;
    this.front = this.back;
    this.back = temp;
  },

  // Recursively remove all polygons in `polygons` that are inside this BSP
  // tree.
  clipPolygons: function clipPolygons(polygons) {
    if (!this.plane) return polygons.slice();
    var front = [],
        back = [];
    for (var i = 0; i < polygons.length; i++) {
      this.plane.splitPolygon(polygons[i], front, back, front, back);
    }
    if (this.front) front = this.front.clipPolygons(front);
    if (this.back) back = this.back.clipPolygons(back);else back = [];
    return front.concat(back);
  },

  // Remove all polygons in this BSP tree that are inside the other BSP tree
  // `bsp`.
  clipTo: function clipTo(bsp) {
    this.polygons = bsp.clipPolygons(this.polygons);
    if (this.front) this.front.clipTo(bsp);
    if (this.back) this.back.clipTo(bsp);
  },

  // Return a list of all polygons in this BSP tree.
  allPolygons: function allPolygons() {
    var polygons = this.polygons.slice();
    if (this.front) polygons = polygons.concat(this.front.allPolygons());
    if (this.back) polygons = polygons.concat(this.back.allPolygons());
    return polygons;
  },

  // Build a BSP tree out of `polygons`. When called on an existing tree, the
  // new polygons are filtered down to the bottom of the tree and become new
  // nodes there. Each set of polygons is partitioned using the first polygon
  // (no heuristic is used to pick a good split).
  build: function build(polygons) {
    if (!polygons.length) return;
    if (!this.plane) this.plane = polygons[0].plane.clone();
    var front = [],
        back = [];
    for (var i = 0; i < polygons.length; i++) {
      this.plane.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
    }
    if (front.length) {
      if (!this.front) this.front = new CSG.Node();
      this.front.build(front);
    }
    if (back.length) {
      if (!this.back) this.back = new CSG.Node();
      this.back.build(back);
    }
  }
};

exports.default = CSG;

},{}],33:[function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
function TIFFParser() {
	this.tiffDataView = undefined;
	this.littleEndian = undefined;
	this.fileDirectories = [];
};

TIFFParser.prototype = {
	isLittleEndian: function isLittleEndian() {
		// Get byte order mark.
		var BOM = this.getBytes(2, 0);

		// Find out the endianness.
		if (BOM === 0x4949) {
			this.littleEndian = true;
		} else if (BOM === 0x4D4D) {
			this.littleEndian = false;
		} else {
			console.log(BOM);
			throw TypeError("Invalid byte order value.");
		}

		return this.littleEndian;
	},

	hasTowel: function hasTowel() {
		// Check for towel.
		if (this.getBytes(2, 2) !== 42) {
			throw RangeError("You forgot your towel!");
			return false;
		}

		return true;
	},

	getFieldTagName: function getFieldTagName(fieldTag) {
		// See: http://www.digitizationguidelines.gov/guidelines/TIFF_Metadata_Final.pdf
		// See: http://www.digitalpreservation.gov/formats/content/tiff_tags.shtml
		var fieldTagNames = {
			// TIFF Baseline
			0x013B: 'Artist',
			0x0102: 'BitsPerSample',
			0x0109: 'CellLength',
			0x0108: 'CellWidth',
			0x0140: 'ColorMap',
			0x0103: 'Compression',
			0x8298: 'Copyright',
			0x0132: 'DateTime',
			0x0152: 'ExtraSamples',
			0x010A: 'FillOrder',
			0x0121: 'FreeByteCounts',
			0x0120: 'FreeOffsets',
			0x0123: 'GrayResponseCurve',
			0x0122: 'GrayResponseUnit',
			0x013C: 'HostComputer',
			0x010E: 'ImageDescription',
			0x0101: 'ImageLength',
			0x0100: 'ImageWidth',
			0x010F: 'Make',
			0x0119: 'MaxSampleValue',
			0x0118: 'MinSampleValue',
			0x0110: 'Model',
			0x00FE: 'NewSubfileType',
			0x0112: 'Orientation',
			0x0106: 'PhotometricInterpretation',
			0x011C: 'PlanarConfiguration',
			0x0128: 'ResolutionUnit',
			0x0116: 'RowsPerStrip',
			0x0115: 'SamplesPerPixel',
			0x0131: 'Software',
			0x0117: 'StripByteCounts',
			0x0111: 'StripOffsets',
			0x00FF: 'SubfileType',
			0x0107: 'Threshholding',
			0x011A: 'XResolution',
			0x011B: 'YResolution',

			// TIFF Extended
			0x0146: 'BadFaxLines',
			0x0147: 'CleanFaxData',
			0x0157: 'ClipPath',
			0x0148: 'ConsecutiveBadFaxLines',
			0x01B1: 'Decode',
			0x01B2: 'DefaultImageColor',
			0x010D: 'DocumentName',
			0x0150: 'DotRange',
			0x0141: 'HalftoneHints',
			0x015A: 'Indexed',
			0x015B: 'JPEGTables',
			0x011D: 'PageName',
			0x0129: 'PageNumber',
			0x013D: 'Predictor',
			0x013F: 'PrimaryChromaticities',
			0x0214: 'ReferenceBlackWhite',
			0x0153: 'SampleFormat',
			0x022F: 'StripRowCounts',
			0x014A: 'SubIFDs',
			0x0124: 'T4Options',
			0x0125: 'T6Options',
			0x0145: 'TileByteCounts',
			0x0143: 'TileLength',
			0x0144: 'TileOffsets',
			0x0142: 'TileWidth',
			0x012D: 'TransferFunction',
			0x013E: 'WhitePoint',
			0x0158: 'XClipPathUnits',
			0x011E: 'XPosition',
			0x0211: 'YCbCrCoefficients',
			0x0213: 'YCbCrPositioning',
			0x0212: 'YCbCrSubSampling',
			0x0159: 'YClipPathUnits',
			0x011F: 'YPosition',

			// EXIF
			0x9202: 'ApertureValue',
			0xA001: 'ColorSpace',
			0x9004: 'DateTimeDigitized',
			0x9003: 'DateTimeOriginal',
			0x8769: 'Exif IFD',
			0x9000: 'ExifVersion',
			0x829A: 'ExposureTime',
			0xA300: 'FileSource',
			0x9209: 'Flash',
			0xA000: 'FlashpixVersion',
			0x829D: 'FNumber',
			0xA420: 'ImageUniqueID',
			0x9208: 'LightSource',
			0x927C: 'MakerNote',
			0x9201: 'ShutterSpeedValue',
			0x9286: 'UserComment',

			// IPTC
			0x83BB: 'IPTC',

			// ICC
			0x8773: 'ICC Profile',

			// XMP
			0x02BC: 'XMP',

			// GDAL
			0xA480: 'GDAL_METADATA',
			0xA481: 'GDAL_NODATA',

			// Photoshop
			0x8649: 'Photoshop'
		};

		var fieldTagName;

		if (fieldTag in fieldTagNames) {
			fieldTagName = fieldTagNames[fieldTag];
		} else {
			//console.log( "Unknown Field Tag:", fieldTag);
			fieldTagName = "Tag" + fieldTag;
		}

		return fieldTagName;
	},

	getFieldTypeName: function getFieldTypeName(fieldType) {
		var fieldTypeNames = {
			0x0001: 'BYTE',
			0x0002: 'ASCII',
			0x0003: 'SHORT',
			0x0004: 'LONG',
			0x0005: 'RATIONAL',
			0x0006: 'SBYTE',
			0x0007: 'UNDEFINED',
			0x0008: 'SSHORT',
			0x0009: 'SLONG',
			0x000A: 'SRATIONAL',
			0x000B: 'FLOAT',
			0x000C: 'DOUBLE'
		};

		var fieldTypeName;

		if (fieldType in fieldTypeNames) {
			fieldTypeName = fieldTypeNames[fieldType];
		}

		return fieldTypeName;
	},

	getFieldTypeLength: function getFieldTypeLength(fieldTypeName) {
		var fieldTypeLength;

		if (['BYTE', 'ASCII', 'SBYTE', 'UNDEFINED'].indexOf(fieldTypeName) !== -1) {
			fieldTypeLength = 1;
		} else if (['SHORT', 'SSHORT'].indexOf(fieldTypeName) !== -1) {
			fieldTypeLength = 2;
		} else if (['LONG', 'SLONG', 'FLOAT'].indexOf(fieldTypeName) !== -1) {
			fieldTypeLength = 4;
		} else if (['RATIONAL', 'SRATIONAL', 'DOUBLE'].indexOf(fieldTypeName) !== -1) {
			fieldTypeLength = 8;
		}

		return fieldTypeLength;
	},

	getBits: function getBits(numBits, byteOffset, bitOffset) {
		bitOffset = bitOffset || 0;
		var extraBytes = Math.floor(bitOffset / 8);
		var newByteOffset = byteOffset + extraBytes;
		var totalBits = bitOffset + numBits;
		var shiftRight = 32 - numBits;

		if (totalBits <= 0) {
			console.log(numBits, byteOffset, bitOffset);
			throw RangeError("No bits requested");
		} else if (totalBits <= 8) {
			var shiftLeft = 24 + bitOffset;
			var rawBits = this.tiffDataView.getUint8(newByteOffset, this.littleEndian);
		} else if (totalBits <= 16) {
			var shiftLeft = 16 + bitOffset;
			var rawBits = this.tiffDataView.getUint16(newByteOffset, this.littleEndian);
		} else if (totalBits <= 32) {
			var shiftLeft = bitOffset;
			var rawBits = this.tiffDataView.getUint32(newByteOffset, this.littleEndian);
		} else {
			console.log(numBits, byteOffset, bitOffset);
			throw RangeError("Too many bits requested");
		}

		var chunkInfo = {
			'bits': rawBits << shiftLeft >>> shiftRight,
			'byteOffset': newByteOffset + Math.floor(totalBits / 8),
			'bitOffset': totalBits % 8
		};

		return chunkInfo;
	},

	getBytes: function getBytes(numBytes, offset) {
		if (numBytes <= 0) {
			console.log(numBytes, offset);
			throw RangeError("No bytes requested");
		} else if (numBytes <= 1) {
			return this.tiffDataView.getUint8(offset, this.littleEndian);
		} else if (numBytes <= 2) {
			return this.tiffDataView.getUint16(offset, this.littleEndian);
		} else if (numBytes <= 3) {
			return this.tiffDataView.getUint32(offset, this.littleEndian) >>> 8;
		} else if (numBytes <= 4) {
			return this.tiffDataView.getUint32(offset, this.littleEndian);
		} else {
			console.log(numBytes, offset);
			throw RangeError("Too many bytes requested");
		}
	},

	getFieldValues: function getFieldValues(fieldTagName, fieldTypeName, typeCount, valueOffset) {
		var fieldValues = [];

		var fieldTypeLength = this.getFieldTypeLength(fieldTypeName);
		var fieldValueSize = fieldTypeLength * typeCount;

		if (fieldValueSize <= 4) {
			// The value is stored at the big end of the valueOffset.
			if (this.littleEndian === false) {
				var value = valueOffset >>> (4 - fieldTypeLength) * 8;
			} else {
				var value = valueOffset;
			}

			fieldValues.push(value);
		} else {
			for (var i = 0; i < typeCount; i++) {
				var indexOffset = fieldTypeLength * i;

				if (fieldTypeLength >= 8) {
					if (['RATIONAL', 'SRATIONAL'].indexOf(fieldTypeName) !== -1) {
						// Numerator
						fieldValues.push(this.getBytes(4, valueOffset + indexOffset));
						// Denominator
						fieldValues.push(this.getBytes(4, valueOffset + indexOffset + 4));
						//					} else if (['DOUBLE'].indexOf(fieldTypeName) !== -1) {
						//						fieldValues.push(this.getBytes(4, valueOffset + indexOffset) + this.getBytes(4, valueOffset + indexOffset + 4));
					} else {
						console.log(fieldTypeName, typeCount, fieldValueSize);
						throw TypeError("Can't handle this field type or size");
					}
				} else {
					fieldValues.push(this.getBytes(fieldTypeLength, valueOffset + indexOffset));
				}
			}
		}

		if (fieldTypeName === 'ASCII') {
			fieldValues.forEach(function (e, i, a) {
				a[i] = String.fromCharCode(e);
			});
		}

		return fieldValues;
	},

	clampColorSample: function clampColorSample(colorSample, bitsPerSample) {
		var multiplier = Math.pow(2, 8 - bitsPerSample);

		return Math.floor(colorSample * multiplier + (multiplier - 1));
	},

	makeRGBAFillValue: function makeRGBAFillValue(r, g, b, a) {
		if (typeof a === 'undefined') {
			a = 1.0;
		}
		return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
	},

	parseFileDirectory: function parseFileDirectory(byteOffset) {
		var numDirEntries = this.getBytes(2, byteOffset);

		var tiffFields = [];

		for (var i = byteOffset + 2, entryCount = 0; entryCount < numDirEntries; i += 12, entryCount++) {
			var fieldTag = this.getBytes(2, i);
			var fieldType = this.getBytes(2, i + 2);
			var typeCount = this.getBytes(4, i + 4);
			var valueOffset = this.getBytes(4, i + 8);

			var fieldTagName = this.getFieldTagName(fieldTag);
			var fieldTypeName = this.getFieldTypeName(fieldType);

			var fieldValues = this.getFieldValues(fieldTagName, fieldTypeName, typeCount, valueOffset);

			tiffFields[fieldTagName] = { 'type': fieldTypeName, 'values': fieldValues };
		}

		this.fileDirectories.push(tiffFields);

		var nextIFDByteOffset = this.getBytes(4, i);

		if (nextIFDByteOffset === 0x00000000) {
			return this.fileDirectories;
		} else {
			return this.parseFileDirectory(nextIFDByteOffset);
		}
	},

	parseTIFF: function parseTIFF(tiffArrayBuffer, canvas) {
		canvas = canvas || document.createElement('canvas');

		this.tiffDataView = new DataView(tiffArrayBuffer);
		this.canvas = canvas;

		this.littleEndian = this.isLittleEndian(this.tiffDataView);

		if (!this.hasTowel(this.tiffDataView, this.littleEndian)) {
			return;
		}

		var firstIFDByteOffset = this.getBytes(4, 4);

		this.fileDirectories = this.parseFileDirectory(firstIFDByteOffset);

		var fileDirectory = this.fileDirectories[0];

		//console.log( fileDirectory );

		var imageWidth = fileDirectory.ImageWidth.values[0];
		var imageLength = fileDirectory.ImageLength.values[0];

		this.canvas.width = imageWidth;
		this.canvas.height = imageLength;

		var strips = [];

		var compression = fileDirectory.Compression ? fileDirectory.Compression.values[0] : 1;

		var samplesPerPixel = fileDirectory.SamplesPerPixel.values[0];

		var sampleProperties = [];

		var bitsPerPixel = 0;
		var hasBytesPerPixel = false;

		fileDirectory.BitsPerSample.values.forEach(function (bitsPerSample, i, bitsPerSampleValues) {
			sampleProperties[i] = {
				'bitsPerSample': bitsPerSample,
				'hasBytesPerSample': false,
				'bytesPerSample': undefined
			};

			if (bitsPerSample % 8 === 0) {
				sampleProperties[i].hasBytesPerSample = true;
				sampleProperties[i].bytesPerSample = bitsPerSample / 8;
			}

			bitsPerPixel += bitsPerSample;
		}, this);

		if (bitsPerPixel % 8 === 0) {
			hasBytesPerPixel = true;
			var bytesPerPixel = bitsPerPixel / 8;
		}

		var stripOffsetValues = fileDirectory.StripOffsets.values;
		var numStripOffsetValues = stripOffsetValues.length;

		// StripByteCounts is supposed to be required, but see if we can recover anyway.
		if (fileDirectory.StripByteCounts) {
			var stripByteCountValues = fileDirectory.StripByteCounts.values;
		} else {
			console.log("Missing StripByteCounts!");

			// Infer StripByteCounts, if possible.
			if (numStripOffsetValues === 1) {
				var stripByteCountValues = [Math.ceil(imageWidth * imageLength * bitsPerPixel / 8)];
			} else {
				throw Error("Cannot recover from missing StripByteCounts");
			}
		}

		// Loop through strips and decompress as necessary.
		for (var i = 0; i < numStripOffsetValues; i++) {
			var stripOffset = stripOffsetValues[i];
			strips[i] = [];

			var stripByteCount = stripByteCountValues[i];

			// Loop through pixels.
			for (var byteOffset = 0, bitOffset = 0, jIncrement = 1, getHeader = true, pixel = [], numBytes = 0, sample = 0, currentSample = 0; byteOffset < stripByteCount; byteOffset += jIncrement) {
				// Decompress strip.
				switch (compression) {
					// Uncompressed
					case 1:
						// Loop through samples (sub-pixels).
						for (var m = 0, pixel = []; m < samplesPerPixel; m++) {
							if (sampleProperties[m].hasBytesPerSample) {
								// XXX: This is wrong!
								var sampleOffset = sampleProperties[m].bytesPerSample * m;

								pixel.push(this.getBytes(sampleProperties[m].bytesPerSample, stripOffset + byteOffset + sampleOffset));
							} else {
								var sampleInfo = this.getBits(sampleProperties[m].bitsPerSample, stripOffset + byteOffset, bitOffset);

								pixel.push(sampleInfo.bits);

								byteOffset = sampleInfo.byteOffset - stripOffset;
								bitOffset = sampleInfo.bitOffset;

								throw RangeError("Cannot handle sub-byte bits per sample");
							}
						}

						strips[i].push(pixel);

						if (hasBytesPerPixel) {
							jIncrement = bytesPerPixel;
						} else {
							jIncrement = 0;

							throw RangeError("Cannot handle sub-byte bits per pixel");
						}
						break;

					// CITT Group 3 1-Dimensional Modified Huffman run-length encoding
					case 2:
						// XXX: Use PDF.js code?
						break;

					// Group 3 Fax
					case 3:
						// XXX: Use PDF.js code?
						break;

					// Group 4 Fax
					case 4:
						// XXX: Use PDF.js code?
						break;

					// LZW
					case 5:
						// XXX: Use PDF.js code?
						break;

					// Old-style JPEG (TIFF 6.0)
					case 6:
						// XXX: Use PDF.js code?
						break;

					// New-style JPEG (TIFF Specification Supplement 2)
					case 7:
						// XXX: Use PDF.js code?
						break;

					// PackBits
					case 32773:
						// Are we ready for a new block?
						if (getHeader) {
							getHeader = false;

							var blockLength = 1;
							var iterations = 1;

							// The header byte is signed.
							var header = this.tiffDataView.getInt8(stripOffset + byteOffset, this.littleEndian);

							if (header >= 0 && header <= 127) {
								// Normal pixels.
								blockLength = header + 1;
							} else if (header >= -127 && header <= -1) {
								// Collapsed pixels.
								iterations = -header + 1;
							} else /*if (header === -128)*/{
									// Placeholder byte?
									getHeader = true;
								}
						} else {
							var currentByte = this.getBytes(1, stripOffset + byteOffset);

							// Duplicate bytes, if necessary.
							for (var m = 0; m < iterations; m++) {
								if (sampleProperties[sample].hasBytesPerSample) {
									// We're reading one byte at a time, so we need to handle multi-byte samples.
									currentSample = currentSample << 8 * numBytes | currentByte;
									numBytes++;

									// Is our sample complete?
									if (numBytes === sampleProperties[sample].bytesPerSample) {
										pixel.push(currentSample);
										currentSample = numBytes = 0;
										sample++;
									}
								} else {
									throw RangeError("Cannot handle sub-byte bits per sample");
								}

								// Is our pixel complete?
								if (sample === samplesPerPixel) {
									strips[i].push(pixel);

									pixel = [];
									sample = 0;
								}
							}

							blockLength--;

							// Is our block complete?
							if (blockLength === 0) {
								getHeader = true;
							}
						}

						jIncrement = 1;
						break;

					// Unknown compression algorithm
					default:
						// Do not attempt to parse the image data.
						break;
				}
			}

			//			console.log( strips[i] );
		}

		//		console.log( strips );

		if (canvas.getContext) {
			var ctx = this.canvas.getContext("2d");

			// Set a default fill style.
			ctx.fillStyle = this.makeRGBAFillValue(255, 255, 255, 0);

			// If RowsPerStrip is missing, the whole image is in one strip.
			if (fileDirectory.RowsPerStrip) {
				var rowsPerStrip = fileDirectory.RowsPerStrip.values[0];
			} else {
				var rowsPerStrip = imageLength;
			}

			var numStrips = strips.length;

			var imageLengthModRowsPerStrip = imageLength % rowsPerStrip;
			var rowsInLastStrip = imageLengthModRowsPerStrip === 0 ? rowsPerStrip : imageLengthModRowsPerStrip;

			var numRowsInStrip = rowsPerStrip;
			var numRowsInPreviousStrip = 0;

			var photometricInterpretation = fileDirectory.PhotometricInterpretation.values[0];

			var extraSamplesValues = [];
			var numExtraSamples = 0;

			if (fileDirectory.ExtraSamples) {
				extraSamplesValues = fileDirectory.ExtraSamples.values;
				numExtraSamples = extraSamplesValues.length;
			}

			if (fileDirectory.ColorMap) {
				var colorMapValues = fileDirectory.ColorMap.values;
				var colorMapSampleSize = Math.pow(2, sampleProperties[0].bitsPerSample);
			}

			// Loop through the strips in the image.
			for (var i = 0; i < numStrips; i++) {
				// The last strip may be short.
				if (i + 1 === numStrips) {
					numRowsInStrip = rowsInLastStrip;
				}

				var numPixels = strips[i].length;
				var yPadding = numRowsInPreviousStrip * i;

				// Loop through the rows in the strip.
				for (var y = 0, j = 0; y < numRowsInStrip, j < numPixels; y++) {
					// Loop through the pixels in the row.
					for (var x = 0; x < imageWidth; x++, j++) {
						var pixelSamples = strips[i][j];

						var red = 0;
						var green = 0;
						var blue = 0;
						var opacity = 1.0;

						if (numExtraSamples > 0) {
							for (var k = 0; k < numExtraSamples; k++) {
								if (extraSamplesValues[k] === 1 || extraSamplesValues[k] === 2) {
									// Clamp opacity to the range [0,1].
									opacity = pixelSamples[3 + k] / 256;

									break;
								}
							}
						}

						switch (photometricInterpretation) {
							// Bilevel or Grayscale
							// WhiteIsZero
							case 0:
								if (sampleProperties[0].hasBytesPerSample) {
									var invertValue = Math.pow(0x10, sampleProperties[0].bytesPerSample * 2);
								}

								// Invert samples.
								pixelSamples.forEach(function (sample, index, samples) {
									samples[index] = invertValue - sample;
								});

							// Bilevel or Grayscale
							// BlackIsZero
							case 1:
								red = green = blue = this.clampColorSample(pixelSamples[0], sampleProperties[0].bitsPerSample);
								break;

							// RGB Full Color
							case 2:
								red = this.clampColorSample(pixelSamples[0], sampleProperties[0].bitsPerSample);
								green = this.clampColorSample(pixelSamples[1], sampleProperties[1].bitsPerSample);
								blue = this.clampColorSample(pixelSamples[2], sampleProperties[2].bitsPerSample);
								break;

							// RGB Color Palette
							case 3:
								if (colorMapValues === undefined) {
									throw Error("Palette image missing color map");
								}

								var colorMapIndex = pixelSamples[0];

								red = this.clampColorSample(colorMapValues[colorMapIndex], 16);
								green = this.clampColorSample(colorMapValues[colorMapSampleSize + colorMapIndex], 16);
								blue = this.clampColorSample(colorMapValues[2 * colorMapSampleSize + colorMapIndex], 16);
								break;

							// Transparency mask
							case 4:
								throw RangeError('Not Yet Implemented: Transparency mask');
								break;

							// CMYK
							case 5:
								throw RangeError('Not Yet Implemented: CMYK');
								break;

							// YCbCr
							case 6:
								throw RangeError('Not Yet Implemented: YCbCr');
								break;

							// CIELab
							case 8:
								throw RangeError('Not Yet Implemented: CIELab');
								break;

							// Unknown Photometric Interpretation
							default:
								throw RangeError('Unknown Photometric Interpretation:', photometricInterpretation);
								break;
						}

						ctx.fillStyle = this.makeRGBAFillValue(red, green, blue, opacity);
						ctx.fillRect(x, yPadding + y, 1, 1);
					}
				}

				numRowsInPreviousStrip = numRowsInStrip;
			}
		}

		/*		for (var i = 0, numFileDirectories = this.fileDirectories.length; i < numFileDirectories; i++) {
  			// Stuff
  		}*/

		return this.canvas;
	}
	// if (typeof module === "undefined") {
	//     this.TIFFParser = TIFFParser;
	// } else {
	//     module.exports = TIFFParser;
	// }
	// if (typeof define === "function") {
	//     define(function () { return TIFFParser; });
	// }
};exports.default = TIFFParser;

},{}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _csg = require('../ThirdParty/csg/csg.js');

var _csg2 = _interopRequireDefault(_csg);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
*@param {Cesium.Geometry}
*@param {Cesium.Cartesian3}[offset]
*@return {CSG}
*/
_csg2.default.toCSG = function (geometry, offset) {
    if (!offset) {
        offset = { x: 0, y: 0, z: 0 };
    }
    if (!geometry.attributes.normal) {
        geometry = Cesium.GeometryPipeline.computeNormal(geometry);
    }
    if (geometry.primitiveType !== Cesium.PrimitiveType.TRIANGLES) {
        throw new Error("暂不支持此类几何体");
    }

    var polygons = [],
        vertices = [];
    var positions = geometry.attributes.position.values;
    var normals = geometry.attributes.normal.values;
    var normalIdx = 0,
        positionIdx = 0;

    for (var i = 0; i < geometry.indices.length; i += 3) {
        vertices = [];

        var idx1 = geometry.indices[i];
        var idx2 = geometry.indices[i + 1];
        var idx3 = geometry.indices[i + 2];

        positionIdx = idx1 * 3;
        normalIdx = idx1 * 3;

        vertices.push(new _csg2.default.Vertex([positions[positionIdx++] + offset.x, positions[positionIdx++] + offset.y, positions[positionIdx++] + offset.z], [normals[normalIdx++], normals[normalIdx++], normals[normalIdx++]]));

        positionIdx = idx2 * 3;
        normalIdx = idx2 * 3;
        vertices.push(new _csg2.default.Vertex([positions[positionIdx++] + offset.x, positions[positionIdx++] + offset.y, positions[positionIdx++] + offset.z], [normals[normalIdx++], normals[normalIdx++], normals[normalIdx++]]));

        positionIdx = idx3 * 3;
        normalIdx = idx3 * 3;
        vertices.push(new _csg2.default.Vertex([positions[positionIdx++] + offset.x, positions[positionIdx++] + offset.y, positions[positionIdx++] + offset.z], [normals[normalIdx++], normals[normalIdx++], normals[normalIdx++]]));
        polygons.push(new _csg2.default.Polygon(vertices));
    }
    return _csg2.default.fromPolygons(polygons);
};
/**
*@param {CSG}csg_model
*@return {Cesium.Geometry}
*/
_csg2.default.fromCSG = function (csg_model) {
    var i,
        j,
        vertices,
        polygons = csg_model.toPolygons();

    if (!_csg2.default) {
        throw new Error('CSG 库未加载。请从 https://github.com/evanw/csg.js 获取');
    }

    var positions = [];
    var normals = [];
    var indices = [];

    for (i = 0; i < polygons.length; i++) {

        // Vertices
        vertices = [];
        for (j = 0; j < polygons[i].vertices.length; j++) {
            vertices.push(this.getGeometryVertice(positions, normals, polygons[i].vertices[j].pos, polygons[i].plane.normal));
        }
        if (vertices[0] === vertices[vertices.length - 1]) {
            vertices.pop();
        }

        for (var j = 2; j < vertices.length; j++) {
            indices.push(vertices[0], vertices[j - 1], vertices[j]);
        }
    }

    positions = new Float32Array(positions);
    normals = new Float32Array(normals);

    indices = new Int32Array(indices);
    var attributes = {};
    attributes.position = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: positions
    });
    attributes.normal = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: normals
    });

    var cesGeometry = new Cesium.Geometry({
        attributes: attributes,
        indices: indices,
        primitiveType: Cesium.PrimitiveType.TRIANGLES
    });

    return cesGeometry;
};
/**
*@param {Array<Number>}positions
*@param {Array<Number>}normals
*@param {Cesium.CSG.Vector}vertice_position
*@param {Cesium.CSG.Vector}plane_normal
*@return {Number}
*@private
*/
_csg2.default.getGeometryVertice = function (positions, normals, vertice_position, plane_normal) {
    var i,
        idx = 0;
    for (i = 0; i < positions.length; i += 3) {
        if (positions[i] === vertice_position.x && positions[i + 1] === vertice_position.y && positions[i + 2] === vertice_position.z) {
            // Vertice already exists
            return idx;
        }
        idx++;
    };

    positions.push(vertice_position.x, vertice_position.y, vertice_position.z);
    normals.push(plane_normal.x, plane_normal.y, plane_normal.z);
    return idx;
};

exports.default = _csg2.default;

},{"../ThirdParty/csg/csg.js":32}],35:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
*@class
*@memberof Cesium
*/
function Path() {}
/**
*
*获取文件扩展名（后缀）
*@param {String}fname 文件名
*/
Path.GetExtension = function (fname) {
    var start = fname.lastIndexOf(".");
    if (start >= 0) {
        return fname.substring(start, fname.length);
    }
    return "";
};

/**
*
*获取文件扩展名（后缀）
*@param {String}fname 文件名
*/
Path.GetFileName = function (fname) {
    var start = fname.lastIndexOf("/");
    if (start < 0) {
        return fname;
    }
    return fname.substring(start + 1, fname.length);
};
/**
*
*获取文件夹
*@param {String}fname 文件名
*/
Path.GetDirectoryName = function (fname) {
    var start = fname.lastIndexOf("/");
    if (start < 0) {
        return "";
    }
    return fname.substring(0, start);
};
/**
*
*获取文件夹
*@param {String}fname 文件名
*/
Path.Combine = function (dir, fname) {
    return dir + fname;
};
Path.ChangeExtension = function (fname, newExt) {
    return fname.replace(Path.GetExtension(fname), newExt);
};

exports.default = Path;

},{}],36:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
*定义属性，并监听属性变化事件,属性值的数据类型可以实现equals接口用于进行更进一步的比较
*@param {Object}owner
*@param {String}name
*@param {Any}defaultVal
*@param {(
        changed: string, owner: object, newVal: *, oldVal: *
        ) => void}onChanged
*@memberof Cesium
*/
function defineProperty(owner, name, defaultVal, onChanged) {
    owner["_" + name] = defaultVal;
    var value = {
        get: function get() {
            return this["_" + name];
        },
        set: function set(val) {
            var changed = val != this["_" + name];
            if (this["_" + name] && this["_" + name].equals && val) {
                changed = this["_" + name].equals(val);
            }
            var oldVal = this["_" + name];
            this["_" + name] = val;
            if (typeof onChanged == 'function' && changed) {
                onChanged(changed, owner, val, oldVal);
            }
        }
    };
    var properties = {};
    properties[name] = value;
    Object.defineProperties(owner, properties);
}

exports.default = defineProperty;

},{}]},{},[31])(31)
});
//# sourceMappingURL=CesiumMeshVisualizer.js.map
