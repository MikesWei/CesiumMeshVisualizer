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
    MeshPhongMaterial = Cesium.MeshPhongMaterial;
    FramebufferTexture = Cesium.FramebufferTexture;
    GeometryUtils = Cesium.GeometryUtils;
    LOD = Cesium.LOD;
    BasicMeshMaterial = Cesium.BasicMeshMaterial;

    init();

    var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 5000);
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

    var meshVisualizer = new MeshVisualizer({
        modelMatrix: modelMatrix,
        up: { y: 1 }
    });
    viewer.scene.primitives.add(meshVisualizer);
    meshVisualizer.showReference = true;//显示坐标轴
    function generateTexture() {

        var canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;

        var context = canvas.getContext('2d');
        var image = context.getImageData(0, 0, 256, 256);

        var x = 0, y = 0;

        for (var i = 0, j = 0, l = image.data.length; i < l; i += 4, j++) {

            x = j % 256;
            y = x == 0 ? y + 1 : y;

            image.data[i] = 255;
            image.data[i + 1] = 255;
            image.data[i + 2] = 255;
            image.data[i + 3] = Math.floor(x ^ y);

        }

        context.putImageData(image, 0, 0);

        return canvas;

    }
    var material = new BasicMeshMaterial({
        defaultColor: "rgba(200,0,0,1.0)",
        wireframe: false,
        side: MeshMaterial.Sides.FRONT,
        translucent: false,
        uniforms: {
            diffuseColorMap: generateTexture()//"../physics/textures/colors.png"
        }
    });

    var materials = [];
    var texture = new THREE.Texture(generateTexture())
    texture.needsUpdate = true;
    materials.push(new THREE.MeshLambertMaterial({ map: texture, transparent: true }));
    //materials.push(new THREE.MeshLambertMaterial({ color: 0xdddddd, shading: THREE.FlatShading }));
    materials.push(new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, shininess: 30}));//, shading: THREE.FlatShading }));
    materials.push(new THREE.MeshNormalMaterial());
    materials.push(new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending }));
    //materials.push( new THREE.MeshBasicMaterial( { color: 0xff0000, blending: THREE.SubtractiveBlending } ) );

    materials.push(new THREE.MeshLambertMaterial({ color: 0xdddddd, shading: THREE.SmoothShading }));
    materials.push(new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.SmoothShading, map: texture, transparent: true }));
    materials.push(new THREE.MeshNormalMaterial({ shading: THREE.SmoothShading }));
    materials.push(new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true }));

    materials.push(new THREE.MeshDepthMaterial());

    materials.push(new THREE.MeshLambertMaterial({ color: 0x666666, emissive: 0xff0000, shading: THREE.SmoothShading }));
    materials.push(new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x666666, emissive: 0xff0000, shininess: 10, shading: THREE.SmoothShading, opacity: 0.9, transparent: true }));

    materials.push(new THREE.MeshBasicMaterial({ map: texture, transparent: true }));

    var x = 0;
    var geometry = new THREE.SphereGeometry(2000.0, 16, 16);

    for (var i = 0; i < materials.length; i++) {
        var mesh = new THREE.Mesh(geometry, materials[i]);
        mesh.position.x = x;
        x += 4000;
        meshVisualizer.add(mesh);
    }

    var geometry = new THREE.PlaneBufferGeometry(1, 1);

    uniforms = {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2(viewer.scene.canvas.width, viewer.scene.canvas.height) }
    };

    var material = new THREE.ShaderMaterial({

        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent

    });

    var mesh = new THREE.Mesh(geometry, material);
     
    meshVisualizer.add(mesh); 
    meshVisualizer.beforeUpdate.addEventListener(function () {
        mesh.material.uniforms.time.value += 0.05; 
    })

});