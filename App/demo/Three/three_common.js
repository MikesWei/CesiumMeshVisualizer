MeshVisualizer = Cesium.MeshVisualizer;
Mesh = Cesium.Mesh;
MeshMaterial = Cesium.MeshMaterial;
MeshPhongMaterial = Cesium.MeshPhongMaterial;
FramebufferTexture = Cesium.FramebufferTexture;
GeometryUtils = Cesium.GeometryUtils;
LOD = Cesium.LOD;
BasicMeshMaterial = Cesium.BasicMeshMaterial;

init();

var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 5000);
var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

var scene = new MeshVisualizer({
    modelMatrix: modelMatrix,
    up: { y: 1 }
});
viewer.scene.primitives.add(scene);
scene.showReference = true;//显示坐标轴