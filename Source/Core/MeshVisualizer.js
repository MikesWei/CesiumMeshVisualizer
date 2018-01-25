define([
    'Core/Mesh',
    'Core/RendererUtils',
    'Core/MeshMaterial',
    'Core/Shaders/ShaderChunk',
    'Core/Rotation',
    'Core/FramebufferTexture',
    'Core/LOD',
    'Core/ReferenceMesh',
    'ThirdParty/tiff-js/tiff',
    'Util/Path',
    'Core/GeometryUtils'
], function (
    Mesh,
    RendererUtils,
    MeshMaterial,
    ShaderChunk,
    Rotation,
    FramebufferTexture,
    LOD,
    ReferenceMesh,
    TIFFParser,
    Path,
    GeometryUtils
    ) {

    var Matrix4 = Cesium.Matrix4;
    var DrawCommand = Cesium.DrawCommand;
    var defined = Cesium.defined;
    var GeometryPipeline = Cesium.GeometryPipeline;
    var BufferUsage = Cesium.BufferUsage;
    var BlendingState = Cesium.BlendingState;
    var VertexArray = Cesium.VertexArray;
    var ShaderProgram = Cesium.ShaderProgram;
    var DepthFunction = Cesium.DepthFunction;
    var CullFace = Cesium.CullFace;
    var RenderState = Cesium.RenderState;
    var defaultValue = Cesium.defaultValue;
    var Texture = Cesium.Texture;
    var PixelFormat = Cesium.PixelFormat;
    var BoxGeometry = Cesium.BoxGeometry;
    var Cartesian3 = Cesium.Cartesian3;
    var VertexFormat = Cesium.VertexFormat;
    var CubeMap = Cesium.CubeMap;
    var loadCubeMap = Cesium.loadCubeMap;
    var Matrix3 = Cesium.Matrix3;
    var CesiumMath = Cesium.Math;
    var Color = Cesium.Color;

    var scratchTranslation = new Cartesian3();
    var scratchQuaternion = new Cesium.Quaternion();
    var scratchScale = new Cartesian3();
    var scratchTranslationQuaternionRotationScale = new Matrix4();
    var computeModelMatrix = new Matrix4();
    var scratchPosition = new Cartesian3();
    var scratchTraverseArgs = {
        cancelCurrent: false //停止遍历当前节点的所有子节点 
    };
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
    *@property {Cesium.Event}beforeUpate  
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
        this.beforeUpate = new Cesium.Event();
        this._scene = null;
    }
    var world2localMatrix = new Cesium.Matrix4();
    var surfacePointLocal = new Cesium.Cartesian3();
    var rayDir = new Cesium.Cartesian3();
    var pos = new Cesium.Cartesian3();
    var rayOriginLocal = new Cesium.Cartesian3();
    var scratchRay = new Cesium.Ray();

    MeshVisualizer.prototype = {
        /**
        *@param {Cesium.Mesh}mesh
        */
        remove: function (mesh) {

            for (var i = 0; i < this._chidren.length; i++) {
                if (this._chidren[i] == mesh) {

                    this._chidren.splice(i, 1);
                }
            }
            MeshVisualizer.traverse(mesh, function () {
                if (mesh._drawCommand) {
                    mesh._drawCommand.destroy && mesh._drawCommand.destroy();
                }
                if (mesh._actualMesh && mesh._actualMesh._drawCommand) {
                    Cesium.destroyObject(mesh._actualMesh._drawCommand);
                    Cesium.destroyObject(mesh._actualMesh.geometry);
                    Cesium.destroyObject(mesh._actualMesh);
                    Cesium.destroyObject(mesh);
                }
            }, false);
        },
        /**
        *
        *拾取点，用局部坐标系表达。内部使用Cesium.Scene.pickPosition和MeshVisualizer.worldCoordinatesToLocal实现。
        *@param {Cesium.Cartesian2}windowPosition
        *@param {Cesium.Ray}result
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
        *@param {Cesium.Ray}result
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
        *@param {Cesium.Cartesian3}result
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
       *@param {Cesium.Cartesian3}result
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
            if (geometry.triangleIndices) {
                geometry.indices = geometry.triangleIndices;
            }
            geometry.primitiveType = Cesium.PrimitiveType.TRIANGLES;
            return geometry;
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

            var command = new Cesium.DrawCommand({
                modelMatrix: Matrix4.clone(this.modelMatrix),
                owner: mesh,
                primitiveType: geometry.primitiveType,
                cull: false,
                pass: material.translucent ? Cesium.Pass.TRANSLUCENT : Cesium.Pass.OPAQUE
                //,boundingVolume: geometry.boundingSphere
            });

            var attributeLocations = GeometryPipeline.createAttributeLocations(geometry);

            command.vertexArray = VertexArray.fromGeometry({
                context: context,
                geometry: geometry,
                attributeLocations: attributeLocations,
                bufferUsage: BufferUsage.STATIC_DRAW
            });
            command.vertexArray._attributeLocations = attributeLocations;

            var pickObject = {
                primitive: this,
                id: mesh
            };


            var pickId = context.createPickId(pickObject);
            that._pickIds.push(pickId);

            var pickColor = pickId.color;

            command._sp = ShaderProgram.fromCache({
                context: context,
                fragmentShaderSource: this.getFragmentShaderSource(material),
                vertexShaderSource: this.getVertexShaderSource(geometry, material),
                attributeLocations: attributeLocations
            });
            command._pickSp = ShaderProgram.fromCache({
                context: context,
                fragmentShaderSource: 'void main() {\n\tgl_FragColor = vec4(' + pickColor.red + ',' + pickColor.green + ',' + pickColor.blue + ',' + pickColor.alpha + ');\n}',
                vertexShaderSource: this.getVertexShaderSource(geometry, material),
                attributeLocations: attributeLocations
            });
            command.shaderProgram = command._sp;

            command.renderState = this.getRenderState(material);

            command.uniformMap = this.getUniformMap(material, frameState);

            return command;
        },

        /**
        *
        *
        *@param {THREE.Material}material 
        *@return {Cesium.RenderState}frameState
        *@private
        */
        getRenderState: function (material) {
            var renderState = {
                blending: material.blending ? BlendingState.ALPHA_BLEND : BlendingState.DISABLED,
                depthTest: {
                    enabled: material.depthTest,
                    func: DepthFunction.LESS
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
        *@param {Cesium.DrawCommand}drawCommand
        *@param {Cesium.FrameState}frameState
        *@private
        */
        getUniformMap: function (material, frameState) {
            if (this._uniformMaps[material.uuid] && !material.needsUpdate) {
                return this._uniformMaps[material.uuid];

            }
            var uniformMap = {};
            this._uniformMaps[material.uuid] = uniformMap;

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
                                    promises.push(Cesium.loadImage(item.value[i]));
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
                            flipY: item.flipY
                        });
                    }
                }
                return tex;
            }

            function getTextureCallback(item) {

                var callback = function () {

                    if (!that._textureCache[item.value] || item.needsUpdate) {

                        if (item.value instanceof HTMLImageElement
                                    || item.value instanceof HTMLCanvasElement
                                    || item.value instanceof HTMLVideoElement
                            ) {
                            var image = item.value;
                            that._textureCache[item.value] = onTextureImageLoaded(image, item);
                            item.needsUpdate = false;
                            return that._textureCache[item.value];

                        } else {
                            if (typeof item.value === "string" && !callback.isLoading) {
                                callback.isLoading = true;
                                item.needsUpdate = false;
                                var url = item.value.toLocaleLowerCase();

                                var extension = Path.GetExtension(url).slice(1);
                                if (extension == 'tif') {//处理tif纹理

                                    Cesium.loadArrayBuffer(url).then(function (imageArrayBuffer) {
                                        var tiffParser = new TIFFParser();
                                        var tiffCanvas = tiffParser.parseTIFF(imageArrayBuffer);
                                        if (that._textureCache[item.value]) {
                                            that._textureCache[item.value].destroy && that._textureCache[item.value].destroy();
                                        }
                                        that._textureCache[item.value] = onTextureImageLoaded(tiffCanvas, item);
                                        callback.isLoading = false;

                                    }).otherwise(function (err) {
                                        console.log(err);
                                    })

                                } else {
                                    Cesium.loadImage(item.value).then(function (image) {
                                        if (that._textureCache[item.value]) {
                                            that._textureCache[item.value].destroy && that._textureCache[item.value].destroy();
                                        }
                                        that._textureCache[item.value] = onTextureImageLoaded(image, item);
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
                        return that._textureCache[item.value];
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
                            || typeof item.value === "number"
                            || isCssColorString
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

                    if (uniforms.hasOwnProperty(name)) {

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
        getVertexShaderSource: function (geometry, material) {

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
                "uniform mat4 modelViewMatrix",
                "uniform mat4 modelMatrix",
                "uniform mat4 projectionMatrix",
                "uniform mat3 normalMatrix",
                "uniform mat4 u_modelViewMatrix",
                "uniform mat4 u_modelMatrix",
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
        this.beforeUpate.raiseEvent(frameState);

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
            if (typeof THREE !== 'undefined' && mesh instanceof THREE.Mesh) {
                var needsUpdate = !mesh._actualMesh
                    || mesh.needsUpdate
                    || mesh.geometry.needsUpdate;
                if (!needsUpdate) {
                    for (var pn in mesh.geometry.attributes) {
                        if (mesh.geometry.attributes.hasOwnProperty(pn)) {
                            if (mesh.geometry.attributes[pn].needsUpdate) {
                                needsUpdate = true;
                                break;
                            }
                        }
                    }
                }

                if (needsUpdate) {
                    mesh._actualMesh = new Mesh(mesh.geometry, mesh.material);
                }
                mesh._actualMesh.quaternion = Cesium.Quaternion.clone(mesh.quaternion);
                mesh._actualMesh.position = mesh.position;
                mesh._actualMesh.scale = mesh.scale;
                mesh._actualMesh.modelMatrixNeedsUpdate = mesh.modelMatrixNeedsUpdate;
                mesh = mesh._actualMesh;
            }


            that._computeModelMatrix(mesh, frameState);

            if (typeof mesh.update !== 'function') {
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
                                vb.copyFromArrayView(mesh.geometry.attributes[name].values, 0);
                            }
                        }
                    }
                    //更新索引缓冲区
                    if (mesh.geometry.indexNeedsUpdate) {
                        var vb = mesh._drawCommand.vertexArray.indexBuffer;
                        vb.copyFromArrayView(mesh.geometry.indices, 0);
                    }
                }
                mesh._drawCommand.modelMatrix = mesh.modelMatrix;
                if (!mesh._drawCommand.boundingVolume) {
                    if (!mesh.geometry.boundingSphere) {
                        mesh.geometry.boundingSphere = Cesium.BoundingSphere.fromVertices(mesh.geometry.attributes.position.values);
                    }
                    mesh._drawCommand.boundingVolume = Cesium.BoundingSphere.clone(mesh.geometry.boundingSphere);
                }
                Cesium.Matrix4.getTranslation(mesh.modelMatrix, mesh._drawCommand.boundingVolume.center);

                if (frameState.passes.pick) {
                    mesh._drawCommand.shaderProgram = mesh._drawCommand._pickSp;
                } else {
                    mesh._drawCommand.renderState.depthTest.enabled = true;
                    mesh._drawCommand.shaderProgram = mesh._drawCommand._sp;
                }
                frameState.commandList.push(mesh._drawCommand);
            } else {
                mesh.needsUpdate = false;
            }

        }, true);

        //执行帧缓冲绘图命令
        for (var i in that._framebufferTextures) {
            if (that._framebufferTextures.hasOwnProperty(i)) {
                var item = that._framebufferTextures[i].value;
                if (item instanceof FramebufferTexture) {

                    item.drawCommands = [];
                    MeshVisualizer.traverse(item.mesh, function (mesh) {
                        if (typeof THREE !== 'undefined' && mesh instanceof THREE.Mesh) {
                            var needsUpdate = !mesh._actualMesh
                                || mesh.needsUpdate
                                || mesh.geometry.needsUpdate;
                            if (!needsUpdate) {
                                for (var pn in mesh.geometry.attributes) {
                                    if (mesh.geometry.attributes.hasOwnProperty(pn)) {
                                        if (mesh.geometry.attributes[pn].needsUpdate) {
                                            needsUpdate = true;
                                            break;
                                        }
                                    }
                                }
                            }

                            if (needsUpdate) {
                                mesh._actualMesh = new Mesh(mesh.geometry, mesh.material);
                            }
                            mesh._actualMesh.quaternion = Cesium.Quaternion.clone(mesh.quaternion);
                            mesh._actualMesh.position = mesh.position;
                            mesh._actualMesh.scale = mesh.scale;
                            mesh._actualMesh.modelMatrixNeedsUpdate = mesh.modelMatrixNeedsUpdate;
                            mesh = mesh._actualMesh;
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
                            mesh._textureCommand.renderState.depthTest.enabled = false;
                        } else {//在不需要重新构建绘图命令时，检查各个属性和索引是否需要更新，需要则将更新相应的缓冲区

                            //更新属性缓冲区
                            for (var name in mesh.geometry.attributes) {
                                if (mesh.geometry.attributes.hasOwnProperty(name)
                                    && mesh.geometry.attributes[name]) {

                                    if (mesh.geometry.attributes[name] && mesh.geometry.attributes[name].needsUpdate) {
                                        var attrLocation = mesh._textureCommand.vertexArray._attributeLocations[name]
                                        var vb = mesh._textureCommand.vertexArray._attributes[attrLocation].vertexBuffer;
                                        vb.copyFromArrayView(mesh.geometry.attributes[name].values, 0);
                                    }
                                }
                            }
                            //更新索引缓冲区
                            if (mesh.geometry.indexNeedsUpdate) {
                                var vb = mesh._textureCommand.vertexArray.indexBuffer;
                                vb.copyFromArrayView(mesh.geometry.indices, 0);
                            }
                        }

                        mesh._textureCommand.modelMatrix = mesh.modelMatrix;

                        var context = frameState.context;
                        var drawingBufferWidth = context.drawingBufferWidth;
                        var drawingBufferHeight = context.drawingBufferHeight;
                        if (!item.texture
                            || item.texture.width != drawingBufferWidth
                            || item.texture.height != drawingBufferHeight
                            ) {
                            item.texture = new Texture({
                                context: context,
                                width: drawingBufferWidth,
                                height: drawingBufferHeight,
                                pixelFormat: PixelFormat.RGBA
                            });
                        }

                        item.drawCommands.push(mesh._textureCommand);

                    }, true);

                    RendererUtils.renderToTexture(item.drawCommands, frameState, item.texture);
                }
            }
        }

        this._isWireframe = sysWireframe;
        wireframeChanged = false;
        this._modelMatrixNeedsUpdate = false;
        this._geometryChanged = false;

    }

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
    *@param {Boolean}traverseFunc 访问每个节点时回调该函数，进行相关操作。回调函数包含一个参数，traverseArgs，其中封装了一个属性cancelCurrent，可以通过改变此属性达到终止遍历当前节点的子节点
    *@param {Boolean}visibleOnly visibleOnly为true时仅遍历可见的节点，如果父级节点不可见则不再访问其子节点
    */
    MeshVisualizer.traverse = function (node, traverseFunc, visibleOnly) {
        if (!node) {
            return;
        }
        scratchTraverseArgs.cancelCurrent = false;
        if (visibleOnly && (!node.show && !node.visible)) {
            return;
        }
        if ((node.geometry && node.material) || node instanceof LOD || node instanceof ReferenceMesh) {
            traverseFunc(node, scratchTraverseArgs);
        }

        if (scratchTraverseArgs.cancelCurrent) {
            return;
        } else if (node.children) {
            node.children.forEach(function (child) {
                MeshVisualizer.traverse(child, traverseFunc, visibleOnly);
            })
        }
    },

    Cesium.defineProperties(MeshVisualizer.prototype, {
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
    return MeshVisualizer;
})
