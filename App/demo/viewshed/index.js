/// <reference path="../common.js" />

requirejs([
    "../../../requirejs.config.js",
    "../../../appconfig.js",
    '../../../Source/Main',
    '../common.js'
], function (
    config,
    appconfig,
    Cesium,
    common
) {
        MeshVisualizer = Cesium.MeshVisualizer;
        Mesh = Cesium.Mesh;
        MeshMaterial = Cesium.MeshMaterial;
        FramebufferTexture = Cesium.FramebufferTexture;
        GeometryUtils = Cesium.GeometryUtils;
        LOD = Cesium.LOD;
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

        //示例1：Cesium.Geometry+Cesium.MeshMaterial组合
        var box = Cesium.BoxGeometry.createGeometry(Cesium.BoxGeometry.fromDimensions({
            dimensions: new Cesium.Cartesian3(100000, 50000, 50000),
            vertexFormat: Cesium.VertexFormat.POSITION_AND_ST
        }));

        var frontPosMtl = new MeshMaterial({
            defaultColor: "rgba(255,0,0,1.0)",
            wireframe: false,
            translucent: true,
            depthTest: false,
            side: MeshMaterial.Sides.FRONT,
            allowPick: false
        });

        function modifyVertexShaderForViewAnalysis(vs) {
            var renamedFS = Cesium.ShaderSource.replaceMain(vs, 'czm_view_analysis_main');
            var viewAnalysisMain = 'varying vec4 view_analysis_position; \n' +
                'void main() \n' +
                '{ \n' +
                '    czm_view_analysis_main(); \n' +
                '    view_analysis_position = normalize(gl_Position);//u_modelViewMatrix * vec4(a_position, 1.0)); \n' +
                '}';

            return renamedFS + '\n' + viewAnalysisMain;

        }

        function modifyFragmentShaderForViewAnalysis(fs) {
            var renamedFS = Cesium.ShaderSource.replaceMain(fs, 'czm_view_analysis_main');
            var viewAnalysisMain = 'varying vec4 view_analysis_position; \n' +
                'void main() \n' +
                '{ \n' +
                '    czm_view_analysis_main(); \n' +
                '    gl_FragColor  = view_analysis_position;\n' +
                '}';


            return renamedFS + '\n' + viewAnalysisMain;

        }

        frontPosMtl.fragmentShader = modifyFragmentShaderForViewAnalysis(frontPosMtl.fragmentShader);
        frontPosMtl.vertexShader = modifyVertexShaderForViewAnalysis(frontPosMtl.vertexShader);

        backPosMtl.fragmentShader = modifyFragmentShaderForViewAnalysis(backPosMtl.fragmentShader);
        backPosMtl.vertexShader = modifyVertexShaderForViewAnalysis(backPosMtl.vertexShader);

        var frontPosMesh = new Mesh(box, frontPosMtl);
        var frontPosTex = new FramebufferTexture(frontPosMesh);

        var backPosMtl = new MeshMaterial({
            defaultColor: "rgba(255,0,0,1.0)",
            wireframe: false,
            translucent: true,
            depthTest: false,
            side: MeshMaterial.Sides.BACK,
            allowPick: false,
            uniforms: {
                frontPosTex: frontPosTex 
            },
        });
        var backPosMesh = new Mesh(box, backPosMtl);
        var backPosTex = new FramebufferTexture(backPosMesh);

        var shaderPromise = [
            Cesium.loadText('./Shaders/viewshed_vert.glsl'),
            Cesium.loadText('./Shaders/viewshed_frag.glsl'),
        ];
        Cesium.when.all(shaderPromise, function (shaders) {
            var renderMtl = new MeshMaterial({
                uniforms: { 
                    backPosTex: backPosTex
                },
                side: MeshMaterial.Sides.FRONT,
                vertexShader: shaders[0],
                fragmentShader: shaders[1]
            })

            var renderBoxMesh = new Mesh(box, renderMtl);
            meshVisualizer.add(renderBoxMesh);

        }, function (err) {
        });
    });