# CesiumMeshVisualizer

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
