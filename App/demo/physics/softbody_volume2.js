

MeshVisualizer = Cesium.MeshVisualizer;
Mesh = Cesium.Mesh;
MeshMaterial = Cesium.MeshMaterial;
FramebufferTexture = Cesium.FramebufferTexture;
GeometryUtils = Cesium.GeometryUtils;
MeshPhongMaterial = Cesium.MeshPhongMaterial;
BasicMeshMaterial = Cesium.BasicMeshMaterial;
BasicGeometry = Cesium.BasicGeometry;

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

Ammo().then(function () {
    // - Global variables -

    // Graphics variables 
    var clickRequest = false;
    var mouseCoords = new Cesium.Cartesian2();
    var ballMaterial = createMaterial();
    var pos = new Cesium.Cartesian3();
    var quat = new Cesium.Quaternion();

    // Physics variables
    var gravityConstant = -9.8;
    var collisionConfiguration;
    var dispatcher;
    var broadphase;
    var solver;
    var physicsWorld;
    var rigidBodies = [];
    var softBodies = [];
    var margin = 0.05;
    var transformAux1 = new Ammo.btTransform();
    var softBodyHelpers = new Ammo.btSoftBodyHelpers();


    function initPhysics() {

        // Physics configuration

        collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        broadphase = new Ammo.btDbvtBroadphase();
        solver = new Ammo.btSequentialImpulseConstraintSolver();
        softBodySolver = new Ammo.btDefaultSoftBodySolver();
        physicsWorld = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
        physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
        physicsWorld.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, gravityConstant, 0));

    }

    function createObjects() {

        // Ground
        pos.set(0, -0.5, 0);
        quat.set(0, 0, 0, 1);
        var ground = createParalellepiped(40, 1, 40, 0, pos, quat, new MeshPhongMaterial({
            defaultColor: Cesium.Color.fromRgba(0xFFFFFF).withAlpha(1),//"rgb(200,200,200)",
            side: MeshMaterial.Sides.DOUBLE,
            translucent: false
        }));


        // Create soft volumes
        var volumeMass = 15;

        var bx = 2;
        var by = 1;
        var bz = 3;
        var nn = 5;
        createSoftBox(bx, by, bz, nn * bx, nn * by, nn * bz, 0, 5, 0, volumeMass, 0);


        // Some obstacle
        pos.set(0, 0.5, 0);
        quat.set(0, 0, 0, 1);
        var obstacle = createParalellepiped(6, 1, 1, 0, pos, quat, new MeshPhongMaterial({
            defaultColor: Cesium.Color.fromRgba(0x202020).withAlpha(1),//"rgb(56,56,56)",
            side: MeshMaterial.Sides.DOUBLE,
            translucent: false
        }));
    }

    function createSoftBox(sizeX, sizeY, sizeZ, numPointsX, numPointsY, numPointsZ, tX, tY, tZ, mass, pressure) {

        if (numPointsX < 2 || numPointsY < 2 || numPointsZ < 2) {
            return;
        }

        // Offset is the numbers assigned to 8 vertices of the cube in ascending Z, Y, X in this order.
        // indexFromOffset is the vertex index increase for a given offset.
        var indexFromOffset = [];
        for (var offset = 0; offset < 8; offset++) {
            var a = offset & 1 ? 1 : 0;
            var b = offset & 2 ? 1 : 0;
            var c = offset & 4 ? 1 : 0;
            var index = a + b * numPointsX + c * numPointsX * numPointsY;
            indexFromOffset[offset] = index;
        }

        // Construct BufferGeometry

        var numVertices = numPointsX * numPointsY * numPointsZ;
        var numFaces = 4 * ((numPointsX - 1) * (numPointsY - 1) + (numPointsX - 1) * (numPointsZ - 1) + (numPointsY - 1) * (numPointsZ - 1));

        var vertices = new Float32Array(numVertices * 3);
        var normals = new Float32Array(numVertices * 3);
        var indices = new (numFaces * 3 > 65535 ? Uint32Array : Uint16Array)(numFaces * 3);

        // Create vertices and faces
        var sx = sizeX / (numPointsX - 1);
        var sy = sizeY / (numPointsY - 1);
        var sz = sizeZ / (numPointsZ - 1);
        var numFacesAdded = 0;
        for (var p = 0, k = 0; k < numPointsZ; k++) {
            for (var j = 0; j < numPointsY; j++) {
                for (var i = 0; i < numPointsX; i++) {

                    // Vertex and normal
                    var p3 = p * 3;
                    vertices[p3] = i * sx - sizeX * 0.5;
                    normals[p3++] = 0;
                    vertices[p3] = j * sy - sizeY * 0.5;
                    normals[p3++] = 0;
                    vertices[p3] = k * sz - sizeZ * 0.5;
                    normals[p3] = 0;

                    // XY faces
                    if (k == 0 && i < numPointsX - 1 && j < numPointsY - 1) {

                        var faceIndex = numFacesAdded * 3;

                        indices[faceIndex++] = p + indexFromOffset[0];
                        indices[faceIndex++] = p + indexFromOffset[3];
                        indices[faceIndex++] = p + indexFromOffset[1];

                        indices[faceIndex++] = p + indexFromOffset[0];
                        indices[faceIndex++] = p + indexFromOffset[2];
                        indices[faceIndex++] = p + indexFromOffset[3];

                        numFacesAdded += 2;
                    }
                    if (k == numPointsZ - 2 && i < numPointsX - 1 && j < numPointsY - 1) {

                        var faceIndex = numFacesAdded * 3;

                        indices[faceIndex++] = p + indexFromOffset[7];
                        indices[faceIndex++] = p + indexFromOffset[6];
                        indices[faceIndex++] = p + indexFromOffset[5];

                        indices[faceIndex++] = p + indexFromOffset[5];
                        indices[faceIndex++] = p + indexFromOffset[6];
                        indices[faceIndex++] = p + indexFromOffset[4];

                        numFacesAdded += 2;
                    }

                    // XZ faces
                    if (j == 0 && i < numPointsX - 1 && k < numPointsZ - 1) {

                        var faceIndex = numFacesAdded * 3;

                        indices[faceIndex++] = p + indexFromOffset[0];
                        indices[faceIndex++] = p + indexFromOffset[5];
                        indices[faceIndex++] = p + indexFromOffset[4];

                        indices[faceIndex++] = p + indexFromOffset[0];
                        indices[faceIndex++] = p + indexFromOffset[1];
                        indices[faceIndex++] = p + indexFromOffset[5];

                        numFacesAdded += 2;
                    }
                    if (j == numPointsY - 2 && i < numPointsX - 1 && k < numPointsZ - 1) {

                        var faceIndex = numFacesAdded * 3;

                        indices[faceIndex++] = p + indexFromOffset[3];
                        indices[faceIndex++] = p + indexFromOffset[2];
                        indices[faceIndex++] = p + indexFromOffset[6];

                        indices[faceIndex++] = p + indexFromOffset[3];
                        indices[faceIndex++] = p + indexFromOffset[6];
                        indices[faceIndex++] = p + indexFromOffset[7];

                        numFacesAdded += 2;
                    }

                    // YZ faces
                    if (i == 0 && j < numPointsY - 1 && k < numPointsZ - 1) {

                        var faceIndex = numFacesAdded * 3;

                        indices[faceIndex++] = p + indexFromOffset[0];
                        indices[faceIndex++] = p + indexFromOffset[6];
                        indices[faceIndex++] = p + indexFromOffset[2];

                        indices[faceIndex++] = p + indexFromOffset[0];
                        indices[faceIndex++] = p + indexFromOffset[4];
                        indices[faceIndex++] = p + indexFromOffset[6];

                        numFacesAdded += 2;
                    }
                    if (i == numPointsX - 2 && j < numPointsY - 1 && k < numPointsZ - 1) {

                        var faceIndex = numFacesAdded * 3;

                        indices[faceIndex++] = p + indexFromOffset[1];
                        indices[faceIndex++] = p + indexFromOffset[3];
                        indices[faceIndex++] = p + indexFromOffset[5];

                        indices[faceIndex++] = p + indexFromOffset[3];
                        indices[faceIndex++] = p + indexFromOffset[7];
                        indices[faceIndex++] = p + indexFromOffset[5];

                        numFacesAdded += 2;
                    }

                    p++;
                }
            }
        }


        var bufferGeom = BasicGeometry.createGeometry({
            normals: normals,
            positions: vertices,
            indices: indices
        });
        GeometryUtils.translate(bufferGeom, { x: tX, y: tY, z: tZ })

        // Create mesh from geometry
        var volume = new Mesh(bufferGeom, createMaterial());
        volume.material.wireframe = true;

        meshVisualizer.add(volume);

        // Create soft body
        var vectorTemp = new Ammo.btVector3(0, 0, 0);
        vectorTemp.setValue(vertices[0], vertices[1], vertices[2]);

        var volumeSoftBody = new Ammo.btSoftBody(physicsWorld.getWorldInfo(), 1, vectorTemp, [1.0]);

        var physMat0 = volumeSoftBody.get_m_materials().at(0);

        for (var i = 1, il = vertices.length / 3; i < il; i++) {
            var i3 = i * 3;
            vectorTemp.setValue(vertices[i3], vertices[i3 + 1], vertices[i3 + 2]);
            volumeSoftBody.appendNode(vectorTemp, 1.0);
        }

        for (var i = 0, il = indices.length / 3; i < il; i++) {
            var i3 = i * 3;
            volumeSoftBody.appendFace(indices[i3], indices[i3 + 1], indices[i3 + 2]);
        }

        // Create tetrahedrons
        var p = 0;

        function newTetra(i0, i1, i2, i3, i4) {

            var v0 = p + indexFromOffset[i0];
            var v1 = p + indexFromOffset[i1];
            var v2 = p + indexFromOffset[i2];
            var v3 = p + indexFromOffset[i3];
            var v4 = p + indexFromOffset[i4];

            volumeSoftBody.appendTetra(v0, v1, v2, v3, v4);

            volumeSoftBody.appendLink(v0, v1, physMat0, true);
            volumeSoftBody.appendLink(v0, v2, physMat0, true);
            volumeSoftBody.appendLink(v0, v3, physMat0, true);
            volumeSoftBody.appendLink(v1, v2, physMat0, true);
            volumeSoftBody.appendLink(v2, v3, physMat0, true);
            volumeSoftBody.appendLink(v3, v1, physMat0, true);

        }

        for (var k = 0; k < numPointsZ; k++) {
            for (var j = 0; j < numPointsY; j++) {
                for (var i = 0; i < numPointsX; i++) {

                    if (i < numPointsX - 1 && j < numPointsY - 1 && k < numPointsZ - 1) {

                        // Creates 5 tetrahedrons for each cube
                        newTetra(0, 4, 5, 6);
                        newTetra(0, 2, 3, 6);
                        newTetra(0, 1, 3, 5);
                        newTetra(3, 5, 6, 7);
                        newTetra(0, 3, 5, 6);
                        /*
                        volumeSoftBody.appendTetra( p + indexFromOffset[ 0 ], p + indexFromOffset[ 4 ], p + indexFromOffset[ 5 ], p + indexFromOffset[ 6 ] );
                        volumeSoftBody.appendTetra( p + indexFromOffset[ 0 ], p + indexFromOffset[ 2 ], p + indexFromOffset[ 3 ], p + indexFromOffset[ 6 ] );
                        volumeSoftBody.appendTetra( p + indexFromOffset[ 0 ], p + indexFromOffset[ 1 ], p + indexFromOffset[ 3 ], p + indexFromOffset[ 5 ] );
                        volumeSoftBody.appendTetra( p + indexFromOffset[ 3 ], p + indexFromOffset[ 5 ], p + indexFromOffset[ 6 ], p + indexFromOffset[ 7 ] );
                        volumeSoftBody.appendTetra( p + indexFromOffset[ 0 ], p + indexFromOffset[ 3 ], p + indexFromOffset[ 5 ], p + indexFromOffset[ 6 ] );
                        */
                    }

                    p++;
                }
            }
        }

        // Config soft body

        var sbConfig = volumeSoftBody.get_m_cfg();
        sbConfig.set_viterations(40);
        sbConfig.set_piterations(40);

        // Soft-soft and soft-rigid collisions
        sbConfig.set_collisions(0x11);

        // Friction
        sbConfig.set_kDF(0.1);
        // Damping
        sbConfig.set_kDP(0.01);
        // Pressure
        sbConfig.set_kPR(pressure);
        // Stiffness
        var stiffness = 0.05;
        physMat0.set_m_kLST(stiffness);
        physMat0.set_m_kAST(stiffness);
        physMat0.set_m_kVST(stiffness);

        volumeSoftBody.setTotalMass(mass, false)
        Ammo.castObject(volumeSoftBody, Ammo.btCollisionObject).getCollisionShape().setMargin(margin);
        physicsWorld.addSoftBody(volumeSoftBody, 1, -1);
        volume.physicsBody = volumeSoftBody;
        // Disable deactivation
        volumeSoftBody.setActivationState(4);

        softBodies.push(volume);

    }

    function createParalellepiped(sx, sy, sz, mass, pos, quat, material) {
        var box = Cesium.BoxGeometry.fromDimensions({
            dimensions: new Cesium.Cartesian3(sx, sy, sz),
            vertexFormat: new Cesium.VertexFormat({
                position: true,
                normal: true
            })
        });
        var threeObject = new Mesh(box, material);
        var shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
        shape.setMargin(margin);

        createRigidBody(threeObject, shape, mass, pos, quat);

        return threeObject;

    }

    function createRigidBody(threeObject, physicsShape, mass, pos, quat) {

        threeObject.position.copy(pos);
        if (!threeObject.quaternion) {
            threeObject.quaternion = new Cesium.Quaternion();
        }
        threeObject.quaternion.copy(quat);

        var transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        var motionState = new Ammo.btDefaultMotionState(transform);

        var localInertia = new Ammo.btVector3(0, 0, 0);
        physicsShape.calculateLocalInertia(mass, localInertia);

        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);

        threeObject.physicsBody = body;

        meshVisualizer.add(threeObject);

        if (mass > 0) {
            rigidBodies.push(threeObject);

            // Disable deactivation
            body.setActivationState(4);
        }

        physicsWorld.addRigidBody(body);

        return body;
    }

    function updatePhysics(deltaTime) {

        // Step world
        physicsWorld.stepSimulation(deltaTime, 10);

        // Update soft volumes
        for (var i = 0, il = softBodies.length; i < il; i++) {
            var volume = softBodies[i];
            var geometry = volume.geometry;
            var softBody = volume.physicsBody;
            var volumePositions = geometry.attributes.position.values;
            var volumeNormals = geometry.attributes.normal.values;
            var numVerts = volumePositions.length / 3;
            var nodes = softBody.get_m_nodes();
            var p = 0;
            for (var j = 0; j < numVerts; j++) {
                var node = nodes.at(j);
                var nodePos = node.get_m_x();
                var nodeNormal = node.get_m_n();

                volumePositions[p] = nodePos.x();
                volumeNormals[p++] = nodeNormal.x();
                volumePositions[p] = nodePos.y();
                volumeNormals[p++] = nodeNormal.y();
                volumePositions[p] = nodePos.z();
                volumeNormals[p++] = nodeNormal.z();

            }

            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.normal.needsUpdate = true;
            volume.modelMatrixNeedsUpdate = true;
        }

        // Update rigid bodies
        for (var i = 0, il = rigidBodies.length; i < il; i++) {
            var objThree = rigidBodies[i];
            var objPhys = objThree.physicsBody;
            var ms = objPhys.getMotionState();
            if (ms) {

                ms.getWorldTransform(transformAux1);
                var p = transformAux1.getOrigin();
                var q = transformAux1.getRotation();
                objThree.position.set(p.x(), p.y(), p.z());
                objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
                objThree.modelMatrixNeedsUpdate = true;
            }
        }

    }

    var ray = new Cesium.Ray();
    var start = false;
    var init = false;
    var startTime = new Date();
    var rayDir = new Cesium.Cartesian3();
    var maxDistance = 100;//发射点与射线和局部场景的交点的距离不能太远，过远会撕碎软体进而碎片过多时导致ammo物理引擎崩溃

    function initInput() {

        var scene = viewer.scene;
        var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        var lastMesh = null;
        handler.setInputAction(function (movement) {
            if (!clickRequest) {
                Cesium.Cartesian2.clone(movement.position, mouseCoords);
                clickRequest = true;
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    }

    function processClick() {

        if (clickRequest) {

            meshVisualizer.getPickRay(mouseCoords, ray);
            if (!ray) {
                clickRequest = false;
                return;
            }
            // Creates a ball
            var ballMass = 3;
            var ballRadius = 0.4;

            var ball = new Mesh(new Cesium.SphereGeometry({
                radius: ballRadius,
                stackPartitions: 18,
                slicePartitions: 16
            }), ballMaterial);

            var ballShape = new Ammo.btSphereShape(ballRadius);
            ballShape.setMargin(margin);

            Cesium.Cartesian3.clone(ray.direction, rayDir);
            Cesium.Cartesian3.subtract(ray.origin, ray.direction, pos);

            quat.set(0, 0, 0, 1);
            var ballBody = createRigidBody(ball, ballShape, ballMass, pos, quat);
            ballBody.setFriction(0.5);

            Cesium.Cartesian3.normalize(rayDir, rayDir);
            Cesium.Cartesian3.multiplyByScalar(rayDir, 30, rayDir);
            console.log(rayDir);
            ballBody.setLinearVelocity(new Ammo.btVector3(rayDir.x, rayDir.y, rayDir.z));

            clickRequest = false;

        }

    }
    function update(frameState) {
        var deltaTime = (new Date() - startTime) / 1000.0;
        updatePhysics(deltaTime);
        processClick();
        startTime = new Date();
    }
    setTimeout(function () {
        if (!init) {
            // - Init - 

            initPhysics();

            createObjects();

            initInput();

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
