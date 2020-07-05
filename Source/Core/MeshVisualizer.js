
import RendererUtils from './RendererUtils.js';
import MeshMaterial from './MeshMaterial.js';
import ShaderChunk from './Shaders/ShaderChunk.js';
import Rotation from './Rotation.js';
import FramebufferTexture from './FramebufferTexture.js';
import LOD from './LOD.js';
import ReferenceMesh from './ReferenceMesh.js';
import TIFFParser from '../ThirdParty/tiff-js/tiff.js';
import Path from '../Util/Path.js';
import MaterialUtils from './MaterialUtils.js';
import MeshUtils from './MeshUtils.js';
import ShaderUtils from './ShaderUtils.js';

var Matrix4;//= Cesium.Matrix4;
var DrawCommand;//= Cesium.DrawCommand;
var defined;//= Cesium.defined;
var GeometryPipeline;//= Cesium.GeometryPipeline;
var BufferUsage;//= Cesium.BufferUsage;
var BlendingState;//= Cesium.BlendingState;
var VertexArray;//= Cesium.VertexArray;
var ShaderProgram;//= Cesium.ShaderProgram;
var DepthFunction;//= Cesium.DepthFunction;
var CullFace;//= Cesium.CullFace;
var RenderState;//= Cesium.RenderState;
var defaultValue;//= Cesium.defaultValue;
var Texture;//= Cesium.Texture;
var PixelFormat;//= Cesium.PixelFormat; 
var Cartesian3;//= Cesium.Cartesian3;
var Cartesian2;//= Cesium.Cartesian2;
var Cartesian4;//= Cesium.Cartesian4; 
var CesiumMath;//= Cesium.Math;
var Color;//= Cesium.Color;
var Buffer;//= Cesium.Buffer;
var ComponentDatatype;//= Cesium.ComponentDatatype;
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
        this.x = x; this.y = y; this.z = z;
    }
    Cesium.Cartesian3.prototype.copy = function (src) {
        this.x = src.x; this.y = src.y; this.z = src.z;
    }

    Cesium.Cartesian2.prototype.set = function (x, y) {
        this.x = x; this.y = y;
    }
    Cesium.Cartesian2.prototype.copy = function (src) {
        this.x = src.x; this.y = src.y;
    }
    Cesium.Quaternion.prototype.set = function (x, y, z, w) {
        this.x = x; this.y = y; this.z = z; this.w = w;
    }
    Cesium.Quaternion.prototype.copy = function (src) {
        this.x = src.x; this.y = src.y; this.z = src.z; this.w = src.w;
    }

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
    var instancesLength = instances.length

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
    var isColorValue = instancedAttribute.default instanceof Color
    if (typeof instancedAttribute.default == 'number') {
        componentsPerAttribute = 1;
    }
    else if (instancedAttribute.default instanceof Cartesian2) {
        componentsPerAttribute = 2;
    }
    else if (instancedAttribute.default instanceof Cartesian3) {
        componentsPerAttribute = 3;
    }
    else if (instancedAttribute.default instanceof Cartesian4) {
        componentsPerAttribute = 4;
    } else if (isColorValue) {
        componentsPerAttribute = 4;
    }

    var bufferData = collection['_' + name + 'BufferTypedArray'];
    if (!bufferData || instancesLength * componentsPerAttribute > bufferData.length) {
        if (isColorValue) {
            bufferData = new Uint8Array(instancesLength * componentsPerAttribute);
        }
        else {
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
    }
    else if (instancedAttribute.default instanceof Cartesian2) {

        for (i = 0; i < instancesLength; ++i) {
            var instance = instances[i];
            var val = instance[name];
            var offset = i * componentsPerAttribute;
            bufferData[offset] = val.x;
            bufferData[offset + 1] = val.y;
        }
    }
    else if (instancedAttribute.default instanceof Cartesian3) {

        for (i = 0; i < instancesLength; ++i) {
            var instance = instances[i];
            var val = instance[name];
            var offset = i * componentsPerAttribute;
            bufferData[offset] = val.x;
            bufferData[offset + 1] = val.y;
            bufferData[offset + 2] = val.z;
        }
    }
    else if (instancedAttribute.default instanceof Cartesian4) {
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

        var name = instancedAttribute.name
        attributeLocations[name] = ++maxAttribLocation

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
        }
        if (typeof instancedAttribute.default == 'number') {
            attribute.componentsPerAttribute = 1;
        }
        else if (instancedAttribute.default instanceof Cartesian2) {
            attribute.componentsPerAttribute = 2;
        }
        else if (instancedAttribute.default instanceof Cartesian3) {
            attribute.componentsPerAttribute = 3;
        }
        else if (instancedAttribute.default instanceof Cartesian4) {
            attribute.componentsPerAttribute = 4;
        } else if (instancedAttribute.default instanceof Color) {
            attribute.componentDatatype = ComponentDatatype.UNSIGNED_BYTE;
            attribute.normalize = true;
            attribute.componentsPerAttribute = 4;
        }

        vertexArrayAttributes.push(attribute);

    })

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
    })
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
    this._rotation = new Rotation(this._rotation.axis, this._rotation.angle);
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
    this.referenceMesh = new ReferenceMesh({
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
     * 移除mesh，释放由MeshVisualizer创建的内部资源
    *@param {Cesium.Mesh}mesh
    */
    remove: function (mesh) {

        for (var i = 0; i < this._chidren.length; i++) {
            if (this._chidren[i] == mesh) {

                this._chidren.splice(i, 1);
            }
        }

        function freeDrawCommand(cmd) {
            if (!cmd) return;
            cmd.vertexArray = cmd.vertexArray.destroy();
            cmd.shaderProgram = cmd.shaderProgram.destroy();
            Cesium.destroyObject(cmd);
        }

        function freeMesh(mesh) {
            mesh._drawCommand = freeDrawCommand(mesh._drawCommand);
            mesh._pickCommand = freeDrawCommand(mesh._pickCommand);
            mesh._textureCommand = freeDrawCommand(mesh._textureCommand);
        }

        MeshVisualizer.traverse(mesh, function () {
            freeMesh(mesh);

            if (mesh._actualMesh && mesh._actualMesh._drawCommand) {

                var actualMesh = mesh._actualMesh;
                freeMesh(actualMesh);
                Cesium.destroyObject(actualMesh.geometry);
                mesh._actualMesh = actualMesh && actualMesh.destroy();
                Cesium.destroyObject(actualMesh);
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
    pickPosition: function (windowPosition, result) {
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
    getPickRay: function (windowPosition, result) {
        if (!this._scene) {
            return undefined;
        }
        if (!result) {
            result = Cesium.Ray();
        }
        this._scene.camera.getPickRay(windowPosition, scratchRay);//ray用于计算小球发射点位置，这里射线的起始点是世界坐标，不能像Threejs那样直接拿来计算，需要转成局部坐标
        this._scene.pickPosition(windowPosition, surfacePointLocal);//射线和局部场景的交点

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
    worldCoordinatesToLocal: function (worldCoordinates, result) {
        if (!result) {
            result = new Cartesian3();
        }
        Cesium.Matrix4.inverseTransformation(this._actualModelMatrix, world2localMatrix)
        Cesium.Matrix4.multiplyByPoint(world2localMatrix, worldCoordinates, result);
        return result;
    },
    /**
   *局部坐标到世界坐标
   *@param {Cesium.Cartesian3}localCoordinates
   *@param {Cesium.Cartesian3}[result]
   *@return {Cesium.Cartesian3}
   */
    localToWorldCoordinates: function (localCoordinates, result) {
        if (!result) {
            result = new Cartesian3();
        }
        Cesium.Matrix4.multiplyByPoint(this._actualModelMatrix, localCoordinates, result);
        return result;
    },
    onModelMatrixNeedUpdate: function () {
        this._modelMatrixNeedsUpdate = true;
    },
    /**
     *
     *@param {Number}x
     *@param {Number}y
     *@param {Number}z
     */
    setPosition: function (x, y, z) {
        var changed = false;
        if (arguments.length == 1) {
            if (typeof x == 'number') {
                if (x != this._position.x) changed = true;
                this._position.x = x;
            } else if (x instanceof Cesium.Cartesian3) {
                if (x != this._position.x
                    || y != this._position.y
                    || z != this._position.z) {
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
    setScale: function (x, y, z) {
        var changed = false;
        if (arguments.length == 1) {
            if (typeof x == 'number') {
                if (x != this._scale.x) changed = true;
                this._scale.x = x;
            } else if (x instanceof Cesium.Cartesian3) {
                if (x != this._scale.x
                    || y != this._scale.y
                    || z != this._scale.z) {
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

    toWireframe: function (geometry) {
        if (geometry.primitiveType !== Cesium.PrimitiveType.TRIANGLES
            && geometry.primitiveType !== Cesium.PrimitiveType.TRIANGLE_FAN
            && geometry.primitiveType !== Cesium.PrimitiveType.TRIANGLE_STRIP) {
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

    restoreFromWireframe: function (geometry) {
        if (geometry.primitiveType == Cesium.PrimitiveType.POINTS) {
            return geometry;
        }
        if (geometry.triangleIndices) {
            geometry.indices = geometry.triangleIndices;
        }
        geometry.primitiveType = Cesium.PrimitiveType.TRIANGLES;
        return geometry;
    },
    createBoundingSphere: function (mesh) {
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
    createDrawCommand: function (mesh, frameState) {
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
            cull: false,// material.cullFrustum,
            instanceCount: mesh._instances && mesh._instances.length > 0 ? mesh._availableInstances.length : undefined,
            pass: material.translucent ? Cesium.Pass.TRANSLUCENT : Cesium.Pass.OPAQUE
            // , boundingVolume: geometry.boundingSphere
        });

        var attributeLocations = GeometryPipeline.createAttributeLocations(geometry);
        var vertexArrayAttributes;
        if (mesh._instances && mesh._instances.length) {
            this.createBoundingSphere(mesh);

            vertexArrayAttributes = []
            var maxAttribLocation = 0;
            for (var location in attributeLocations) {
                if (attributeLocations.hasOwnProperty(location)) {
                    maxAttribLocation = Math.max(maxAttribLocation, attributeLocations[location])
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
                    vertexArrayAttributes.push(instancedAttributes[location])
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
            })
        }
        command.vertexArray._attributeLocations = attributeLocations;

        var pickColor = pickId.color;

        var shader = {
            fragmentShader: this.getFragmentShaderSource(material),
            vertexShader: this.getVertexShaderSource(mesh, material)
        };
        if (material.material3js) {
            shader = ShaderUtils.processShader3js(material.material3js, shader);
        }

        if (mesh._instances && mesh._instances.length) {

            var vs = shader.vertexShader;
            var renamedSource = Cesium.ShaderSource.replaceMain(vs, 'czm_instancing_main');

            var pickAttribute = 'attribute vec4 a_pickColor;\n' +
                'varying vec4 czm_pickColor;\n';
            var pickVarying = '    czm_pickColor = a_pickColor;\n';

            vs = //'mat4 czm_instanced_modelView;\n' +
                'attribute vec4 czm_modelMatrixRow0;\n' +
                'attribute vec4 czm_modelMatrixRow1;\n' +
                'attribute vec4 czm_modelMatrixRow2;\n' +
                'uniform mat4 czm_instanced_modifiedModelView;\n' +
                // batchIdAttribute +
                pickAttribute +
                renamedSource +
                'void main()\n' +
                '{\n' +
                '    modelMatrix = mat4(czm_modelMatrixRow0.x, czm_modelMatrixRow1.x, czm_modelMatrixRow2.x, 0.0, czm_modelMatrixRow0.y, czm_modelMatrixRow1.y, czm_modelMatrixRow2.y, 0.0, czm_modelMatrixRow0.z, czm_modelMatrixRow1.z, czm_modelMatrixRow2.z, 0.0, czm_modelMatrixRow0.w, czm_modelMatrixRow1.w, czm_modelMatrixRow2.w, 1.0);\n' +
                '    modelViewMatrix = czm_instanced_modifiedModelView * modelMatrix;\n' +
                '    u_modelMatrix =modelMatrix;\n' +
                '    u_modelViewMatrix = modelViewMatrix ;\n' +
                // globalVarsMain +
                '    czm_instancing_main();\n' +
                pickVarying +
                '}\n';
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
        var logDepthExtension =
            '#ifdef GL_EXT_frag_depth \n' +
            '#extension GL_EXT_frag_depth : enable \n' +
            '#endif \n\n';

        // if (this._useLogDepth) {
        vs.defines.push('LOG_DEPTH');
        fs.defines.push('LOG_DEPTH');
        //fs.sources.push(logDepthExtension);
        // }


        command._sp = ShaderProgram.fromCache({
            context: context,
            fragmentShaderSource: fs,//shader.fragmentShader,//this.getFragmentShaderSource(material),
            vertexShaderSource: vs,//shader.vertexShader,//this.getVertexShaderSource(geometry, material),
            attributeLocations: attributeLocations
        });
        if (!Cesium.defined(mesh.material.allowPick)) {
            mesh.material.allowPick = true;
        }
        if (mesh.material.allowPick) {


        }
        command.shaderProgram = command._sp;
        command.renderState = this.getRenderState(material);

        command._renderStateOptions = material._renderStateOptions;

        command.uniformMap = this.getUniformMap(material, frameState);
        command.uniformMap.czm_pickColor = function () {
            return pickId.color;
        }
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
            pickColorQualifier: mesh._instances && mesh._instances.length ? 'varying' : (material.pickColorQualifier || 'uniform')
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

    getModifiedModelViewCallback: function (context, mesh) {
        return function () {
            if (!mesh._rtcTransform) {
                mesh._rtcTransform = new Matrix4()
            }
            if (!mesh._rtcModelView) {
                mesh._rtcModelView = new Matrix4()
            }
            Matrix4.multiplyByTranslation(mesh.modelMatrix, mesh._center, mesh._rtcTransform);

            return Matrix4.multiply(context.uniformState.view, mesh._rtcTransform, mesh._rtcModelView);
        }
    },
    /**
    *
    *
    *@param {THREE.Material}material 
    *@return {Cesium.RenderState}frameState
    *@private
    */
    getRenderState_old: function (material) {
        var renderState = {
            blending: material.blending ? BlendingState.ALPHA_BLEND : BlendingState.DISABLED,
            depthTest: {
                enabled: material.depthTest,
                func: DepthFunction.GREATER//LESS
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
        }
        renderState.cull.enabled = true;
        renderState.blending.color = {
            red: 0.0,
            green: 0.0,
            blue: 0.0,
            alpha: 0.0
        };
        switch (material.side) {
            case MeshMaterial.Sides.FRONT:
                renderState.cull.face = CullFace.BACK;
                break;
            case MeshMaterial.Sides.BACK:
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
    getRenderState: function (material) {
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
        }
        renderStateOpts.cull.enabled = true;

        // renderStateOpts.blending.color = {
        //     red: 0.0,
        //     green: 0.0,
        //     blue: 0.0,
        //     alpha: 0.0
        // };
        switch (material.side) {
            case MeshMaterial.Sides.FRONT:
                renderStateOpts.cull.face = CullFace.BACK;
                break;
            case MeshMaterial.Sides.BACK:
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
    getUniformMap: function (material, frameState) {
        var uniformMaps = this._uniformMaps;
        if (uniformMaps[material.uuid] && !material.needsUpdate) {
            return uniformMaps[material.uuid];

        }
        var uniformMap = {};
        uniformMaps[material.uuid] = uniformMap;

        if (material.onDispose) {
            material.onDispose(function () {
                delete uniformMaps[material.uuid];
            })
        }
        
        material.needsUpdate = false;

        uniformMap.cameraPosition = function () {
            return frameState.camera.position;
        }
        uniformMap.u_cameraPosition = function () {
            return frameState.camera.position;
        }
        //base matrix
        uniformMap.u_normalMatrix = function () {
            return frameState.context.uniformState.normal;
        }
        uniformMap.u_projectionMatrix = function () {
            return frameState.context.uniformState.projection;
        }

        uniformMap.u_modelViewMatrix = function () {
            return frameState.context.uniformState.modelView;
        }
        //base matrix for threejs
        uniformMap.normalMatrix = function () {
            return frameState.context.uniformState.normal;
        }
        uniformMap.projectionMatrix = function () {
            return frameState.context.uniformState.projection;
        }

        uniformMap.modelViewMatrix = function () {
            return frameState.context.uniformState.modelView;
        }
        uniformMap.modelMatrix = function () {
            return frameState.context.uniformState.model;
        }
        uniformMap.u_modelMatrix = function () {
            return frameState.context.uniformState.model;
        }
        uniformMap.u_viewMatrix = function () {
            return frameState.context.uniformState.view;
        }
        uniformMap.viewMatrix = function () {
            return frameState.context.uniformState.view;
        }
        uniformMap.logDepthBufFC = function () {
            return 2.0 / (Math.log(frameState.camera.frustum.far + 1.0) / Math.LN2)
        }

        if (material.uniformStateUsed && material.uniformStateUsed.length) {
            material.uniformStateUsed.forEach(function (item) {
                if (!uniformMap[item.glslVarName]) {
                    if (!frameState.context.uniformState[item.uniformStateName]) {
                        throw new Error(item.uniformStateName + "不是Cesium引擎的内置对象");
                    }
                    uniformMap[item.glslVarName] = function () {
                        return frameState.context.uniformState[item.uniformStateName];
                    }
                }
            });
        }
        var that = this;

        function getCubeTextureCallback(name, item, mtl) {
            var callback = function () {
                if (!that._textureCache[item.uuid] || item.needsUpdate) {
                    if (!callback.allLoaded && !callback.isLoading) {
                        var promises = [];
                        for (var i = 0; i < item.value.length; i++) {
                            if (item.value[i] instanceof HTMLCanvasElement
                                || item.value[i] instanceof HTMLVideoElement
                                || item.value[i] instanceof HTMLImageElement
                            ) {
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
                                })
                            }
                            callback.allLoaded = true;
                            callback.isLoading = false;
                        });
                    }
                }
                if (callback.allLoaded) {
                    return that._textureCache[item.uuid];
                }
                else {
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
            }
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

            var mipmap =
                (sampler.minificationFilter === TextureMinificationFilter.NEAREST_MIPMAP_NEAREST) ||
                (sampler.minificationFilter === TextureMinificationFilter.NEAREST_MIPMAP_LINEAR) ||
                (sampler.minificationFilter === TextureMinificationFilter.LINEAR_MIPMAP_NEAREST) ||
                (sampler.minificationFilter === TextureMinificationFilter.LINEAR_MIPMAP_LINEAR);
            var requiresNpot = mipmap ||
                (sampler.wrapS === TextureWrap.REPEAT) ||
                (sampler.wrapS === TextureWrap.MIRRORED_REPEAT) ||
                (sampler.wrapT === TextureWrap.REPEAT) ||
                (sampler.wrapT === TextureWrap.MIRRORED_REPEAT);

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
                if (image instanceof HTMLCanvasElement
                    || image instanceof HTMLVideoElement
                    || (image.src && image.src.toLocaleLowerCase().indexOf(".png") >= 0)
                ) {
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

            var callback = function () {

                var cacheKey = typeof item.value == 'string' ? item.value : null;
                if (!cacheKey) {
                    if (item.value instanceof HTMLImageElement
                        || item.value instanceof HTMLCanvasElement
                        || item.value instanceof HTMLVideoElement
                    ) {
                        if (!item.value.uuid) {
                            item.value.uuid = item.uuid;
                        }
                        cacheKey = item.value.uuid;
                    }
                }

                if (!that._textureCache[cacheKey] || item.needsUpdate) {

                    if (item.value instanceof HTMLImageElement
                        || item.value instanceof HTMLCanvasElement
                        || item.value instanceof HTMLVideoElement
                    ) {
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
                            })
                        }
                        item.needsUpdate = false;
                        return that._textureCache[cacheKey];

                    } else {
                        if (typeof item.value === "string" && !callback.isLoading) {
                            callback.isLoading = true;
                            item.needsUpdate = false;
                            var url = item.value.toLocaleLowerCase();

                            var extension = Path.GetExtension(url).slice(1);
                            if (extension == 'tif') {//处理tif纹理

                                loadArrayBuffer(url).then(function (imageArrayBuffer) {
                                    var tiffParser = new TIFFParser();
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
                                        })
                                    }
                                    callback.isLoading = false;

                                }).otherwise(function (err) {
                                    console.log(err);
                                })

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
                                        })
                                    }
                                    callback.isLoading = false;
                                }).otherwise(function (err) {
                                    console.log(err);
                                })
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

            }

            return callback;
        }

        if (material.uniforms) {

            function setUniformCallbackFunc(name, item) {

                if (item !== undefined && item !== null) {//item may be 0
                    var isImageUrl = typeof item.value === "string";
                    var isCssColorString = typeof item.value === "string";
                    if (typeof item.value === "string") {
                        var itemLowerCase = item.value.toLocaleLowerCase();
                        if (itemLowerCase.endsWith(".png")
                            || itemLowerCase.endsWith(".jpg")
                            || itemLowerCase.endsWith(".bmp")
                            || itemLowerCase.endsWith(".gif")
                            || itemLowerCase.endsWith(".tif")
                            || itemLowerCase.endsWith(".tiff")
                            || itemLowerCase.startsWith("data:")
                        ) {
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

                    if (item.value instanceof Cesium.Cartesian2
                        || item.value instanceof Cesium.Cartesian3
                        || item.value instanceof Cesium.Cartesian4
                        || item.value instanceof Cesium.Color
                        || item.value instanceof Cesium.Matrix4
                        || item.value instanceof Cesium.Matrix3
                        || item.value instanceof Cesium.Matrix2
                        || item.value instanceof Cesium.Texture
                        || typeof item.value === "number"
                        || typeof item.value === "boolean"
                        || isCssColorString
                        || item.isColor
                        || item.isCartesian2
                        || item.isCartesian3
                        || item.isCartesian4
                        || item.value instanceof Cesium.Texture
                        || (item.value instanceof Array && (typeof item.value[0] === 'number'
                            || item.value[0] instanceof Cesium.Cartesian2
                            || item.value[0] instanceof Cesium.Cartesian3
                            || item.value[0] instanceof Cesium.Cartesian4))
                    ) {
                        if (!that._uniformValueCache) {
                            that._uniformValueCache = {};
                        }
                        that._uniformValueCache[item.uuid] = item;
                        if (isCssColorString) {
                            item.value = Cesium.Color.fromCssColorString(item.value);
                        }
                        uniformMap[name] = function () {
                            return that._uniformValueCache[item.uuid].value;
                        }
                        if (item.onDispose) {
                            item.onDispose(function () {
                                if (that._uniformValueCache[item.uuid]) {
                                    delete that._uniformValueCache[item.uuid];
                                }
                            })
                        }
                    } else if (item.value instanceof Array && item.value.length == 6) {
                        uniformMap[name] = getCubeTextureCallback(name, item);
                    } else if (isImageUrl
                        || item.value instanceof HTMLImageElement
                        || item.value instanceof HTMLCanvasElement
                        || item.value instanceof HTMLVideoElement
                    ) {
                        uniformMap[name] = getTextureCallback(item, material);
                    } else if (item.value instanceof FramebufferTexture) {
                        if (!that._renderToTextureCommands) {
                            that._renderToTextureCommands = [];
                        }
                        if (!that._framebufferTextures[item.uuid]) {
                            that._framebufferTextures[item.uuid] = item;
                        }
                        uniformMap[name] = function () {
                            if (!that._framebufferTextures[item.uuid]
                                || !that._framebufferTextures[item.uuid].value.texture) {
                                return frameState.context.defaultTexture;
                            }
                            return that._framebufferTextures[item.uuid].value.texture;
                        }
                    }
                }
            }

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
    getVertexShaderSource: function (mesh, material) {
        var geometry = mesh.geometry;
        function getAttributeDefineBlok(userDefine) {
            var glsl = "";

            var attrs = geometry.attributes;
            for (var name in attrs) {

                if (attrs.hasOwnProperty(name)) {
                    var attr = attrs[name]
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

        var innerUniforms = [

            mesh._instances && mesh._instances.length > 0 ? 'mat4 modelViewMatrix' : "uniform mat4 modelViewMatrix",
            mesh._instances && mesh._instances.length > 0 ? 'mat4 modelMatrix' : "uniform mat4 modelMatrix",
            "uniform mat4 projectionMatrix",
            "uniform mat3 normalMatrix",
            mesh._instances && mesh._instances.length > 0 ? 'mat4 u_modelViewMatrix' : "uniform mat4 u_modelViewMatrix",
            mesh._instances && mesh._instances.length > 0 ? 'mat4 u_modelMatrix' : "uniform mat4 u_modelMatrix",
            "uniform mat4 u_projectionMatrix",
            "uniform mat3 u_normalMatrix",
            "uniform mat4 u_viewMatrix",
            "uniform mat4 viewMatrix",
            "uniform vec3 cameraPosition",
            "uniform vec3 u_cameraPosition"
        ];
        if (material.vertexShader) {
            uniforms = "";
            innerUniforms.forEach(function (item) {
                if (material.vertexShader.indexOf(item) < 0) {
                    uniforms += item + ";\n";
                }
            });
            var vs = getAttributeDefineBlok(material.vertexShader) + uniforms +
                material.vertexShader;

            vs = ShaderChunk.parseIncludes(vs);

            return vs;
        }
        else {
            throw new Error("material.vertexShader 是必须参数");
        }
    },
    /**
     * 
     *@param {Cesium.Material} material
     *@return {String} 
     *@private
     */
    getFragmentShaderSource: function (material) {

        if (material.fragmentShader) {
            var fs = ShaderChunk.parseIncludes(material.fragmentShader);
            return fs;
        } else {
            throw new Error("material.fragmentShader 是必须参数");
        }
    }
}

MeshVisualizer.prototype._computeModelMatrix = function (mesh, frameState) {
    if (mesh._actualMesh) {
        mesh = mesh._actualMesh;
    }
    var that = this;
    if (mesh instanceof LOD || mesh instanceof ReferenceMesh || typeof mesh.update === 'function') {
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
        if (mesh.parent instanceof LOD) {
            Matrix4.clone(mesh.parent.modelMatrix, mesh.modelMatrix);

        } else if (mesh._modelMatrixNeedsUpdate) {
            var rotation = mesh.quaternion ? mesh.quaternion : mesh.rotation;

            if (mesh.parent && mesh.parent.modelMatrix) {

                var actualModelMatrix = mesh.parent.modelMatrix ? mesh.parent.modelMatrix : mesh._drawCommand.modelMatrix;
                RendererUtils.computeModelMatrix(
                    actualModelMatrix,
                    mesh.position,
                    rotation,
                    mesh.scale,
                    mesh.modelMatrix
                );

            } else {
                RendererUtils.computeModelMatrix(
                    that._actualModelMatrix,
                    mesh.position,
                    rotation,
                    mesh.scale,
                    mesh.modelMatrix
                );
            }

            mesh._modelMatrixNeedsUpdate = false;
        }
    }
}
/**
*
*@param {Cesium.FrameState}frameState
*/
MeshVisualizer.prototype.update = function (frameState) {
    if (!this._scene) {
        this._scene = frameState.camera._scene;
    }
    if (!this._ready || !this.show && this._chidren.length > 0) {//如果未准备好则不加入渲染队列
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
        this._actualModelMatrix = RendererUtils.computeModelMatrix(
            this._modelMatrix,
            this._position,
            this._rotation,
            this._scale,
            this._actualModelMatrix
        );
        if (this._up && this._up.y) {
            this._actualModelMatrix = RendererUtils.yUp2Zup(this._actualModelMatrix, this._actualModelMatrix);
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
                var intersect = frameState.cullingVolume.computeVisibility(instance.boundingSphere)
                if (intersect != Cesium.Intersect.OUTSIDE) {
                    mesh._availableInstances.push(instance)
                }
            });
            if (mesh._availableInstances.length == 0) return;
        }

        if (MeshUtils.isMesh3js(mesh)) {
            var needsUpdate = !mesh._actualMesh
                || mesh.needsUpdate
                || mesh.geometry.needsUpdate;

            if (needsUpdate) {
                mesh._actualMesh = MeshUtils.fromMesh3js(mesh);
                mesh.modelMatrixNeedsUpdate = true;
            }
            else {
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
            MaterialUtils.updateMaterialFrom3js(mesh.material);
        }

        that._computeModelMatrix(mesh, frameState);

        if (typeof mesh.update !== 'function') {
            if (frameState.passes.pick && !mesh.material.allowPick) {
                return;
            }

            if (!mesh._drawCommand
                || mesh.needsUpdate
                || mesh.geometry.needsUpdate
                || wireframeChanged
            ) {//重新构建绘图命令，比如geometry完全不同于之前一帧 或者顶点和索引数量都发生改变等时，执行这段

                if (sysWireframe || mesh.material.wireframe) {
                    that.toWireframe(mesh.geometry);
                } else {
                    that.restoreFromWireframe(mesh.geometry);
                }

                if (mesh._drawCommand) mesh._drawCommand.destroy();
                mesh._drawCommand = that.createDrawCommand(mesh, frameState);

                mesh.needsUpdate = false;
                mesh.geometry.needsUpdate = false;
            } else {//在不需要重新构建绘图命令时，检查各个属性和索引是否需要更新，需要则将更新相应的缓冲区

                //更新属性缓冲区
                for (var name in mesh.geometry.attributes) {
                    if (mesh.geometry.attributes.hasOwnProperty(name)) {
                        if (mesh.geometry.attributes[name] && mesh.geometry.attributes[name].needsUpdate) {
                            var attrLocation = mesh._drawCommand.vertexArray._attributeLocations[name]
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
            }
            else {
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

}

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
    if (item instanceof FramebufferTexture) {

        item.drawCommands = [];
        MeshVisualizer.traverse(item.mesh, function (mesh) {
            if (MeshUtils.isMesh3js(mesh)) {
                var needsUpdate = !mesh._actualMesh
                    || mesh.needsUpdate
                    || mesh.geometry.needsUpdate;

                if (needsUpdate) {
                    mesh._actualMesh = MeshUtils.fromMesh3js(mesh);
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
                MaterialUtils.updateMaterialFrom3js(mesh.material);
            }
            that._computeModelMatrix(mesh, frameState);

            if (!mesh._textureCommand
                || mesh.needsUpdate
                || mesh.geometry.needsUpdate
            ) {
                if (mesh.material.wireframe) {
                    that.toWireframe(mesh.geometry);
                } else {
                    that.restoreFromWireframe(mesh.geometry);
                }

                mesh._textureCommand = that.createDrawCommand(mesh, frameState);
                //mesh._textureCommand.boundingVolume = mesh.geometry.boundingSphere;
                mesh.needsUpdate = false;
                mesh.material.needsUpdate = false;

            } else {//在不需要重新构建绘图命令时，检查各个属性和索引是否需要更新，需要则将更新相应的缓冲区

                var vaNeedsUpdate = false
                //更新属性缓冲区
                for (var name in mesh.geometry.attributes) {
                    if (mesh.geometry.attributes.hasOwnProperty(name)
                        && mesh.geometry.attributes[name]) {

                        if (mesh.geometry.attributes[name] && mesh.geometry.attributes[name].needsUpdate) {
                            var attrLocation = mesh._textureCommand.vertexArray._attributeLocations[name]
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
                    var command = mesh._textureCommand
                    var attributeLocations = command.vertexArray._attributeLocations
                    var vertexArrayAttributes = command._cacehVertexArrayAttributes
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
                        })
                    }
                    command.vertexArray._attributeLocations = attributeLocations;

                    for (var name in mesh.geometry.attributes) {
                        if (mesh.geometry.attributes.hasOwnProperty(name)
                            && mesh.geometry.attributes[name]) {
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

            if (!item.texture
                || item.texture.width != drawingBufferWidth
                || item.texture.height != drawingBufferHeight
            ) {
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
            if (!item.depthTexture
                || item.depthTexture.width != item.texture.width
                || item.depthTexture.height != item.texture.height
            ) {
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
}

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
        RendererUtils.renderToTexture(item.drawCommands, frameState, item.framebuffer);

        for (var i = 0; i < item.drawCommands.length; i++) {

            item.drawCommands[i]._renderStateOptions.viewport = void (0);
            item.drawCommands[i].renderState = RenderState.fromCache(item.drawCommands[i]._renderStateOptions);

        }
    }
    if (!frameBufferTexture.ready) {
        frameBufferTexture.ready = true;
        frameBufferTexture.readyPromise.resolve(frameBufferTexture);
    }
}


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

    this.initFrameBufferTexture(frameState, frameBufferTexture, viewport)
    var item = frameBufferTexture;
    if (item.drawCommands && item.drawCommands.length > 0) {
        if (!item._computeTexture
            || (item._computeTexture
                && (item._computeTexture.width != viewport.width
                    || item._computeTexture.height != viewport.height)
            )) {
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
                pixelFormat: pixelFormat,//PixelFormat.RGBA,
                pixelDatatype: pixelDatatype
            });
        }

        pixels = RendererUtils.renderToPixels(item.drawCommands, frameState, item._computeTexture, readState ? readState : viewport, pixels);
        for (var i = 0; i < item.drawCommands.length; i++) {
            item.drawCommands[i].renderState.viewport = void (0);
        }
        return pixels;
    }
    else {
        return null;
    }
}
///////2020.04.20  --end

/**
*
*@param {Cesium.Mesh}mesh
*/
MeshVisualizer.prototype.add = function (mesh) {
    this._chidren.push(mesh);
}

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
}

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
    if (visibleOnly && (!node.show && !node.visible)) {
        return;
    }
    if ((node.geometry && node.material) || node instanceof LOD || node instanceof ReferenceMesh) {
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
}

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
        set: function (val) {
            this._scene = val;
        },
        get: function () {
            return this._scene;
        }
    },
    frameState: {
        get: function () {
            if (!this._scene) {
                return undefined;
            }
            return this._scene.frameState;
        }
    },
    modelMatrixNeedsUpdate: {
        get: function () {
            return this._modelMatrixNeedsUpdate;
        },
        set: function (val) {
            this._modelMatrixNeedsUpdate = val;
            if (val) {
                MeshVisualizer.traverse(this, function (child) {
                    child._modelMatrixNeedsUpdate = val;
                }, false);
            }
        }
    },
    showReference: {
        get: function () {
            return this.referenceMesh.show;
        },
        set: function (val) {
            this.referenceMesh.show = val;
        }
    },
    children: {
        get: function () {
            return this._chidren;
        },
        set: function (val) {
            this._chidren = val;
        }
    },
    show: {
        get: function () {
            return this._show;
        },
        set: function (val) {
            this._show = val;
        }
    },
    debug: {
        get: function () {
            return this._debug;
        },
        set: function (val) {
            this._debug = val;
        }
    },
    ready: {
        get: function () {
            return this._ready;
        }
    },
    modelMatrix: {
        get: function () {
            return this._modelMatrix;
        },
        set: function (val) {
            this._modelMatrix = val;
            this._modelMatrixNeedsUpdate = true;
        }
    },
    rotation: {
        get: function () {
            return this._rotation;
        },
        set: function (val) {
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
        get: function () {
            return this._position;
        },
        set: function (val) {
            if (val.x != this._position.x || val.y != this._position.y || val.z != this._position.z) {
                this._position = val;
                this._modelMatrixNeedsUpdate = true;
            }
            this._position = val;
        }
    },
    scale: {
        get: function () {
            return this._scale;
        },
        set: function (val) {
            if (val.x != this._scale.x || val.y != this._scale.y || val.z != this._scale.z) {
                this._scale = val;
                this._modelMatrixNeedsUpdate = true;
            }
            this._scale = val;
        }
    }
});
export default MeshVisualizer;