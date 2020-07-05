
import CesiumMeshVis from '../../../Source/Main.js'
var MeshVisualizer = Cesium.MeshVisualizer,
    Mesh = Cesium.Mesh,
    MeshMaterial = Cesium.MeshMaterial,
    FramebufferTexture = Cesium.FramebufferTexture,
    GeometryUtils = Cesium.GeometryUtils,
    LOD = Cesium.LOD;
import ComputeImageryLayer from './ComputeImageryLayer.js';
import ComputeImageryProvider from './ComputeImageryProvider.js';
import Vector2RasterImageryProvider from './Vector2RasterImageryProvider.js';
import VectorPolylineGeometry from './VectorPolylineGeometry.js';
import VectorPolylineMaterial from './VectorPolylineMaterial.js';

homePosition[0] = 116.1;
homePosition[1] = 40.1;
homePosition[2] = 2000000;
// init();
viewer = new Cesium.Viewer("cesiumContainer", {
    animation: false,
    timeline: false,
    creditContainer: "creditContainer"
});
var imageryProviderViewModels = viewer.baseLayerPicker.viewModel.imageryProviderViewModels;
viewer.baseLayerPicker.viewModel.selectedImagery = imageryProviderViewModels[3];
viewer.extend(Cesium.viewerCesiumInspectorMixin);
viewer.cesiumInspector.container.style.display = "none";
viewer.scene.debugShowFramesPerSecond = true;

var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 100);
var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

var meshVisualizer = new MeshVisualizer({
    modelMatrix: modelMatrix,
    up: { z: 1 }
});
viewer.scene.primitives.add(meshVisualizer);
meshVisualizer.showReference = false;//显示坐标轴

var box = Cesium.BoxGeometry.createGeometry(Cesium.BoxGeometry.fromDimensions({
    dimensions: new Cesium.Cartesian3(100000, 50000, 50000),
    vertexFormat: Cesium.VertexFormat.POSITION_ONLY
}));

var material = new MeshMaterial({
    defaultColor: "rgba(255,0,0,1.0)",
    wireframe: false,
    translucent: true,
    depthTest: false,
    side: MeshMaterial.Sides.DOUBLE,
    allowPick: false,
    vertexShader: "\n\
        \n\
        varying vec4 v_position;\n\
        \n\
        void main(void) \n\
        {\n\
        vec4 pos = u_modelViewMatrix * vec4(position,1.0);\n\
        v_position = vec4(position,1.0);\n\
        gl_Position = u_projectionMatrix * pos;\n\
        }",
    fragmentShader: "\n\
        varying vec4 v_position;\n\
        uniform vec3 dimensions;\n\
        void main()\n\
        {\n\
        gl_FragColor =vec4(v_position.xyz/dimensions,1.);\n\;\n\
        }\n\
        ",
    uniforms: {
        dimensions: new Cesium.Cartesian3(100000, 50000, 50000)
    }
});
var boxMesh = new Mesh(box, material);
// meshVisualizer.add(boxMesh);

//将上文中的盒子渲染到缓存，作为纹理参与createGeometry（）方法创建的几何体渲染过程
var framebufferTex = new FramebufferTexture(boxMesh, new Cesium.Texture({
    context: viewer.scene.frameState.context,
    width: viewer.scene.canvas.width,
    height: viewer.scene.canvas.height,
    pixelFormat: Cesium.PixelFormat.RGBA,
    pixelDatatype: Cesium.PixelDatatype.FLOAT
}));
// meshVisualizer.updateFrameBufferTexture(viewer.scene.frameState, framebufferTex);

var hasInit = false;
meshVisualizer.beforeUpdate.addEventListener(function (frameState) {
    // meshVisualizer.updateFrameBufferTexture(frameState, framebufferTex);
    // if (!hasInit) {
    //     viewer.imageryLayers.add(computeLayer);
    //     hasInit = true;
    // }
});

// var worldLayer = new ComputeImageryLayer(new Vector2RasterImageryProvider({
//     source: './world.geojson',
//     maximumLevel: 16,
//     style: {
//         line: true,
//         lineWidth: 1,
//         lineColor: Cesium.Color.WHITE,
//         shadowColor: Cesium.Color.WHITE,//Cesium.Color.fromAlpha( Cesium.Color.WHITE,0.5),
//         shadowSize: 1,
//         shadows: true,
//         outline: true,
//         outlineColor: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.5),
//         outlineWidth: 0
//     }
// }));
// window.worldLayer = worldLayer;
// viewer.imageryLayers.add(worldLayer);

var bjLayer = new ComputeImageryLayer(new Vector2RasterImageryProvider({
    source: './bj.json',
    maximumLevel: 15,
    minimumLevel: 6,
    style: {
        line: true,
        lineWidth: 8,
        lineColor: Cesium.Color.GREEN,
        shadowColor: Cesium.Color.GREEN,//Cesium.Color.fromAlpha( Cesium.Color.WHITE,0.5),
        shadowSize: 2,
        shadows: true,
        outline: true,
        outlineColor: Cesium.Color.fromAlpha(Cesium.Color.GREEN, 0.95),
        outlineWidth: 2,
        symbolOptions: {
            backColor: Cesium.Color.GREEN
        },
        lineSymbolReverse: true,
        useLineSymbol: true
    }
}));
window.bjLayer = bjLayer;
viewer.imageryLayers.add(bjLayer);


// var provLayer = new ComputeImageryLayer(new Vector2RasterImageryProvider({
//     source: './china_province.geojson',
//     maximumLevel: 16,
//     filter: function (feature) {
//         if (feature.properties) {
//             var name = feature.properties.NAME
//             if (name && (name.indexOf('北京') >= 0 
//             || name.indexOf('河北') >= 0
//             // || name.indexOf('天津') >= 0
//             )) {
//                 return false;
//             }
//         }
//         return true;
//     },
//     style: {
//         line: true,
//         lineWidth: 2,
//         lineColor: Cesium.Color.WHITE,
//         shadowColor: Cesium.Color.RED,//Cesium.Color.fromAlpha( Cesium.Color.WHITE,0.5),
//         shadowSize: 2,
//         shadows: false,
//         outline: true,
//         outlineColor: Cesium.Color.fromAlpha(Cesium.Color.RED, 0.95),
//         outlineWidth: 1
//     }
// }));
// window.provLayer = provLayer;
// viewer.imageryLayers.add(provLayer);

Cesium.when.all([
    // worldLayer.imageryProvider.readyPromise,
    // provLayer.imageryProvider.readyPromise,
    bjLayer.imageryProvider.readyPromise
], function () {
    viewer.scene.camera.flyTo({
        destination: bjLayer.imageryProvider.rectangle
    })

    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (evt) {
        viewer.scene.camera.flyTo({
            destination: bjLayer.imageryProvider.rectangle
        })
        evt.cancel = true;
    })
})

