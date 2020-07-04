
MeshVisualizer = Cesium.MeshVisualizer;
Mesh = Cesium.Mesh;
MeshMaterial = Cesium.MeshMaterial;
FramebufferTexture = Cesium.FramebufferTexture;
GeometryUtils = Cesium.GeometryUtils;
LOD = Cesium.LOD;

init();

var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 5000);
var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

var meshVisualizer = new MeshVisualizer({
    modelMatrix: modelMatrix,
    up: { z: 1 }
});
viewer.scene.primitives.add(meshVisualizer);
meshVisualizer.showReference = false;//显示坐标轴

var material = new MeshMaterial({
    defaultColor: "rgba(200,0,0,1.0)",
    wireframe: true,
    side: MeshMaterial.Sides.FRONT,
    allowPick: true,
    depthTest: true,
    blending: true
});

console.log('material.allowPick', material.allowPick)
var geometry = new Cesium.SphereGeometry({
    radius: 50000.0,
    vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
});
var mesh = new Mesh(geometry, material);
mesh.position.z += 50000;
meshVisualizer.add(mesh);

setInterval(function () {
    mesh.rotation.angle += 1;
    mesh.modelMatrixNeedsUpdate = true;
}, 20);

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

viewer.extend(Cesium.viewerCesiumInspectorMixin);
