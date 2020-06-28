/// <reference path="../common.js" />
/// <reference path="../../../dist/CesiumMeshVisualizer.js" />

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

    init();

    var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 0);
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

    var meshVisualizer = new MeshVisualizer({
        modelMatrix: modelMatrix,
        up: { y: 1 },
        position: { x: 0, y: 0, z: 50000 / 2 }
    });
    viewer.scene.primitives.add(meshVisualizer);
    meshVisualizer.showReference = true;//显示坐标轴


    var guiControls = new function () {
        this.model = 'bonsai';
        this.steps = 256.0;
        this.alphaCorrection = 1.0;
        this.color1 = "#00FA58";
        this.stepPos1 = 0.1;
        this.color2 = "#CC6600";
        this.stepPos2 = 0.7;
        this.color3 = "#F2F200";
        this.stepPos3 = 1.0;
    };
    function updateTransferFunction() {
        var canvas = document.createElement('canvas');
        canvas.height = 20;
        canvas.width = 256;

        var ctx = canvas.getContext('2d');

        var grd = ctx.createLinearGradient(0, 0, canvas.width - 1, canvas.height - 1);
        grd.addColorStop(guiControls.stepPos1, guiControls.color1);
        grd.addColorStop(guiControls.stepPos2, guiControls.color2);
        grd.addColorStop(guiControls.stepPos3, guiControls.color3);

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width - 1, canvas.height - 1);

        return canvas;
    }

    var dimensions = new Cesium.Cartesian3(50000, 50000, 50000);
    var boxGeometry = Cesium.BoxGeometry.createGeometry(Cesium.BoxGeometry.fromDimensions({
        dimensions: dimensions,
        vertexFormat: Cesium.VertexFormat.POSITION_ONLY
    }));

    var materialFirstPass = new MeshMaterial({
        vertexShader: document.getElementById("vertexShaderFirstPass").textContent,
        fragmentShader: document.getElementById("fragmentShaderFirstPass").textContent,
        side: MeshMaterial.Sides.BACK,
        depthTest:false,
        uniforms: {
            dimensions: dimensions
        }
    });
    var meshFirstPass = new Mesh(boxGeometry, materialFirstPass);
    var rtTexture = new FramebufferTexture(meshFirstPass);
    var transferTexture = updateTransferFunction();
    var materialSecondPass = new MeshMaterial({
        vertexShader: document.getElementById("vertexShaderSecondPass").textContent,
        fragmentShader: document.getElementById("fragmentShaderSecondPass").textContent,
        side: MeshMaterial.Sides.FRONT,
        uniforms: {
            alpha: 1,
            dimensions: dimensions,
            tex: rtTexture,
            cubeTex: "./teapot.raw.png",
            transferTex: transferTexture,
            steps: guiControls.steps,
            alphaCorrection: guiControls.alphaCorrection
        }
    });

    var meshSecondPass = new Mesh(boxGeometry, materialSecondPass);
    meshVisualizer.add(meshSecondPass);
//});