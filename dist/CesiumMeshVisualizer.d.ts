
export = CesiumMeshVisualizer;
export as namespace CesiumMeshVisualizer;
/**
 * Make you can use three.js geometry in Cesium,and use mesh,geometry,material like three.js to manage renderable object in Cesium.
 */
declare namespace CesiumMeshVisualizer {
    /**
     *  Constructive Solid Geometry (CSG) is a modeling technique that uses Boolean
        operations like union and intersection to combine 3D solids. This library
        implements CSG operations on meshes elegantly and concisely using BSP trees,
        and is meant to serve as an easily understandable implementation of the
        algorithm. All edge cases involving overlapping coplanar polygons in both
        solids are correctly handled.
        
        Example usage:
        
            var cube = CSG.cube();
            var sphere = CSG.sphere({ radius: 1.3 });
            var polygons = cube.subtract(sphere).toPolygons();
        
        ## Implementation Details
        
        All CSG operations are implemented in terms of two functions, `clipTo()` and
        `invert()`, which remove parts of a BSP tree inside another BSP tree and swap
        solid and empty space, respectively. To find the union of `a` and `b`, we
        want to remove everything in `a` inside `b` and everything in `b` inside `a`,
        then combine polygons from `a` and `b` into one solid:
        
            a.clipTo(b);
            b.clipTo(a);
            a.build(b.allPolygons());
        
        The only tricky part is handling overlapping coplanar polygons in both trees.
        The code above keeps both copies, but we need to keep them in one tree and
        remove them in the other tree. To remove them from `b` we can clip the
        inverse of `b` against `a`. The code for union now looks like this:
        
            a.clipTo(b);
            b.clipTo(a);
            b.invert();
            b.clipTo(a);
            b.invert();
            a.build(b.allPolygons());
        
        Subtraction and intersection naturally follow from set operations. If
        union is `A | B`, subtraction is `A - B = ~(~A | B)` and intersection is
        `A & B = ~(~A | ~B)` where `~` is the complement operator.
        
        ## License
        
        Copyright (c) 2011 Evan Wallace (http://madebyevan.com/), under the MIT license.       
        # class CSG       
        Holds a binary space partition tree representing a 3D solid. Two solids can
        be combined using the `union()`, `subtract()`, and `intersect()` methods.
     */
    export class CSG {

        polygons: []

        /**
         * Construct a CSG solid from a list of `CSG.Polygon` instances.
         */
        static fromPolygons: (polygons) => CSG

        clone: () => CSG

        toPolygons: () => []

        /** 
         * Return a new CSG solid representing space in either this solid or in the
         * solid `csg`. Neither this solid nor the solid `csg` are modified.
         * 
         *     A.union(B)
         * 
         *     +-------+            +-------+
         *     |       |            |       |
         *     |   A   |            |       |
         *     |    +--+----+   =   |       +----+
         *     +----+--+    |       +----+       |
         *          |   B   |            |       |
         *          |       |            |       |
         *          +-------+            +-------+
         * 
         */
        union: (csg) => CSG

        /** 
         * Return a new CSG solid representing space in this solid but not in the
         * solid `csg`. Neither this solid nor the solid `csg` are modified.
         * 
         *     A.subtract(B)
         * 
         *     +-------+            +-------+
         *     |       |            |       |
         *     |   A   |            |       |
         *     |    +--+----+   =   |    +--+
         *     +----+--+    |       +----+
         *          |   B   |
         *          |       |
         *          +-------+
         */
        subtract: (csg) => CSG

        /** 
         * Return a new CSG solid representing space both this solid and in the
         * solid `csg`. Neither this solid nor the solid `csg` are modified.
         * 
         *     A.intersect(B)
         * 
         *     +-------+
         *     |       |
         *     |   A   |
         *     |    +--+----+   =   +--+
         *     +----+--+    |       +--+
         *          |   B   |
         *          |       |
         *          +-------+
        */
        intersect: (csg) => CSG

        /**
         * Return a new CSG solid with solid and empty space switched. This solid is
         * not modified.
        */
        inverse: () => CSG

        /** 
         * Construct an axis-aligned solid cuboid. Optional parameters are `center` and
         * `radius`, which default to `[0, 0, 0]` and `[1, 1, 1]`. The radius can be
         * specified using a single number or a list of three numbers, one for each axis.
         * 
         * Example code:
         * 
         *     var cube = CSG.cube({
         *       center: [0, 0, 0],
         *       radius: 1
         *     });
         */
        static cube: (options) => CSG

