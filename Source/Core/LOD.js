define([
    'Core/Rotation',
    'Core/RendererUtils'
], function (
    Rotation,
    RendererUtils
    ) {


    var defaultValue = Cesium.defaultValue;
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

        options = defaultValue(options, {});

        this.uuid = Cesium.createGuid();
        this.show = defaultValue(options.show, true);
        this.maxAvailableDistance = defaultValue(options.maxAvailableDistance, Number.MAX_VALUE);
        this._position = defaultValue(options.position, new Cesium.Cartesian3(0, 0, 0));
        this._scale = defaultValue(options.scale, new Cesium.Cartesian3(1, 1, 1));
        this._rotation = defaultValue(options.rotation, { axis: new Cesium.Cartesian3(0, 0, 1), angle: 0 });
        this._rotation = new Rotation(this._rotation.axis, this._rotation.angle);
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

        /**
        *@param {Cesium.Mesh}mesh
        *@param {Number}distance
        */
        addLevel: function (object, distance) {

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

            var actualPosition = new Cesium.Cartesian3();

            return function update(parentModelMatrix, frameState) {

                var levels = this.levels;

                if (levels.length > 1) {
                    if (this._modelMatrixNeedsUpdate) {

                        RendererUtils.computeModelMatrix(
                           parentModelMatrix,
                           this.position,
                           this.rotation,
                           this.scale,
                           this.modelMatrix
                       );

                        this._modelMatrixNeedsUpdate = false;
                    }

                    Cesium.Matrix4.getTranslation(this.modelMatrix, actualPosition);

                    Cesium.Cartesian3.clone(actualPosition, this._boundingSphere.center);

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
        getObjectForDistance: function (distance) {

            var levels = this.levels;

            for (var i = 1, l = levels.length; i < l; i++) {

                if (distance < levels[i].distance) {

                    break;

                }

            }

            return levels[i - 1].object;

        }
    };

    Cesium.defineProperties(LOD.prototype, {
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
                this._needsUpdate = true;
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
                    this._needsUpdate = true;
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
                    this._needsUpdate = true;
                }
                this._scale = val;
            }
        }
    });

    return LOD;

})