
    MeshVisualizer = Cesium.MeshVisualizer;
    Mesh = Cesium.Mesh;
    MeshMaterial = Cesium.MeshMaterial;
    FramebufferTexture = Cesium.FramebufferTexture;
    GeometryUtils = Cesium.GeometryUtils;
    MeshPhongMaterial = Cesium.MeshPhongMaterial;
    LOD = Cesium.LOD;
    homePosition[2] = 100;
    init();

    var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 10);
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

    var meshVisualizer = new MeshVisualizer({
        modelMatrix: modelMatrix,
        up: { z: 1 },
        referenceAxisParameter: {
            length: 100,
            width: 0.05,
            headLength: 2,
            headWidth: 0.1
        }
    });
    viewer.scene.primitives.add(meshVisualizer);
    meshVisualizer.showReference = true;//显示坐标轴

    Ammo().then(function () {

        function createBoxMesh(dmX, dmY, dmZ, scale) {

            var dimensions = new Cesium.Cartesian3(dmX, dmY, dmZ);
            var boxGeometry = Cesium.BoxGeometry.fromDimensions({
                dimensions: dimensions,
                vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
            });
            var material = new MeshPhongMaterial({
                defaultColor: "rgb(125,125,125)"
            });

            var mesh = new Mesh(boxGeometry, material);
            if (scale) {
                mesh.scale.x = scale;
                mesh.scale.y = scale;
                mesh.scale.z = scale;
            }
            return mesh;
        }

        function createSphereMesh(r, scale) {
            //创建球体
            var sphere = new Cesium.SphereGeometry({
                radius: r,
                vertexFormat: Cesium.VertexFormat.POSITION_ONLY
            });
            var material = new MeshPhongMaterial({
                defaultColor: "rgb( 0," + 125 * (Math.random() + 0.5) + " ,0)"
            });
            var mesh = new Mesh(sphere, material);
            if (scale) {
                mesh.scale.x = scale;
                mesh.scale.y = scale;
                mesh.scale.z = scale;
            }
            return mesh;
        }
        var groundMesh = createBoxMesh(50 * 2, 50 * 2, 50 * 2, 1);
        groundMesh.position.z = -56;
        meshVisualizer.add(groundMesh);
        var sphereMesh = createSphereMesh(1, 1);
        sphereMesh.position.x = 2;
        sphereMesh.position.y = 0;
        sphereMesh.position.z = 20;
        meshVisualizer.add(sphereMesh);

        var timer = null;

        function simulate() {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }

            // Adapted from HelloWorld.cpp, Copyright (c) 2003-2007 Erwin Coumans  http://continuousphysics.com/Bullet/

            function main() {
                var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
                    dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
                    overlappingPairCache = new Ammo.btDbvtBroadphase(),
                    solver = new Ammo.btSequentialImpulseConstraintSolver(),
                    dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
                dynamicsWorld.setGravity(new Ammo.btVector3(0, 0, -10));

                var groundShape = new Ammo.btBoxShape(new Ammo.btVector3(50, 50, 50)),
                    bodies = [],
                    groundTransform = new Ammo.btTransform();


                groundTransform.setIdentity();
                groundTransform.setOrigin(new Ammo.btVector3(0, 0, -56));

                (function () {
                    var mass = 0,
                        isDynamic = (mass !== 0),
                        localInertia = new Ammo.btVector3(0, 0, 0);

                    if (isDynamic)
                        groundShape.calculateLocalInertia(mass, localInertia);

                    var myMotionState = new Ammo.btDefaultMotionState(groundTransform),
                        rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, groundShape, localInertia),
                        body = new Ammo.btRigidBody(rbInfo);
                  
                    dynamicsWorld.addRigidBody(body);
                    bodies.push(body);
                    groundMesh.physicsObj = body;
                    body.mesh = groundMesh;

                })();


                (function () {
                    var colShape = new Ammo.btSphereShape(1),
                        startTransform = new Ammo.btTransform();

                    startTransform.setIdentity();

                    var mass = 1,
                        isDynamic = (mass !== 0),
                        localInertia = new Ammo.btVector3(0, 0, 0);

                    if (isDynamic)
                        colShape.calculateLocalInertia(mass, localInertia);

                    startTransform.setOrigin(new Ammo.btVector3(2, 0, 20));

                    var myMotionState = new Ammo.btDefaultMotionState(startTransform),
                        rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, colShape, localInertia),
                        body = new Ammo.btRigidBody(rbInfo);

                    dynamicsWorld.addRigidBody(body);
                    bodies.push(body);
                    body.mesh = sphereMesh;
                    sphereMesh.physicsObj = body;
                })();

                var i = 0;
                var trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

                function continueSimulation() {
                    if (i == 135000) {

                        // Delete objects we created through |new|. We just do a few of them here, but you should do them all if you are not shutting down ammo.js
                        // we'll free the objects in reversed order as they were created via 'new' to avoid the 'dead' object links
                        Ammo.destroy(dynamicsWorld);
                        Ammo.destroy(solver);
                        Ammo.destroy(overlappingPairCache);
                        Ammo.destroy(dispatcher);
                        Ammo.destroy(collisionConfiguration);
                        print('ok.')
                        return;
                    }
                    //    for (var i = 0; i < 135; i++) {
                    dynamicsWorld.stepSimulation(1 / 120, 10);

                    bodies.forEach(function (body) {
                        if (body.getMotionState()) {
                            body.getMotionState().getWorldTransform(trans);
                            var x = trans.getOrigin().x(), y = trans.getOrigin().y(), z = trans.getOrigin().z();
                            var pos = body.mesh.position;
                            if (pos.x != x || pos.y != y || pos.z != z) {
                                pos.x = x;
                                pos.y = y;
                                pos.z = z;
                                body.mesh.modelMatrixNeedsUpdate = true;
                            }
                            //print("world pos = " + [x.toFixed(2), y.toFixed(2), z.toFixed(2)]);
                        }
                    });
                    // }

                    i++;
                    timer = setTimeout(function () {
                        continueSimulation();
                    }, 20);
                }
                continueSimulation();
            }

            main();
        }
        setTimeout(function () {
            simulate();
        }, 1000 * 3);


    });
