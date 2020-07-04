

homePosition = [109.88, 30.18, 3000000];//初始位置

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
    defaultColor: Cesium.Color.GREEN,
    wireframe: true,
    side: MeshMaterial.Sides.FRONT,
    allowPick: true,
    depthTest: true,
    blending: true,
    vertexShader:
        'attribute vec4 color;\n' +
        'attribute float picked;\n' +

        'varying float v_picked;\n' +
        'varying vec4 v_color;\n' +
        'void main() {\n' +
        '   v_picked=picked;\n' +
        '   v_color=color;\n' +
        '   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n' +
        '}',
    fragmentShader: 'varying float v_picked;\n' +
        'uniform vec4  pickedColor;\n' +
        'uniform vec4  defaultColor;\n' +
        'varying vec4 v_color;\n' +
        'void main() {\n' +
        '   gl_FragColor = v_color;\n' +
        '   if(v_picked!=0.0){\n' +
        '      gl_FragColor = pickedColor;\n' +
        '   }' +
        '}'
});

var geometry = new Cesium.SphereGeometry({
    radius: 120000.0,
    stackPartitions: 8,
    slicePartitions: 8,
    vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
});
var mesh = new Mesh({
    geometry: geometry,
    material: material,
    instances: [],
    instancedAttributes: [{
        name: 'picked', default: 0
    }, {
        name: 'color', default: Cesium.Color.GREEN
    }]
});

for (var index = 0; index < 10000; index++) {
    var lon = Math.random() * 360 - 180, lat = -90 + Math.random() * 180;
    var p = Cesium.Cartesian3.fromDegrees(lon, lat, 120000);
    mesh.addInstance({
        color: Cesium.Color.fromRandom({
            alpha: 1
        }),
        modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(p),
        id: 'mesh-instance-' + index,
        userData: 'lon:' + lon + ",lat:" + lat
    });
}
meshVisualizer.add(mesh);


var scene = viewer.scene;
var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
var lastMesh = null;
var lastMeshInstance = null;
var entity = new Cesium.Entity();
handler.setInputAction(function (movement) {
    var pickedObject = scene.pick(movement.endPosition);
    if (lastMesh) {
        lastMesh.material.uniforms.picked.value = 0;
    }
    if (pickedObject && pickedObject.id instanceof Mesh) {
        lastMesh = pickedObject.id;
        lastMesh.material.uniforms.picked.value = 1;
    }
    if (lastMeshInstance) {
        lastMeshInstance.picked = 0;
    }
    if (pickedObject) {
        lastMeshInstance = pickedObject;
        pickedObject.picked = 1;
        entity.name = pickedObject.id;
        entity.description = pickedObject.userData;
        viewer.selectedEntity = entity;
    } else {
        viewer.selectedEntity = undefined;
    }

}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

viewer.extend(Cesium.viewerCesiumInspectorMixin);
