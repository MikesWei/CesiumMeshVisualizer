/// <reference path="../common.js" />

//requirejs([
//       "../../../requirejs.config.js",
//       "../../../appconfig.js",
//       '../../../Source/Main',
//       '../common.js'
//], function (
//       config,
//       appconfig,
//       Cesium,
//       common
//       ) {
    MeshVisualizer = Cesium.MeshVisualizer;
    Mesh = Cesium.Mesh;
    MeshMaterial = Cesium.MeshMaterial;
    FramebufferTexture = Cesium.FramebufferTexture;
    GeometryUtils = Cesium.GeometryUtils;
    LOD = Cesium.LOD;
    ReferenceMesh = Cesium.ReferenceMesh;

    init();

    var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 50000);
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

    var meshVisualizer = new MeshVisualizer({
        modelMatrix: modelMatrix,
        referenceAxisParameter: {
            length: 100000
        },
        up: { z: 1 }
    });
    viewer.scene.primitives.add(meshVisualizer);
    meshVisualizer.showReference = true;

    var box = Cesium.BoxGeometry.createGeometry(Cesium.BoxGeometry.fromDimensions({
        dimensions: new Cesium.Cartesian3(50000, 50000, 50000),
        vertexFormat: Cesium.VertexFormat.POSITION_ONLY
    }));

    var material = new MeshMaterial({
        defaultColor: "rgba(125,125,125,0.6)",
        wireframe: false,
        side: MeshMaterial.Sides.DOUBLE,
        translucent: true
    });
    var boxMesh = new Mesh(box, material);
    boxMesh.position.z += 40000;
    boxMesh.rotation.angle = 45;
    var localReferenceMesh = new ReferenceMesh();
    localReferenceMesh.parent = boxMesh;

    meshVisualizer.add(boxMesh);

    var scene = viewer.scene;
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    var lastMesh = null;
    handler.setInputAction(function (movement) {
        var pickedObject = scene.pick(movement.endPosition);
        if (lastMesh) {
            lastMesh.material.uniforms.picked.value = 0;
        }
        if (pickedObject && pickedObject.id instanceof Mesh) {
            lastMesh = pickedObject.id;
            lastMesh.material.uniforms.picked.value = 1;
        }

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
//});
 
