define([
    'Core/ArrowGeometry',
    'Core/PlaneGeometry',
    'Core/Mesh',
    'Core/MeshMaterial',
    'Core/Rotation',
    'Core/RendererUtils'
], function (
    ArrowGeometry,
    PlaneGeometry,
    Mesh,
    MeshMaterial,
    Rotation,
    RendererUtils
    ) {
    var defaultValue = Cesium.defaultValue;
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
        options = Cesium.defaultValue(options, {});
        this._axisParameter = new ArrowGeometry(options.axisParameter);
        this._axisParameterY = new ArrowGeometry(options.axisParameter);
        this._axisParameterY.reverse = true;

        var materialZ = new MeshMaterial({
            defaultColor: "rgba(255,0,0,1)",
            wireframe: false,
            side: MeshMaterial.Sides.DOUBLE,
            translucent: false,

        });
        var materialY = new MeshMaterial({
            defaultColor: "rgba(0,255,0,1)",
            wireframe: false,
            side: MeshMaterial.Sides.DOUBLE,
            translucent: true,

        });
        var materialX = new MeshMaterial({
            defaultColor: "rgba(0,0,255,1)",
            wireframe: false,
            side: MeshMaterial.Sides.DOUBLE,
            translucent: false,

        });

        var axisLine = ArrowGeometry.createGeometry(new ArrowGeometry(this._axisParameter));
        var axisLineY = ArrowGeometry.createGeometry(new ArrowGeometry(this._axisParameterY));

        var meshZ = new Mesh(axisLine, materialZ);
        var meshY = new Mesh(axisLineY, materialY);
        var meshX = new Mesh(axisLine, materialX);
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
        this._rotation = new Rotation(this._rotation.axis, this._rotation.angle);
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
    Cesium.defineProperties(ReferenceMesh.prototype, {
        modelMatrix: {
            get: function () {
                return this._modelMatrix;
            }
        },
        parent: {
            get: function () {
                return this._parent;
            },
            set: function (val) {
                if (val && ((val._children && Cesium.isArray(val._children)) || (val.children && Cesium.isArray(val.children)))) {

                    if (this._parent && this._parent != val) {
                        var children = this._parent._children ? this._parent._children : this._parent.children;
                        if (Cesium.isArray(children)) {
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
            get: function () {
                return this._modelMatrixNeedsUpdate;
            },
            set: function (val) {
                this._modelMatrixNeedsUpdate = val;
                if (this._modelMatrixNeedsUpdate) {
                    Mesh.traverse(this, function (mesh) {
                        mesh._modelMatrixNeedsUpdate = val;
                    });
                }
            }
        },
        children: {
            get: function () {
                return this._children;
            }
        },
        needsUpdate: {
            get: function () {
                return this._needsUpdate;
            },
            set: function (val) {
                this._needsUpdate = val;
            }
        },
        rotation: {
            get: function () {
                return this._rotation;
            },
            set: function (val) {
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
            get: function () {
                return this._position;
            },
            set: function (val) {
                if (val.x != this._position.x || val.y != this._position.y || val.z != this._position.z) {
                    this._position = val;
                    this.modelMatrixNeedsUpdate = true;
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

            RendererUtils.computeModelMatrix(
               parentModelMatrix,
               this.position,
               this.rotation,
               this.scale,
               this.modelMatrix
           );

            this._modelMatrixNeedsUpdate = false;
        }
    }

    return ReferenceMesh;
})