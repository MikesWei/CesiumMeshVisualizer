
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
meshVisualizer.showReference = true;//显示坐标轴

var material = new MeshMaterial({
    defaultColor: "rgba(200,0,0,1.0)",
    wireframe: true,
    side: MeshMaterial.Sides.FRONT
});
var geometry = new Cesium.SphereGeometry({
    radius: 50000.0,
    vertexFormat: Cesium.VertexFormat.POSITION_ONLY
});
var mesh = new Mesh(geometry, material);
mesh.position.z += 50000;
meshVisualizer.add(mesh);

setInterval(function () {
    mesh.rotation.angle += 1;
    mesh.modelMatrixNeedsUpdate = true;
}, 20); 
