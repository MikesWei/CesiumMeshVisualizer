

MeshVisualizer = Cesium.MeshVisualizer;
Mesh = Cesium.Mesh;
MeshMaterial = Cesium.MeshMaterial;
FramebufferTexture = Cesium.FramebufferTexture;
GeometryUtils = Cesium.GeometryUtils;
MeshPhongMaterial = Cesium.MeshPhongMaterial;
PlaneBufferGeometry = Cesium.PlaneBufferGeometry;
LOD = Cesium.LOD;

homePosition[2] = 100;
init();

var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 10);
var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

var meshVisualizer = new MeshVisualizer({
    modelMatrix: modelMatrix,
    up: { y: 1 },
    referenceAxisParameter: {
        length: 100,
        width: 0.05,
        headLength: 2,
        headWidth: 0.1
    }
});
viewer.scene.primitives.add(meshVisualizer);
meshVisualizer.showReference = true;//显示坐标轴


function createRandomColor() {
    return Cesium.Color.fromRandom({ alpha: 1 })//fromRgba(Math.floor(Math.random() * (1 << 24)));
}
function createMaterial() {
    return new MeshPhongMaterial({
        defaultColor: createRandomColor(),
        side: MeshMaterial.Sides.DOUBLE,
        translucent: false
    });
}

Cesium.Cartesian3.prototype.set = function (x, y, z) {
    this.x = x; this.y = y; this.z = z;
}
Cesium.Quaternion.prototype.set = function (x, y, z, w) {
    this.x = x; this.y = y; this.z = z; this.w = w;
}