        /** 
        * Construct a solid sphere. Optional parameters are `center`, `radius`,
        * `slices`, and `stacks`, which default to `[0, 0, 0]`, `1`, `16`, and `8`.
        * The `slices` and `stacks` parameters control the tessellation along the
        * longitude and latitude directions.
        * 
        * Example usage:
        * 
        *     var sphere = CSG.sphere({
        *       center: [0, 0, 0],
        *       radius: 1,
        *       slices: 16,
        *       stacks: 8
        *     });
       */
        static sphere: (options) => CSG

        /** 
        * Construct a solid cylinder. Optional parameters are `start`, `end`,
        * `radius`, and `slices`, which default to `[0, -1, 0]`, `[0, 1, 0]`, `1`, and
        * `16`. The `slices` parameter controls the tessellation.
        * 
        * Example usage:
        * 
        *     var cylinder = CSG.cylinder({
        *       start: [0, -1, 0],
        *       end: [0, 1, 0],
        *       radius: 1,
        *       slices: 16
        *     });
        */
        static cylinder: (options) => CSG


    }


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
    export class BasicGeometry {
        constructor(options: {

            positions: number[] | Float32Array
            indices: number[] | Int32Array
            normals: number[] | Float32Array
            uvs: number[] | Float32Array
        })
        positions: number[] | Float32Array
        indices: number[] | Int32Array
        normals: number[] | Float32Array
        uvs: number[] | Float32Array


        /**
        *
        *@param {Cesium.BasicGeometry}basicGeometry
        *@return {Cesiumm.Geometry} 
        */
        static createGeometry: (basicGeometry) => Cesium.Geometry
    }

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
    export class ArrowGeometry {
        constructor(options: {
            length: number//= Cesium.defaultValue(options.length, 50000);
            width: number// = Cesium.defaultValue(options.width, 125);
            headLength: number// = Cesium.defaultValue(options.headLength, 5000);
            headWidth: number// = Cesium.defaultValue(options.headWidth, 1000);
            reverse: boolean//= Cesium.defaultValue(options.reverse, false);
        })
        length: number//= Cesium.defaultValue(options.length, 50000);
        width: number// = Cesium.defaultValue(options.width, 125);
        headLength: number// = Cesium.defaultValue(options.headLength, 5000);
        headWidth: number// = Cesium.defaultValue(options.headWidth, 1000);
        reverse: boolean//= Cesium.defaultValue(options.reverse, false);

        static createGeometry: (arrowGeometry: ArrowGeometry) => Cesium.Geometry
    }

    /**
    *
    *@param {Cesium.Cartesian3}axis - type:Cesium.Cartesian3 旋转轴
    *@param {Number}angle 旋转角度
    *
    *@property {Cesium.Cartesian3}axis 旋转轴
    *@property {Number}angle 旋转角度
    *@property {Cesium.Event}paramChanged  
    *@constructor
    *@memberof Cesium
    */
    export class Rotation {
        /**
        *
        *@param {Cesium.Cartesian3}axis - type:Cesium.Cartesian3 旋转轴
        *@param {Number}angle 旋转角度
        *
        *@property {Cesium.Cartesian3}axis 旋转轴
        *@property {Number}angle 旋转角度
        *@property {Cesium.Event}paramChanged  
        *@constructor
        *@memberof Cesium
        */
        constructor(axis: Cesium.Cartesian3, angle: number)
        /**
         * @type {Cesium.Cartesian3}
         */
        axis: Cesium.Cartesian3
        angle: number
    }

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
    export class MeshMaterial {

        constructor(options: {
            vertexShader: string
            fragmentShader: string
            pickColorQualifier: string
            uniforms: object
            uniformStateUsed: object
            translucent: boolean
            wireframe: boolean
            /**
             * FRONT: 3,
             * BACK: 1,
             * DOUBLE: 2
             */
            side: number
            /**
             * @type {Cesium.Color|string}
             */
            defaultColor: Cesium.Color | string
            depthTest: boolean
            depthMask: boolean
            blending: boolean
            allowPick: boolean
        })

        uuid: string
        vertexShader: string
        fragmentShader: string
        pickColorQualifier: string
        uniforms: object
        uniformStateUsed: object
        translucent: boolean
        wireframe: boolean
        /**
         * FRONT: 3,
         * BACK: 1,
         * DOUBLE: 2
         */
        side: number
        /**
         * @type {Cesium.Color|string}
         */
        defaultColor: Cesium.Color | string
        depthTest: boolean
        depthMask: boolean
        blending: boolean
        allowPick: boolean
    }

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
    export class Mesh {

