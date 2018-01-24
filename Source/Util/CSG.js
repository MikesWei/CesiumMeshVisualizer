define(function () {
     
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


    /**
    *源码参见{@link https://github.com/jscad/csg.js} <br/>
    *Constructive Solid Geometry (CSG) is a modeling technique that uses Boolean<br/>
    *operations like union and intersection to combine 3D solids. This library<br/>
    *implements CSG operations on meshes elegantly and concisely using BSP trees,<br/>
    *and is meant to serve as an easily understandable implementation of the<br/>
    *algorithm. All edge cases involving overlapping coplanar polygons in both<br/>
    *solids are correctly handled.<br/>
    *
    *@example   
         
        MeshVisualizer = Cesium.MeshVisualizer;
        Mesh = Cesium.Mesh;
        MeshMaterial = Cesium.MeshMaterial;
        CSG = Cesium.CSG;  
        GeometryUtils = Cesium.GeometryUtils; 
         //示例1:
         var cube = CSG.cube();
         var sphere = CSG.sphere({ radius: 1.3 });
         var polygons = cube.subtract(sphere).toPolygons();


         //示例2： 
        var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 50000);
        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

        var meshVisualizer = new MeshVisualizer({
            modelMatrix: modelMatrix,
            up: { z: 1 }
        });
        viewer.scene.primitives.add(meshVisualizer);
         
        var material = new MeshMaterial({
            defaultColor: "rgba(0,0,255,1.0)",
            wireframe: true,
            side: MeshMaterial.Sides.DOUBLE
        });

        //创建盒子
        var dimensions = new Cesium.Cartesian3(100000, 50000, 50000);
        var boxGeometry = Cesium.BoxGeometry.createGeometry(Cesium.BoxGeometry.fromDimensions({
            dimensions: dimensions,
            vertexFormat: Cesium.VertexFormat.POSITION_ONLY
        }));
        var box = GeometryUtils.toCSG(boxGeometry);
        var boxMesh = new Mesh(box, material);
        meshVisualizer.add(boxMesh);

        //创建球体
        var sphere = new Cesium.SphereGeometry({
            radius: 50000.0,
            vertexFormat: Cesium.VertexFormat.POSITION_ONLY
        });
        sphere = Cesium.SphereGeometry.createGeometry(sphere);
        sphere = CSG.toCSG(sphere);
        var sphereMesh = new Mesh(sphere, material);
        sphereMesh.position = new Cesium.Cartesian3(100000, 0, 0)
        meshVisualizer.add(sphereMesh);

        //并
        var unionResult = box.union(sphere);
        var unionResultMesh = new Mesh(unionResult, material);
        unionResultMesh.position = new Cesium.Cartesian3(300000, 0, 0)
        meshVisualizer.add(unionResultMesh);

        //交
        var intersectResult = box.intersect(sphere);
        var intersectResultMesh = new Mesh(intersectResult, material);
        intersectResultMesh.position = new Cesium.Cartesian3(500000, 0, 0)
        meshVisualizer.add(intersectResultMesh);

        //球体减盒子
        var subResult = sphere.subtract(box);
        var subResultMesh = new Mesh(subResult, material);
        subResultMesh.position = new Cesium.Cartesian3(700000, 0, 0)
        meshVisualizer.add(subResultMesh);

        //盒子减球体
        var subResult2 = box.subtract(sphere);
        var subResultMesh2 = new Mesh(subResult2, material);
        subResultMesh2.position = new Cesium.Cartesian3(900000, 0, 0)
        meshVisualizer.add(subResultMesh2);

        //渲染CSG创建的几何体
        var cube = CSG.cube({
            center: [0, 0, 0],
            radius: 20000
        });
        var cubeMtl = new MeshMaterial({
            defaultColor: "rgba(255,0,0,1)"
        });
        meshVisualizer.add(new Mesh({
            geometry: cube,
            material: cubeMtl,
            position: new Cesium.Cartesian3(-100000, 0, 0)
        }));
    *@memberof Cesium
    *@constructor
    */
    function CSG() {
        this.polygons = [];
    };

    
    /**
    *Construct a CSG solid from a list of `CSG.Polygon` instances.
    *@param {Array<Cesium.CSG.Polygon>}
    *@param {Array<Cesium.CSG>}
    */
    CSG.fromPolygons = function (polygons) {
        var csg = new CSG();
        csg.polygons = polygons;
        return csg;
    };

    CSG.prototype = {
        /**
        *@return {Cesium.CSG}
        */
        clone: function () {
            var csg = new CSG();
            csg.polygons = this.polygons.map(function (p) { return p.clone(); });
            return csg;
        },
        /**
        *
        *@return {Array<Cesium.CSG.Polygon>}
        */
        toPolygons: function () {
            return this.polygons;
        },

        /**
        * Return a new CSG solid representing space in either this solid or in the<br/>
        * solid `csg`. Neither this solid nor the solid `csg` are modified.<br/>
        * <br/>
        *     A.union(B)<br/>
        * <br/>
        *<pre><code>
        *     +-------+            +-------+
        *     |       |            |       |
        *     |   A   |            |       |
        *     |    +--+----+   =   |       +----+
        *     +----+--+    |       +----+       |
        *          |   B   |            |       |
        *          |       |            |       | 
        *          +-------+            +-------+
        *</code></pre>
        * @param {Cesium.CSG}csg
        * @return {Cesium.CSG}
        */
        union: function (csg) {
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

        /**
         * Return a new CSG solid representing space in this solid but not in the<br/>
         * solid `csg`. Neither this solid nor the solid `csg` are modified.<br/>
         * <br/>
         *     A.subtract(B)<br/>
         * <br/>
         *<pre><code>
         *     +-------+            +-------+ 
         *     |       |            |       | 
         *     |   A   |            |       | 
         *     |    +--+----+   =   |    +--+ 
         *     +----+--+    |       +----+ 
         *          |   B   | 
         *          |       | 
         *          +-------+ 
         *  
         *</code></pre>
         * @param {Cesium.CSG}csg
         * @return {Cesium.CSG}
         */
        subtract: function (csg) {
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

        /**
         * Return a new CSG solid representing space both this solid and in the<br/>
         * solid `csg`. Neither this solid nor the solid `csg` are modified.<br/>
         * <br/>
         *     A.intersect(B)<br/>
         * <br/>
         *<pre><code>
         *     +-------+ 
         *     |       | 
         *     |   A   | 
         *     |    +--+----+   =   +--+ 
         *     +----+--+    |       +--+ 
         *          |   B   | 
         *          |       | 
         *          +-------+ 
         * 
         *</code></pre>
         * @param {Cesium.CSG}csg
         * @return {Cesium.CSG}
         */
        intersect: function (csg) { 
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

        /**
         * Return a new CSG solid with solid and empty space switched. This solid is
         * not modified. 
         * @return {Cesium.CSG}
         */
        inverse: function () {
            var csg = this.clone();
            csg.polygons.map(function (p) { p.flip(); });
            return csg;
        }
    };
     
    /**
    * Construct an axis-aligned solid cuboid. Optional parameters are `center` and<br/>
    * `radius`, which default to `[0, 0, 0]` and `[1, 1, 1]`. The radius can be<br/>
    * specified using a single number or a list of three numbers, one for each axis.<br/>
    * 
    *@example
    * 
    *     var cube = CSG.cube({
    *       center: [0, 0, 0],
    *       radius: 1
    *     });
    *@memberof Cesium.CSG
    *@param {Object}options
    *@param {Array<Number>|Cesium.CSG.Vector}[options.center=[0, 0, 0]]
    *@param {Number|Array<Number>|Cesium.CSG.Vector}[options.radius=1]
    *@return {Cesium.CSG}
    */
    CSG.cube = function (options) {
        options = options || {};
        var c = new CSG.Vector(options.center || [0, 0, 0]);
        var r = !options.radius ? [1, 1, 1] : options.radius.length ?
                 options.radius : [options.radius, options.radius, options.radius];
        return CSG.fromPolygons([
          [[0, 4, 6, 2], [-1, 0, 0]],
          [[1, 3, 7, 5], [+1, 0, 0]],
          [[0, 1, 5, 4], [0, -1, 0]],
          [[2, 6, 7, 3], [0, +1, 0]],
          [[0, 2, 3, 1], [0, 0, -1]],
          [[4, 5, 7, 6], [0, 0, +1]]
        ].map(function (info) {
            return new CSG.Polygon(info[0].map(function (i) {
                var pos = new CSG.Vector(
                  c.x + r[0] * (2 * !!(i & 1) - 1),
                  c.y + r[1] * (2 * !!(i & 2) - 1),
                  c.z + r[2] * (2 * !!(i & 4) - 1)
                );
                return new CSG.Vertex(pos, new CSG.Vector(info[1]));
            }));
        }));
    };

    /**
    * Construct a solid sphere. Optional parameters are `center`, `radius`,<br/>
    * `slices`, and `stacks`, which default to `[0, 0, 0]`, `1`, `16`, and `8`.<br/>
    * The `slices` and `stacks` parameters control the tessellation along the<br/>
    * longitude and latitude directions.<br/>
    * 
    *@example
    * 
    *     var sphere = CSG.sphere({
    *       center: [0, 0, 0],
    *       radius: 1,
    *       slices: 16,
    *       stacks: 8
    *     });
    *@memberof Cesium.CSG
    *@param {Object}options
    *@param {Array<Number>|Cesium.CSG.Vector}[options.center=[0, 0, 0]]
    *@param {Number}[options.radius=1]
    *@param {Number}[options.slices=16]
    *@param {Number}[options.stacks=8]
    *@return {Cesium.CSG}
    */
    CSG.sphere = function (options) {
        options = options || {};
        var c = new CSG.Vector(options.center || [0, 0, 0]);
        var r = options.radius || 1;
        var slices = options.slices || 16;
        var stacks = options.stacks || 8;
        var polygons = [], vertices;
        function vertex(theta, phi) {
            theta *= Math.PI * 2;
            phi *= Math.PI;
            var dir = new CSG.Vector(
              Math.cos(theta) * Math.sin(phi),
              Math.cos(phi),
              Math.sin(theta) * Math.sin(phi)
            );
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

    /**
    * Construct a solid cylinder. Optional parameters are `start`, `end`,<br/>
    * `radius`, and `slices`, which default to `[0, -1, 0]`, `[0, 1, 0]`, `1`, and<br/>
    * `16`. The `slices` parameter controls the tessellation.<br/>
    * 
    *@example
    * 
    *     var cylinder = CSG.cylinder({
    *       start: [0, -1, 0],
    *       end: [0, 1, 0],
    *       radius: 1,
    *       slices: 16
    *     });
    *@memberof Cesium.CSG
    *@param {Object}options
    *@param {Array<Number>|Cesium.CSG.Vector}[options.start=[0, -1, 0]]
    *@param {Array<Number>|Cesium.CSG.Vector}[options.end=[0, -1, 0]]
    *@param {Number}[options.radius=1]
    *@param {Number}[options.slices=16] 
    *@return {Cesium.CSG}
    */
    CSG.cylinder = function (options) {
        options = options || {};
        var s = new CSG.Vector(options.start || [0, -1, 0]);
        var e = new CSG.Vector(options.end || [0, 1, 0]);
        var ray = e.minus(s);
        var r = options.radius || 1;
        var slices = options.slices || 16;
        var axisZ = ray.unit(), isY = (Math.abs(axisZ.y) > 0.5);
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
            var t0 = i / slices, t1 = (i + 1) / slices;
            polygons.push(new CSG.Polygon([start, point(0, t0, -1), point(0, t1, -1)]));
            polygons.push(new CSG.Polygon([point(0, t1, 0), point(0, t0, 0), point(1, t0, 0), point(1, t1, 0)]));
            polygons.push(new CSG.Polygon([end, point(1, t1, 1), point(1, t0, 1)]));
        }
        return CSG.fromPolygons(polygons);
    };

    /**     
    * class Vector<br/>
    * Represents a 3D vector.
    *@example
    * 
    *     new CSG.Vector(1, 2, 3);
    *     new CSG.Vector([1, 2, 3]);
    *     new CSG.Vector({ x: 1, y: 2, z: 3 });
    *
    *@memberof Cesium.CSG 
    *
    *@param {Number|Array<Number>|Cesium.CSG.Vector}xOrArrayXYZOrVec
    *@param {Number}[y] 
    *@param {Number}[z] 
    *
    *@property {Number}x
    *@property {Number}y
    *@property {Number}z
    *
    *@constructor
    */
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
        /**
        *@return {Cesium.CSG.Vector}
        */
        clone: function () {
            return new CSG.Vector(this.x, this.y, this.z);
        },

        /**
        *@return {Cesium.CSG.Vector}
        */
        negated: function () {
            return new CSG.Vector(-this.x, -this.y, -this.z);
        },

        /**
        *@param {Cesium.CSG.Vector}a
        *@return {Cesium.CSG.Vector}
        */
        plus: function (a) {
            return new CSG.Vector(this.x + a.x, this.y + a.y, this.z + a.z);
        },

        /**
        *@param {Cesium.CSG.Vector}a
        *@return {Cesium.CSG.Vector}
        */
        minus: function (a) {
            return new CSG.Vector(this.x - a.x, this.y - a.y, this.z - a.z);
        },

        /**
        *@param {Number}a
        *@return {Cesium.CSG.Vector}
        */
        times: function (a) {
            return new CSG.Vector(this.x * a, this.y * a, this.z * a);
        },

        /**
        *@param {Number}a
        *@return {Cesium.CSG.Vector}
        */
        dividedBy: function (a) {
            return new CSG.Vector(this.x / a, this.y / a, this.z / a);
        },

        /**
        *@param {Cesium.CSG.Vector}a
        *@return {Cesium.CSG.Vector}
        */
        dot: function (a) {
            return this.x * a.x + this.y * a.y + this.z * a.z;
        },

        /**
        *@param {Cesium.CSG.Vector}a
        *@param {Number}t
        *@return {Cesium.CSG.Vector}
        */
        lerp: function (a, t) {
            return this.plus(a.minus(this).times(t));
        },

        /** 
        *@return {Number}
        */
        length: function () {
            return Math.sqrt(this.dot(this));
        },

        /**
        *@return {Cesium.CSG.Vector}
        */
        unit: function () {
            return this.dividedBy(this.length());
        },

        /**
        *@param {Cesium.CSG.Vector}a
        *@return {Cesium.CSG.Vector}
        */
        cross: function (a) {
            return new CSG.Vector(
              this.y * a.z - this.z * a.y,
              this.z * a.x - this.x * a.z,
              this.x * a.y - this.y * a.x
            );
        }
    };

    /**
    * class Vertex<br/>
    *<br/>
    * Represents a vertex of a polygon. Use your own vertex class instead of this<br/>
    * one to provide additional features like texture coordinates and vertex<br/>
    * colors. Custom vertex classes need to provide a `pos` property and `clone()`,<br/>
    * `flip()`, and `interpolate()` methods that behave analogous to the ones<br/>
    * defined by `CSG.Vertex`. This class provides `normal` so convenience<br/>
    * functions like `CSG.sphere()` can return a smooth vertex normal, but `normal`<br/>
    * is not used anywhere else.<br/>
    *
    *@memberof Cesium.CSG 
    *@param {Array<Number>|Cesium.CSG.Vector}pos
    *@param {Array<Number>|Cesium.CSG.Vector}normal
    *
    *@property {Cesium.CSG.Vector}pos
    *@property {Cesium.CSG.Vector}normal
    *
    *@constructor
    */
    CSG.Vertex = function (pos, normal) {
        this.pos = new CSG.Vector(pos);
        this.normal = new CSG.Vector(normal);
    };

    CSG.Vertex.prototype = {
        /**
        *@return {Cesium.CSG.Vertex}
        */
        clone: function () {
            return new CSG.Vertex(this.pos.clone(), this.normal.clone());
        },
        /**
        * Invert all orientation-specific data (e.g. vertex normal). Called when the<br/>
        * orientation of a polygon is flipped.
        *
        */
        flip: function () {
            this.normal = this.normal.negated();
        },

        /**
        * Create a new vertex between this vertex and `other` by linearly<br/>
        * interpolating all properties using a parameter of `t`. Subclasses should<br/>
        * override this to interpolate additional properties.
        * 
        *@param {Cesium.CSG.Vertex}
        *@param {Number}
        *@return {Cesium.CSG.Vertex}
        */
        interpolate: function (other, t) {
            return new CSG.Vertex(
              this.pos.lerp(other.pos, t),
              this.normal.lerp(other.normal, t)
            );
        }
    };

    /**
    * class Plane</br/>
    *
    * Represents a plane in 3D space.
    *
    *@memberof Cesium.CSG 
    *@param {Array<Number>|Cesium.CSG.Vector}normal
    *@param {Number}w
    *
    *@property {Cesium.CSG.Vector}normal
    *@property {Number}w
    *
    *@constructor
    */
    CSG.Plane = function (normal, w) {
        this.normal = normal;
        this.w = w;
    };
    /**
    * `CSG.Plane.EPSILON` is the tolerance used by `splitPolygon()` to decide if a</br/>
    * point is on the plane.
    */
    CSG.Plane.EPSILON = 1e-5;

    /**
    *
    *
    *@param {Cesium.CSG.Vector}a
    *@param {Cesium.CSG.Vector}b
    *@param {Cesium.CSG.Vector}c
    */
    CSG.Plane.fromPoints = function (a, b, c) {
        var n = b.minus(a).cross(c.minus(a)).unit();
        return new CSG.Plane(n, n.dot(a));
    };

    CSG.Plane.prototype = {
        /**
        *@return {Cesium.CSG.Plane}
        */
        clone: function () {
            return new CSG.Plane(this.normal.clone(), this.w);
        },

        /**
        * 
        */
        flip: function () {
            this.normal = this.normal.negated();
            this.w = -this.w;
        },

        /**
        * Split `polygon` by this plane if needed, then put the polygon or polygon<br/>
        * fragments in the appropriate lists. Coplanar polygons go into either<br/>
        * `coplanarFront` or `coplanarBack` depending on their orientation with<br/>
        * respect to this plane. Polygons in front or in back of this plane go into<br/>
        * either `front` or `back`.
        *
        *@param {Cesium.CSG.Polygon}polygon
        *@param {Array<Cesium.CSG.Polygon>}coplanarFront
        *@param {Array<Cesium.CSG.Polygon>}coplanarBack
        *@param {Array<Cesium.CSG.Polygon>}front
        *@param {Array<Cesium.CSG.Polygon>}back
        */
        splitPolygon: function (polygon, coplanarFront, coplanarBack, front, back) {
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
                var type = (t < -CSG.Plane.EPSILON) ? BACK : (t > CSG.Plane.EPSILON) ? FRONT : COPLANAR;
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
                    var f = [], b = [];
                    for (var i = 0; i < polygon.vertices.length; i++) {
                        var j = (i + 1) % polygon.vertices.length;
                        var ti = types[i], tj = types[j];
                        var vi = polygon.vertices[i], vj = polygon.vertices[j];
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

    /**
    * class Polygon<br/>
    *<br/>
    * Represents a convex polygon. The vertices used to initialize a polygon must<br/>
    * be coplanar and form a convex loop. They do not have to be `CSG.Vertex`<br/>
    * instances but they must behave similarly (duck typing can be used for<br/>
    * customization).<br/>
    * <br/>
    * Each convex polygon has a `shared` property, which is shared between all<br/>
    * polygons that are clones of each other or were split from the same polygon.<br/>
    * This can be used to define per-polygon properties (such as surface color).<br/>
    *
    *@memberof Cesium.CSG 
    *@param {Array<Cesium.CSG.Vertex>}vertices
    *@param {Boolean}shared
    *
    *@property {Array<Cesium.CSG.Vertex>}vertices
    *@property {Boolean}shared
    *@property {Cesium.CSG.Plane}plane
    *@constructor
    */
    CSG.Polygon = function (vertices, shared) {
        this.vertices = vertices;
        this.shared = shared;
        this.plane = CSG.Plane.fromPoints(vertices[0].pos, vertices[1].pos, vertices[2].pos);
    };

    CSG.Polygon.prototype = {
        /**
        *@return {Cesium.CSG.Polygon}
        */
        clone: function () {
            var vertices = this.vertices.map(function (v) { return v.clone(); });
            return new CSG.Polygon(vertices, this.shared);
        },

        /**
        * 
        */
        flip: function () {
            this.vertices.reverse().map(function (v) { v.flip(); });
            this.plane.flip();
        }
    };

    /**
    *
    * class Node<br/>
    *<br/>
    * Holds a node in a BSP tree. A BSP tree is built from a collection of polygons<br/>
    * by picking a polygon to split along. That polygon (and all other coplanar<br/>
    * polygons) are added directly to that node and the other polygons are added to<br/>
    * the front and/or back subtrees. This is not a leafy BSP tree since there is<br/>
    * no distinction between internal and leaf nodes.<br/>
    *
    *@memberof Cesium.CSG 
    *@param {Array<Cesium.CSG.Polygon>}polygons 
    *
    *@property {Array<Cesium.CSG.Polygon>}polygons  
    *@property {Cesium.CSG.Plane}plane
    *@property {Cesium.CSG.Plane}front
    *@property {Cesium.CSG.Plane}back
    *@constructor
    */
    CSG.Node = function (polygons) {
        this.plane = null;
        this.front = null;
        this.back = null;
        this.polygons = [];
        if (polygons) this.build(polygons);
    };

    CSG.Node.prototype = {
        /**
        *@return {Cesium.CSG.Node}
        */
        clone: function () {
            var node = new CSG.Node();
            node.plane = this.plane && this.plane.clone();
            node.front = this.front && this.front.clone();
            node.back = this.back && this.back.clone();
            node.polygons = this.polygons.map(function (p) { return p.clone(); });
            return node;
        },

        /**
        * Convert solid space to empty space and empty space to solid space.
        */
        invert: function () {
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

        /**
        * Recursively remove all polygons in `polygons` that are inside this BSP<br/>
        * tree.
        *@param {Array<Cesium.CSG.Polygon>}polygons
        *@return {Array<Cesium.CSG.Polygon>}
        */
        clipPolygons: function (polygons) {
            if (!this.plane) return polygons.slice();
            var front = [], back = [];
            for (var i = 0; i < polygons.length; i++) {
                this.plane.splitPolygon(polygons[i], front, back, front, back);
            }
            if (this.front) front = this.front.clipPolygons(front);
            if (this.back) back = this.back.clipPolygons(back);
            else back = [];
            return front.concat(back);
        },

        /**
        * Remove all polygons in this BSP tree that are inside the other BSP tree<br/>
        * `bsp`.
        */
        clipTo: function (bsp) {
            this.polygons = bsp.clipPolygons(this.polygons);
            if (this.front) this.front.clipTo(bsp);
            if (this.back) this.back.clipTo(bsp);
        },

        /**
        * Return a list of all polygons in this BSP tree.
        *@return {Array<Cesium.CSG.Polygon>}
        */
        allPolygons: function () {
            var polygons = this.polygons.slice();
            if (this.front) polygons = polygons.concat(this.front.allPolygons());
            if (this.back) polygons = polygons.concat(this.back.allPolygons());
            return polygons;
        },

        /**
        * Build a BSP tree out of `polygons`. When called on an existing tree, the<br/>
        * new polygons are filtered down to the bottom of the tree and become new<br/>
        * nodes there. Each set of polygons is partitioned using the first polygon<br/>
        * (no heuristic is used to pick a good split).<br/>
        */
        build: function (polygons) {
            if (!polygons.length) return;
            if (!this.plane) this.plane = polygons[0].plane.clone();
            var front = [], back = [];
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

    /**
    *@param {Cesium.Geometry}
    *@param {Cesium.Cartesian3}[offset]
    *@return {CSG}
    */
    CSG.toCSG = function (geometry, offset) {
        if (!offset) {
            offset = { x: 0, y: 0, z: 0 };
        }
        if (!geometry.attributes.normal) {
            geometry = Cesium.GeometryPipeline.computeNormal(geometry);
        }
        if (geometry.primitiveType !== Cesium.PrimitiveType.TRIANGLES) {
            throw new Error("暂不支持此类几何体");
        }
        if (!CSG) {
            throw new Error('CSG 库未加载。请从 https://github.com/evanw/csg.js 获取');
        }
        var faceCount = geometry.indices.length / 3;
        var polygons = [], vertices = [];
        var positions = geometry.attributes.position.values;
        var normals = geometry.attributes.normal.values;
        var normalIdx = 0, positionIdx = 0;

        for (var i = 0; i < geometry.indices.length  ; i += 3) {
            vertices = [];

            var idx1 = geometry.indices[i];
            var idx2 = geometry.indices[i + 1];
            var idx3 = geometry.indices[i + 2];

            positionIdx = idx1 * 3;
            normalIdx = idx1 * 3;

            vertices.push(new CSG.Vertex(
                 [positions[positionIdx++] + offset.x, positions[positionIdx++] + offset.y, positions[positionIdx++] + offset.z],
                 [normals[normalIdx++], normals[normalIdx++], normals[normalIdx++]]
                ));

            positionIdx = idx2 * 3;
            normalIdx = idx2 * 3;
            vertices.push(new CSG.Vertex(
                [positions[positionIdx++] + offset.x, positions[positionIdx++] + offset.y, positions[positionIdx++] + offset.z],
                [normals[normalIdx++], normals[normalIdx++], normals[normalIdx++]]
               ));

            positionIdx = idx3 * 3;
            normalIdx = idx3 * 3;
            vertices.push(new CSG.Vertex(
                [positions[positionIdx++] + offset.x, positions[positionIdx++] + offset.y, positions[positionIdx++] + offset.z],
                [normals[normalIdx++], normals[normalIdx++], normals[normalIdx++]]
               ));
            polygons.push(new CSG.Polygon(vertices));
        }
        return CSG.fromPolygons(polygons);
    }
    /**
    *@param {CSG}csg_model
    *@return {Cesium.Geometry}
    */
    CSG.fromCSG = function (csg_model) {
        var i, j, vertices,
			polygons = csg_model.toPolygons();

        if (!CSG) {
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
    },
    /**
    *@param {Array<Number>}positions
    *@param {Array<Number>}normals
    *@param {Cesium.CSG.Vector}vertice_position
    *@param {Cesium.CSG.Vector}plane_normal
    *@return {Number}
    *@private
    */
    CSG.getGeometryVertice = function (positions, normals, vertice_position, plane_normal) {
        var i, idx = 0;
        for (i = 0; i < positions.length; i += 3) {
            if (positions[i] === vertice_position.x
                && positions[i + 1] === vertice_position.y
                && positions[i + 2] === vertice_position.z) {
                // Vertice already exists
                return idx;
            }
            idx++;
        };

        positions.push(vertice_position.x, vertice_position.y, vertice_position.z);
        normals.push(plane_normal.x, plane_normal.y, plane_normal.z);
        return idx;
    }

    return CSG;
})