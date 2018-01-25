define([
    'Core/Rotation',
    'Util/CSG',
    'Core/MeshMaterial',
    'Core/GeometryUtils',
    'Core/MeshPhongMaterial'
], function (
    Rotation,
    CSG,
    MeshMaterial,
    GeometryUtils,
    MeshPhongMaterial
    ) {
    var defaultValue = Cesium.defaultValue;
    /**
    *
    *@param {Object|geometry}options 
    *@param {Cesium.Geometry|Cesium.CSG|THREE.Geometry|THREE.BufferGeometry}options.geometry  
    *@param {Cesium.MeshMaterial}options.material  
    *@param {Boolean}[options.show=true]  
    *@param {Cesium.Cartesian3}[options.position]
    *@param {Cesium.Rotation}[options.rotation]
    *@param {Cesium.Cartesian3}[options.scale]   
    *@param {Cesium.MeshMaterial}[material]
    *
    *@property {Cesium.Geometry}geometry  
    *@property {Cesium.MeshMaterial}material
    *@property {Boolean}show  
    *@property {Cesium.Cartesian3}position
    *@property {Cesium.VolumeRendering.Rotation}rotation
    *@property {Cesium.Cartesian3}scale   
    *@property {Boolean}needUpdate 
    *@property {Cesium.Mesh|Cesium.LOD}parent 
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
                material: arguments[1]
            };
        }
        if (!options || !options.geometry) {
            throw new Error("geometry是必须参数");
        }
        if (!Mesh.isGeometrySupported(options.geometry)) {
            throw new Error("暂不支持此类型的geometry");
        }

        if (GeometryUtils.isGeometry3js(options.geometry)) {
            options.geometry = GeometryUtils.fromGeometry3js(options.geometry);
        } else if (options.geometry instanceof CSG) {
            if (options.geometry.polygons.length == 0) {
                options.show = false;
            }
            options.geometry = CSG.fromCSG(options.geometry);
        } else if (typeof options.geometry.constructor.createGeometry == 'function') {
            options.geometry = options.geometry.constructor.createGeometry(options.geometry);
        }

        this.uuid = Cesium.createGuid();
        this.show = defaultValue(options.show, true);
        this._geometry = options.geometry;
        this._material = defaultValue(options.material, new MeshMaterial());
        this._position = defaultValue(options.position, new Cesium.Cartesian3(0, 0, 0));
        this._scale = defaultValue(options.scale, new Cesium.Cartesian3(1, 1, 1));
        this._rotation = defaultValue(options.rotation, { axis: new Cesium.Cartesian3(0, 0, 1), angle: 0 });
        this._rotation = new Rotation(this._rotation.axis, this._rotation.angle);
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
        this.userData = {};
        if (!this._geometry.attributes.normal
            && this.material instanceof MeshPhongMaterial
            && this._geometry.primitiveType == Cesium.PrimitiveType.TRIANGLES
            ) {
            Cesium.GeometryPipeline.computeNormal(this._geometry);
            //GeometryUtils.computeVertexNormals(this._geometry);
        }
    }

    Mesh.isGeometrySupported = function (geometry) {
        var supported = (geometry instanceof Cesium.Geometry
            || geometry instanceof CSG
            || typeof geometry.constructor.createGeometry == 'function'
            || GeometryUtils.isGeometry3js(geometry));
        return supported;
    }


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
            })
        }
    }


    /**
     *  
     * @callback Cesium.Mesh~TraverseCallback
     * @param {Cesium.Mesh|Cesium.LOD}node
     */

    Cesium.defineProperties(Mesh.prototype, {

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
                this._parent = val;
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
            },
            set: function (val) {
                this._children = val;
                this._needsUpdate = true;
            }
        },
        geometry: {
            get: function () {
                return this._geometry;
            },
            set: function (val) {
                this._geometry = val;
                this._needsUpdate = true;
                this.modelMatrixNeedsUpdate = true;
            }
        },
        material: {
            get: function () {
                return this._material;
            },
            set: function (val) {
                this._material = val;
                this._needsUpdate = true;
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
                    // this._needUpdate = true;
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
                    //this._needsUpdate = true;
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
    }
    return Mesh;
})
