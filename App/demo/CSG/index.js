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
CSG = Cesium.CSG;

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
    defaultColor: "rgba(0,0,255,1.0)",
    wireframe: true,
    side: MeshMaterial.Sides.DOUBLE
});

//创建盒子
var dimensions = new Cesium.Cartesian3(100000, 50000, 50000);
var boxGeometry = Cesium.BoxGeometry.createGeometry(Cesium.BoxGeometry.fromDimensions({
    dimensions: dimensions,
    vertexFormat: Cesium.VertexFormat.POSITION_ONLY
}));
var box = GeometryUtils.toCSG(boxGeometry);
var boxMesh = new Mesh(box, material);
meshVisualizer.add(boxMesh);

//创建球体
var sphere = new Cesium.SphereGeometry({
    radius: 50000.0,
    vertexFormat: Cesium.VertexFormat.POSITION_ONLY
});
sphere = Cesium.SphereGeometry.createGeometry(sphere);
sphere = CSG.toCSG(sphere);
var sphereMesh = new Mesh(sphere, material);
sphereMesh.position = new Cesium.Cartesian3(100000, 0, 0)
meshVisualizer.add(sphereMesh);

setTimeout(function () {
    //并
    var unionResult = box.union(sphere);
    var unionResultMesh = new Mesh(unionResult, material);
    unionResultMesh.position = new Cesium.Cartesian3(300000, 0, 0)
    meshVisualizer.add(unionResultMesh);

}, 1000 * 1)

setTimeout(function () {
    //交
    var intersectResult = box.intersect(sphere);
    var intersectResultMesh = new Mesh(intersectResult, material);
    intersectResultMesh.position = new Cesium.Cartesian3(500000, 0, 0)
    meshVisualizer.add(intersectResultMesh);

}, 1000 * 5);

setTimeout(function () {
    //球体减盒子
    var subResult = sphere.subtract(box);
    var subResultMesh = new Mesh(subResult, material);
    subResultMesh.position = new Cesium.Cartesian3(700000, 0, 0)
    meshVisualizer.add(subResultMesh);

}, 1000 * 10);

setTimeout(function () {
    //盒子减球体
    var subResult2 = box.subtract(sphere);
    var subResultMesh2 = new Mesh(subResult2, material);
    subResultMesh2.position = new Cesium.Cartesian3(900000, 0, 0)
    meshVisualizer.add(subResultMesh2);
}, 1000 * 15);

//渲染CSG创建的几何体
var cube = CSG.cube({
    center: [0, 0, 0],
    radius: 20000
});
var cubeMtl = new MeshMaterial({
    defaultColor: "rgba(255,0,0,1)"
});
meshVisualizer.add(new Mesh({
    geometry: cube,
    material: cubeMtl,
    position: new Cesium.Cartesian3(-100000, 0, 0)
}));

//}); 