Ammo().then(function () {


    // - Global variables -

    // Heightfield parameters
    var terrainWidthExtents = 100;
    var terrainDepthExtents = 100;
    var terrainWidth = 128;
    var terrainDepth = 128;
    var terrainHalfWidth = terrainWidth / 2;
    var terrainHalfDepth = terrainDepth / 2;
    var terrainMaxHeight = 8;
    var terrainMinHeight = -2;

    // Graphics variables 
    var terrainMesh, texture;

    // Physics variables
    var collisionConfiguration;
    var dispatcher;
    var broadphase;
    var solver;
    var physicsWorld;
    var terrainBody;
    var dynamicObjects = [];
    var transformAux1 = new Ammo.btTransform();

    var heightData = null;
    var ammoHeightData = null;

    var time = 0;
    var objectTimePeriod = 3;
    var timeNextSpawn = time + objectTimePeriod;
    var maxNumObjects = 30;


    function initGraphics() {
        var geometry = PlaneBufferGeometry.createGeometry(new PlaneBufferGeometry(100, 100, terrainWidth - 1, terrainDepth - 1));
        //geometry.rotateX(-Math.PI / 2);
       
        GeometryUtils.rotateX(geometry, -Math.PI / 2);
        var vertices = geometry.attributes.position.values;

        for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {

            // j + 1 because it is the y component that we modify
            vertices[j + 1] = heightData[i];

        }

        
        // geometry.computeVertexNormals();
        GeometryUtils.computeVertexNormals(geometry);
        var groundMaterial = new MeshPhongMaterial({
            defaultColor:"rgb(125,125,125)",
            side: MeshMaterial.Sides.DOUBLE,
            translucent: false
        });// new THREE.MeshPhongMaterial({ color: 0xC7C7C7 });
        terrainMesh = new Mesh(geometry, groundMaterial);
        //terrainMesh.rotation.axis.x = 1;
        //terrainMesh.rotation.axis.z =0;
        //terrainMesh.rotation.angle = -90;
        meshVisualizer.add(terrainMesh);



    }


    function initPhysics() {

        // Physics configuration

        collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        broadphase = new Ammo.btDbvtBroadphase();
        solver = new Ammo.btSequentialImpulseConstraintSolver();
        physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
        physicsWorld.setGravity(new Ammo.btVector3(0, -6, 0));

        // Create the terrain body

        groundShape = createTerrainShape(heightData);
        var groundTransform = new Ammo.btTransform();
        groundTransform.setIdentity();
        // Shifts the terrain, since bullet re-centers it on its bounding box.
        groundTransform.setOrigin(new Ammo.btVector3(0, (terrainMaxHeight + terrainMinHeight) / 2, 0));
        var groundMass = 0;
        var groundLocalInertia = new Ammo.btVector3(0, 0, 0);
        var groundMotionState = new Ammo.btDefaultMotionState(groundTransform);
        var groundBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, groundShape, groundLocalInertia));
        physicsWorld.addRigidBody(groundBody);

    }

    function generateHeight(width, depth, minHeight, maxHeight) {

        // Generates the height data (a sinus wave)

        var size = width * depth;
        var data = new Float32Array(size);

        var hRange = maxHeight - minHeight;
        var w2 = width / 2;
        var d2 = depth / 2;
        var phaseMult = 12;

        var p = 0;
        for (var j = 0; j < depth; j++) {
            for (var i = 0; i < width; i++) {

                var radius = Math.sqrt(
                    Math.pow((i - w2) / w2, 2.0) +
                    Math.pow((j - d2) / d2, 2.0));

                var height = (Math.sin(radius * phaseMult) + 1) * 0.5 * hRange + minHeight;

                data[p] = height;

                p++;
            }
        }

        return data;

    }

    function createTerrainShape() {

        // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
        var heightScale = 1;

        // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
        var upAxis = 1;

        // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
        var hdt = "PHY_FLOAT";

        // Set this to your needs (inverts the triangles)
        var flipQuadEdges = false;

        // Creates height data buffer in Ammo heap
        ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth);

        // Copy the javascript height data array to the Ammo one.
        var p = 0;
        var p2 = 0;
        for (var j = 0; j < terrainDepth; j++) {
            for (var i = 0; i < terrainWidth; i++) {

                // write 32-bit float data to memory
                Ammo.HEAPF32[ammoHeightData + p2 >> 2] = heightData[p];

                p++;

                // 4 bytes/float
                p2 += 4;
            }
        }

        // Creates the heightfield physics shape
        var heightFieldShape = new Ammo.btHeightfieldTerrainShape(

            terrainWidth,
            terrainDepth,

            ammoHeightData,

            heightScale,
            terrainMinHeight,
            terrainMaxHeight,

            upAxis,
            hdt,
            flipQuadEdges
        );

        // Set horizontal scale
        var scaleX = terrainWidthExtents / (terrainWidth - 1);
        var scaleZ = terrainDepthExtents / (terrainDepth - 1);
        heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ));

        heightFieldShape.setMargin(0.05);

        return heightFieldShape;

    }

    function generateObject() {

        var numTypes = 4;
        var objectType = Math.ceil(Math.random() * numTypes);

        var threeObject = null;
        var shape = null;

        var objectSize = 3;
        var margin = 0.05;
        try {
            switch (objectType) {
                case 1:
                    // Sphere
                    var radius = 1 + Math.random() * objectSize;
                    threeObject = new Mesh(new Cesium.SphereGeometry({
                        radius: radius,
                        stackPartitions: 20,
                        slicePartitions: 20,
                        vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
                    }), createObjectMaterial());
                    shape = new Ammo.btSphereShape(radius);
                    shape.setMargin(margin);
                    break;
                case 2:
                    // Box
                    var sx = 1 + Math.random() * objectSize;
                    var sy = 1 + Math.random() * objectSize;
                    var sz = 1 + Math.random() * objectSize;
                    threeObject = new Mesh(Cesium.BoxGeometry.fromDimensions({
                        vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL,
                        dimensions: new Cesium.Cartesian3(sx, sy, sz)
                    }), createObjectMaterial());
                    shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
                    shape.setMargin(margin);
                    break;
                case 3:
                    // Cylinder
                    var radius = 1 + Math.random() * objectSize;
                    var height = 1 + Math.random() * objectSize;
                    threeObject = new Mesh(new Cesium.CylinderGeometry({
                        length: height,
                        topRadius: radius,
                        bottomRadius: radius,
                        slices: 20,
                        vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
                    }), createObjectMaterial());
                    shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, height * 0.5, radius));
                    shape.setMargin(margin);
                    break;
                default:
                    // Cone
                    var radius = 1 + Math.random() * objectSize;
                    var height = 2 + Math.random() * objectSize;
                    threeObject = new Mesh(new Cesium.CylinderGeometry({
                        length: height,
                        topRadius: 0,
                        bottomRadius: radius,
                        slices: 20,
                        vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
                    }), createObjectMaterial());
                    shape = new Ammo.btConeShape(radius, height);
                    break;
            }
        } catch (e) {
            console.log(e);
            return;
        }


        threeObject.position.set((Math.random() - 0.5) * terrainWidth * 0.6, terrainMaxHeight + objectSize + 2, (Math.random() - 0.5) * terrainDepth * 0.6);

        var mass = objectSize * 5;
        var localInertia = new Ammo.btVector3(0, 0, 0);
        shape.calculateLocalInertia(mass, localInertia);
        var transform = new Ammo.btTransform();
        transform.setIdentity();
        var pos = threeObject.position;
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        var motionState = new Ammo.btDefaultMotionState(transform);
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);

        threeObject.physicsBody = body;

        meshVisualizer.add(threeObject);
        dynamicObjects.push(threeObject);

        physicsWorld.addRigidBody(body);



    }

    function createObjectMaterial() {

        return createMaterial();
        //var c = Math.floor(Math.random() * (1 << 24));
        //return new THREE.MeshPhongMaterial({ color: c });
    }

    function updatePhysics(deltaTime) {
        if (dynamicObjects.length < maxNumObjects && time > timeNextSpawn) {
            generateObject();
            timeNextSpawn = time + objectTimePeriod;
        }
        time += deltaTime;

        physicsWorld.stepSimulation(deltaTime, 10);

        // Update objects
        for (var i = 0, il = dynamicObjects.length; i < il; i++) {
            var objThree = dynamicObjects[i];
            var objPhys = objThree.physicsBody;
            var ms = objPhys.getMotionState();
            if (ms) {

                ms.getWorldTransform(transformAux1);
                var p = transformAux1.getOrigin();
                var q = transformAux1.getRotation();
                objThree.position.set(p.x(), p.y(), p.z());
                if (!objThree.quaternion) {
                    objThree.quaternion = new Cesium.Quaternion();
                }
                objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
                objThree.modelMatrixNeedsUpdate = true;
            }
        }
    }

    var start = false;
    var init = false;
    var startTime = new Date();
    function update(frameState) {
        var deltaTime = (new Date() - startTime) / 1000.0;
        updatePhysics(deltaTime);
        startTime = new Date();
    }
    setTimeout(function () {
        if (!init) {
            // - Init -
            heightData = generateHeight(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight);

            initGraphics();

            initPhysics();

            init = true;
        }
        if (!start) {
            meshVisualizer.beforeUpdate.addEventListener(update);
            start = true;
        } else {
            meshVisualizer.beforeUpdate.removeEventListener(update);
            start = false;

        }
    }, 1000 * 3);
});