        constructor(options: {
            /**
             * @type {Cesium.Geometry|Cesium.CSG|THREE.Geometry|THREE.BufferGeometry}
             */
            geometry: Cesium.Geometry | Cesium.CSG | THREE.Geometry | THREE.BufferGeometry
            material: MeshMaterial
            show?: boolean
            position?: Cesium.Cartesian3
            rotation?: Rotation
            scale?: Cesium.Cartesian3
            instances?: { modelMatrix: Cesium.Matrix4, show: boolean }[]
            instancedAttributes?: { name: string, default: number | Cesium.Cartesian2 | Cesium.Cartesian3 | Cesium.Cartesian4 | Cesium.Color }[]

        })
        constructor(
            /**
             * @type {Cesium.Geometry|Cesium.CSG|THREE.Geometry|THREE.BufferGeometry}
             */
            geometry: Cesium.Geometry | Cesium.CSG | THREE.Geometry | THREE.BufferGeometry,
            material: MeshMaterial,
            instances?: { modelMatrix: Cesium.Matrix4, show: boolean }[],
            instancedAttributes?: { name: string, default: number | Cesium.Cartesian2 | Cesium.Cartesian3 | Cesium.Cartesian4 | Cesium.Color }[]

        )
        geometry: Cesium.Geometry | Cesium.CSG | THREE.Geometry | THREE.BufferGeometry
        material: MeshMaterial
        show: boolean
        position: Cesium.Cartesian3
        rotation: Rotation
        scale: Cesium.Cartesian3
        instances: { modelMatrix: Cesium.Matrix4, show: boolean }[]
        instancedAttributes: { name: string, default: number | Cesium.Cartesian2 | Cesium.Cartesian3 | Cesium.Cartesian4 | Cesium.Color }[]
        needsUpdate: boolean
        modelMatrix: Cesium.Matrix4
        parent: object
        modelMatrixNeedsUpdate: boolean

        /**
         * 
         * @param {object}instance
         * @param {Cesium.Matrix4}instance.modelMatrix
         * @param {boolean}[instance.show=true]
         */
        addInstance: (instance: { modelMatrix: Cesium.Matrix4, show: boolean }) => object

        /**
        *
        *@param {Cesium.Mesh|Cesium.LOD}node
        *@param {(node: Cesium.Mesh | Cesium.LOD) => void}callback
        */
        static traverse: (node: Mesh | LOD, callback: (node: Cesium.Mesh | Cesium.LOD) => void) => void
    }


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
    class LOD {
        constructor(options?: {
            show?: boolean
            position?: Cesium.Cartesian3
            rotation?: Cesium.Rotation
            scale?: Cesium.Cartesian3
        })
        show: boolean
        position: Cesium.Cartesian3
        rotation: Cesium.Rotation
        scale: Cesium.Cartesian3
        needsUpdate: boolean
        modelMatrix: Cesium.Matrix4
        parent: Mesh | LOD | MeshVisualizer
        children: (Mesh | LOD)

        /**
         *
         *@param {Number}x
         *@param {Number}y
         *@param {Number}z
         */
        setPosition: (x: number, y: number, z: number) => void
        /**
         *
         *@param {Number}x
         *@param {Number}y
         *@param {Number}z
         */
        setScale: (x: number, y: number, z: number) => void

        /**
        *@param {Cesium.Mesh}mesh
        *@param {Number}distance
        */
        addLevel: (object: Mesh | LOD, distance: number) => void
        update: (
            /**
             * @type {Cesium.Matrix4}
             */
            parentModelMatrix: Cesium.Matrix4, frameState: Cesium.FrameState) => void

        getObjectForDistance: (distance: number) => Mesh | LOD
    }

