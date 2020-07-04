
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

var radius = 2000;
var sphereL0 = Cesium.SphereGeometry.createGeometry(new Cesium.SphereGeometry({
    radius: radius,
    vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
    stackPartitions: 4,
    slicePartitions: 4
}));
var sphereL1 = Cesium.SphereGeometry.createGeometry(new Cesium.SphereGeometry({
    radius: radius,
    vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
    stackPartitions: 8,
    slicePartitions: 8
}));
var sphereL2 = Cesium.SphereGeometry.createGeometry(new Cesium.SphereGeometry({
    radius: radius,
    vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
    stackPartitions: 16,
    slicePartitions: 16
}));
var sphereL3 = Cesium.SphereGeometry.createGeometry(new Cesium.SphereGeometry({
    radius: radius,
    vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
    stackPartitions: 32,
    slicePartitions: 32
}));
var sphereL4 = Cesium.SphereGeometry.createGeometry(new Cesium.SphereGeometry({
    radius: radius,
    vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
    stackPartitions: 64,
    slicePartitions: 64
}));

var geometries = [
            [sphereL4, 10],
            [sphereL3, 100],
            [sphereL2, 300],
            [sphereL1, 500],
            [sphereL0, 1000]
];

var maxAvailableDistance = 10000000 / 10;

var i, j, mesh, lod;
var scale = new Cesium.Cartesian3(1, 1, 1);

var maxCount = 10000;
var currCount = 0;
var batchCount = 100;

function continueAddLod() {
    if (currCount >= maxCount) {
        console.log("全部创建完成");
        return;
    }
    for (j = currCount ; j < currCount + batchCount; j++) {

        lod = new LOD();

        for (i = 0; i < geometries.length; i++) {

            mesh = new Mesh(geometries[i][0], material);
            mesh.scale = scale;

            lod.addLevel(mesh, geometries[i][1] * 100);
        }
        lod.maxAvailableDistance = maxAvailableDistance;
        lod.position.x = 1500000 * (0.5 - Math.random());
        lod.position.y = 750000 * (0.5 - Math.random());
        lod.position.z = 130000 * (0.6 - Math.random());
        lod.center = center;
        meshVisualizer.add(lod);

    }
    currCount += batchCount;

    setTimeout(function () {
        continueAddLod();
    }, 200);
    console.log(currCount);
}
continueAddLod();