define([], function () {

    /**
    *帧缓存纹理类，可以将一个mesh渲染到帧缓存并作为纹理提供给其他mesh。<br/>
    *需要配合{@link Cesium.MeshVisualizer}、{@link Cesium.Mesh}、{@link Cesium.MeshMaterial}使用。
    *@param {Cesium.Mesh}mesh 
    *
    *@property {Cesium.Mesh}mesh 
    *@property {Cesium.Texture}texture 
    *
    *@constructor
    *@memberof Cesium
    *@example
    
        MeshVisualizer = Cesium.MeshVisualizer;
        Mesh = Cesium.Mesh;
        MeshMaterial = Cesium.MeshMaterial; 
        FramebufferTexture = Cesium.FramebufferTexture; 
        Shaders = VolumeRendering.Shaders; 

        var center2 = Cesium.Cartesian3.fromDegrees(homePosition[0]+3.5, homePosition[1] , 50000);
        var modelMatrix2 = Cesium.Transforms.eastNorthUpToFixedFrame(center2);

        var meshVisualizer = new MeshVisualizer({
            modelMatrix: modelMatrix2,
            up: { y: 1 },
            scale: new Cesium.Cartesian3(2,2,2)
        });
        viewer.scene.primitives.add(meshVisualizer);

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
            vertexShader: Shaders.vertexShaderFirstPass,
            fragmentShader: Shaders.fragmentShaderFirstPass,
            side: MeshMaterial.Sides.BACK,
            uniforms: {
                dimensions: dimensions
            }
        });
        var meshFirstPass = new Mesh(boxGeometry, materialFirstPass);
        var rtTexture = new FramebufferTexture(meshFirstPass);//这里使用FramebufferTexture
        var transferTexture = updateTransferFunction();
        var materialSecondPass = new MeshMaterial({
            vertexShader: Shaders.vertexShaderSecondPass,
            fragmentShader: Shaders.fragmentShaderSecondPass,
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
    */
    function FramebufferTexture(mesh,renderTarget) {
        this.mesh = mesh; 
        this.texture = null;
    }

    return FramebufferTexture;
})