    /**
    *帧缓存纹理类，可以将一个mesh渲染到帧缓存并作为纹理提供给其他mesh。<br/>
    *需要配合{@link Cesium.MeshVisualizer}、{@link Cesium.Mesh}、{@link Cesium.MeshMaterial}使用。
    *@param {Cesium.Mesh}mesh 
    *
    *@property {Cesium.Mesh}mesh 
    *@property {Cesium.Texture}texture 
    *@property {Cesium.Texture}[depthTexture] 
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
    export class FramebufferTexture {
        /**
         * 
         * @param mesh 
         * @param renderTarget - Cesium.Texture
         */
        constructor(mesh: Mesh, renderTarget: Cesium.Texture, depthTexture: Cesium.Texture)
        mesh: Mesh
        /**
         * @type {Cesium.Texture}
         */
        texture: Cesium.Texture
        depthTexture: Cesium.Texture
        framebuffer: Cesium.Framebuffer
        ready: boolean
        readyPromise: Promise<FramebufferTexture>
        destroy:()=>void
    }


    export class RendererUtils {
        /**
        *使用帧缓冲技术，执行渲染命令，渲染到纹理  
        *@param {Cesium.DrawCommand|Array<Cesium.DrawCommand>}drawCommand - type:Cesium.DrawCommand|Array<Cesium.DrawCommand> 渲染命令（集合）
        *@param {Cesium.FrameState}frameState - type:Cesium.FrameState 帧状态对象，可以从Cesium.Scene中获取
        *@param {Cesium.Texture|Cesium.Framebuffer}outpuTexture - type:Cesium.Texture 将渲染到的目标纹理对象
        *@param {Cesium.Texture}[outputDepthTexture] - type:Cesium.Texture 可选，输出的深度纹理
        */
        static renderToTexture: (
            drawCommand: Cesium.DrawCommand | Cesium.DrawCommand[],
            frameState: Cesium.FrameState,
            outputTexture: Cesium.Texture|Cesium.Framebuffer,
            outputDepthTexture?: Cesium.Texture
        ) => void


        /**
        *使用帧缓冲技术，执行渲染命令，渲染到纹理并读取像素值，可以用于实现并行计算  
        *@param {Cesium.DrawCommand|Array<Cesium.DrawCommand>}drawCommand 渲染命令（集合）
        *@param {Cesium.FrameState}frameState 帧状态对象，可以从Cesium.Scene中获取
        *@param {Cesium.Texture}outpuTexture 将渲染到的目标纹理对象
        *@param {Object}[options] 
        *@param {Array.<Number>}outputPixels 
        *@return {Array.<Number>}outputPixels  输出的像素
        */
        static renderToPixels: (
            drawCommand: Cesium.DrawCommand | Array<Cesium.DrawCommand>,
            frameState: Cesium.FrameState,
            outputTexture: Cesium.Texture,
            options: {
                x: number
                y: number
                width: number
                height: number
                /**
                 * @type {Cesium.PixelDatatype}
                 */
                pixelDatatype: Cesium.PixelDatatype
                /**
                 * @type {Cesium.PixelFormat}
                 */
                pixelFormat: Cesium.PixelFormat
                /**
                 * @type {Cesium.Framebuffer}
                 */
                framebuffer?: Cesium.Framebuffer
            }, pixels: Array<Number> | TypedArray) => void


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
        static readPixels: (
            /**
             * @type {Cesium.FrameState}
             */
            frameState: Cesium.FrameState, readState: {
                x: number
                y: number
                width: number
                height: number
                /**
                 * @type {Cesium.PixelDatatype}
                 */
                pixelDatatype: Cesium.PixelDatatype
                /**
                 * @type {Cesium.PixelFormat}
                 */
                pixelFormat: Cesium.PixelFormat
                /**
                 * @type {Cesium.Framebuffer}
                 */
                framebuffer?: Cesium.Framebuffer
            }, pixels: number[] | ArrayBufferView) => void


        /**
        *
        *@param {Cesium.Matrix4}srcMatrix
        *@param {Cesium.Matrix4}dstMatrix
        *@return {Cesium.Matrix4}
        */
        static yUp2Zup: (srcMatrix: Cesium.Matrix4, dstMatrix: Cesium.Matrix4) => Cesium.Matrix4


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
        static computeModelMatrix: (srcModelMatrix: Cesium.Matrix4, translation: Cesium.Cartesian3, rotation: {
            axis: Cesium.Cartesian3,
            angle: number
        }, scale: Cesium.Cartesian3, outModelMatrix: Cesium.Matrix4) => Cesium.Matrix4

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
    export class MeshVisualizer {
        constructor(options: {
            modelMatrix?: Cesium.Matrix4
            up?: Cesium.Cartesian3
            position?: Cesium.Cartesian3
            scale?: Cesium.Cartesian3
            rotation?: Rotation
            show?: boolean
            showReference?: boolean
            referenceAxisParameter?: ArrowGeometry
        })

        /**
         * @type {Cesium.Event}
         */
        beforeUpdate: Cesium.Event
        children: (Mesh | LOD)[]

        /**
        *
        *@param {Cesium.Mesh}mesh
        */
        add: (mesh: Mesh) => void

        /**
        *@param {Cesium.Mesh}mesh
        */
        remove: (mesh: Mesh) => void
        /**
        *
        *拾取点，用局部坐标系表达。内部使用Cesium.Scene.pickPosition和MeshVisualizer.worldCoordinatesToLocal实现。
        *@param {Cesium.Cartesian2}windowPosition
        *@param {Cesium.Cartesian3}[result]
        *@return {Cesium.Cartesian3}
        */
        pickPosition: (windowPosition: Cesium.Cartesian2, result?: Cesium.Cartesian3) => Cesium.Cartesian3
        /**
        *
        *创建一条射线，用局部坐标系表达
        *@param {Cesium.Cartesian2}windowPosition
        *@param {Cesium.Ray}[result]
        *@return {Cesium.Ray}
        */
        getPickRay: (windowPosition: Cesium.Cartesian2, result?: Cesium.Ray) => Cesium.Ray
        /**
        *世界坐标到局部坐标
        *@param {Cesium.Cartesian3}worldCoordinates
        *@param {Cesium.Cartesian3}[result]
        *@return {Cesium.Cartesian3}
        */
        worldCoordinatesToLocal: (worldCoordinates: Cesium.Cartesian3, result?: Cesium.Cartesian3) => Cesium.Cartesian3
        /**
       *局部坐标到世界坐标
       *@param {Cesium.Cartesian3}localCoordinates
       *@param {Cesium.Cartesian3}[result]
       *@return {Cesium.Cartesian3}
       */
        localToWorldCoordinates: (localCoordinates: Cesium.Cartesian3, result?: Cesium.Cartesian3) => Cesium.Cartesian3
        /**
         *
         *@param {Number}x
         *@param {Number}y
         *@param {Number}z
         */
        setPosition: (x: number, y: number, z: number) => void
        /**
         *
         *@param {Number}x
         *@param {Number}y
         *@param {Number}z
         */
        setScale: (x: number, y: number, z: number) => void
        createBoundingSphere: (mesh: Mesh) => void
        /**
        * 
        *@param {Cesium.Mesh} mesh
        *@param {Cesium.FrameState} frameState
        *@return {Cesium.DrawCommand} 
        *@private
        */
        createDrawCommand: (mesh: Mesh, frameState: Cesium.FrameState) => Cesium.DrawCommand

        /**
        *
        *
        *@param {THREE.Material}material 
        *@return {Cesium.RenderState}frameState
        *@private
        */
        getRenderState: (material: MeshMaterial) => object

        /**
        *
        *
        *@param {THREE.Material}material 
        *@param {Cesium.FrameState}frameState
        *@private
        */
        getUniformMap: (material: MeshMaterial, frameState: Cesium.FrameState) => object
        /**
        *
        *@param {Cesium.Geometry} geometry
        *@param {Cesium.Material} material
        *@return {String}
        *@private  
        */
        getVertexShaderSource: (mesh: Mesh, material: MeshMaterial) => string
        /**
         * 
         *@param {Cesium.Material} material
         *@return {String} 
         *@private
         */
        getFragmentShaderSource: (material: MeshMaterial) => string

        /**
        *
        *@param {Cesium.FrameState}frameState
        */
        update: (frameState: Cesium.FrameState) => void


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
        getPixels: (frameState: Cesium.FrameState, frameBufferTexture: FramebufferTexture, viewport: {
            x: number
            y: number
            width: number
            height: number
            pixelDatatype: Cesium.PixelDatatype
        }, readState: {
            x: number
            y: number
            width: number
            height: number
            pixelDatatype: Cesium.PixelDatatype
        }, outputPixels: number[] | ArrayBufferView) => number[] | ArrayBufferView


        /**
        *
        */
        destroy: () => void


        /**
        *
        *遍历节点
        *@param {Cesium.MeshVisualizer|Cesium.Mesh}root
        *@param {Cesium.MeshVisualizer~TraverseCallback}traverseFunc 访问每个节点时回调该函数，进行相关操作。回调函数包含一个参数，traverseArgs，其中封装了一个属性cancelCurrent，可以通过改变此属性达到终止遍历当前节点的子节点
        *@param {Boolean}visibleOnly visibleOnly为true时仅遍历可见的节点，如果父级节点不可见则不再访问其子节点
        */
        static traverse: (node: MeshVisualizer | Mesh | LOD, traverseFunc: (
            node: Mesh | LOD | MeshVisualizer,
            traverseArgs: {
                /**
                 * 为true时终止遍历当前节点的子节点
                 */
                cancelCurrent: boolean
                /**
                 * 为true时终止遍历，退出遍历循环
                 */
                cancelAll: boolean
            }) => void, visibleOnly: boolean) => void

    }

}