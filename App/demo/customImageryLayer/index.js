
var MeshVisualizer = Cesium.MeshVisualizer,
    Mesh = Cesium.Mesh,
    MeshMaterial = Cesium.MeshMaterial,
    FramebufferTexture = Cesium.FramebufferTexture,
    GeometryUtils = Cesium.GeometryUtils,
    LOD = Cesium.LOD;
import ComputeImageryLayer from './ComputeImageryLayer.js';
import ComputeImageryProvider from './ComputeImageryProvider.js';

homePosition[2] = 200000;
init();

var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 100);
var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

var meshVisualizer = new MeshVisualizer({
    modelMatrix: modelMatrix,
    up: { z: 1 }
});
viewer.scene.primitives.add(meshVisualizer);
meshVisualizer.showReference = true;//显示坐标轴

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
meshVisualizer.add(boxMesh);

//将上文中的盒子渲染到缓存，作为纹理参与createGeometry（）方法创建的几何体渲染过程
var framebufferTex = new FramebufferTexture(boxMesh, new Cesium.Texture({
    context: viewer.scene.frameState.context,
    width: viewer.scene.canvas.width,
    height: viewer.scene.canvas.height,
    pixelFormat: Cesium.PixelFormat.RGBA,
    pixelDatatype: Cesium.PixelDatatype.FLOAT
}));
meshVisualizer.updateFrameBufferTexture(viewer.scene.frameState, framebufferTex);

meshVisualizer.beforeUpdate.addEventListener(function (frameState) {
    meshVisualizer.updateFrameBufferTexture(frameState, framebufferTex);
    if (!hasInit) {
        viewer.imageryLayers.add(computeLayer);
        hasInit = true;
    }
});

var hasInit = false;
var computePrvd = new ComputeImageryProvider({
    maximumLevel: 16,
    init: function () { return true; },
    prepareData: function (x, y, level, request) { return true; },
    compute: function (x, y, level, frameState, texture) {
        if (!texture) {
            texture = framebufferTex.texture;
        }
        return texture;
    }
});
var computeLayer = new ComputeImageryLayer(computePrvd);