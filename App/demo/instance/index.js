
function startApp(
    config,
    appconfig,
    Cesium,
    common
) {

    MeshVisualizer = Cesium.MeshVisualizer;
    Mesh = Cesium.Mesh;
    MeshMaterial = Cesium.MeshMaterial;
    FramebufferTexture = Cesium.FramebufferTexture;
    GeometryUtils = Cesium.GeometryUtils;
    LOD = Cesium.LOD;

    init();

    var meshVisualizer = new MeshVisualizer({
        up: { z: 1 }
    });
    viewer.scene.primitives.add(meshVisualizer);
    meshVisualizer.showReference = false;//显示坐标轴

    var material = new MeshMaterial({
        defaultColor: "rgba(50,0,0,1.0)",
        wireframe: false,
        side: MeshMaterial.Sides.FRONT,
        allowPick: true,
        depthTest: true,
        blending: true
    });

    var geometry = new Cesium.SphereGeometry({
        radius: 150000.0,
        stackPartitions: 8,
        slicePartitions: 8,
        vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
    });
    var mesh = new Mesh(geometry, material, []);

    for (var index = 0; index < 5000; index++) {
        var lon = Math.random() * 360 - 180, lat = -90 + Math.random() * 180;
        var p = Cesium.Cartesian3.fromDegrees(lon, lat, 150000);
        mesh.addInstance({
            id: 'mesh-instance-' + index,
            userData: 'lon:' + lon + ",lat:" + lat,
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(p)
        });
    }
    meshVisualizer.add(mesh);


    var scene = viewer.scene;
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    var lastMesh = null;
    var entity = new Cesium.Entity();
    handler.setInputAction(function (movement) {
        var pickedObject = scene.pick(movement.position);
        if (lastMesh) {
            lastMesh.material.uniforms.picked.value = 0;
        }
        if (pickedObject && pickedObject.id instanceof Mesh) {
            lastMesh = pickedObject.id;
            lastMesh.material.uniforms.picked.value = 1;
        }
        if (pickedObject) {
            entity.name = pickedObject.id;
            entity.description = pickedObject.userData;
            viewer.selectedEntity = entity;
        } else {
            viewer.selectedEntity = undefined;
        }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    viewer.extend(Cesium.viewerCesiumInspectorMixin);
}

requirejs([
    "../../../requirejs.config.js",
    "../../../appconfig.js",
    '../../../Source/Main',
    '../common.js'
], startApp);

