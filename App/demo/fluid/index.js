 
MeshVisualizer = Cesium.MeshVisualizer;
Mesh = Cesium.Mesh;
MeshMaterial = Cesium.MeshMaterial;
FramebufferTexture = Cesium.FramebufferTexture;
GeometryUtils = Cesium.GeometryUtils;
LOD = Cesium.LOD;
homePosition[2] = 200000;
init();

var gl = viewer.scene.frameState.context._gl;
//initGL(viewer.scene.canvas,gl);
var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 0);
var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

var meshVisualizer = new MeshVisualizer({
    modelMatrix: modelMatrix,
    up: { z: 1 }
});
viewer.scene.globe.show = true;
viewer.scene.primitives.add(meshVisualizer);
meshVisualizer.showReference = true;//显示坐标轴

var shaders = {
    "2d-render-shader": document.getElementById("2d-render-shader").text,
    "2d-vertex-shader": document.getElementById("2d-vertex-shader").text,
    "advectShaderMat": document.getElementById("advectShaderMat").text,
    "advectShaderVel": document.getElementById("advectShaderVel").text,
    "boundaryConditionsShader": document.getElementById("boundaryConditionsShader").text,
    "divergenceShader": document.getElementById("divergenceShader").text,
    "forceShader": document.getElementById("forceShader").text,
    "gradientSubtractionShader": document.getElementById("gradientSubtractionShader").text,
    "jacobiShader": document.getElementById("jacobiShader").text,
    "resetVelocityShader": document.getElementById("resetVelocityShader").text,
};
//var shaderPromises = [
//];
//var shaderKeys = Object.keys(shaders);
//shaderKeys.forEach(function (key) {
//    shaderPromises.push(Cesium.loadText('./shaders/' + key + '.glsl'));
//})
//Cesium.when.all(shaderPromises, function (results) {
//    for (var i = 0; i < results.length; i++) {
//        shaders[shaderKeys[i]] = results[i];
//    }
//    main();
//});
requestAnimationFrame(function () {
    try {
        main();
    } catch (e) {
        alert(e.message);
    }

})
function main() {

    var dt = 1;
    var dx = 1;
    var nu = 0.00000030;//viscosity
    var rho = 0.21;//density
    var actualWidth = viewer.scene.canvas.clientWidth; //document.body.clientWidth;
    var actualHeight = viewer.scene.canvas.clientHeight; // document.body.clientHeight;
    var obstaclePosition = [0, 0];
    var obstacleRad = 84;  //球的直径
    var movingObstacle = true;

    var lastMouseCoordinates = [0, 0];
    var mouseCoordinates = [0, 0];
    var mouseEnable = false;

    var paused = false;//while window is resizing

    var gridSize = 200;
    var maxDim = Math.max(actualHeight, actualWidth);
    var scale = maxDim / gridSize;
    var alpha = dx * dx / (nu * dt);
    width = Math.floor(actualWidth / scale);
    height = Math.floor(actualHeight / scale);

    var gl = viewer.scene.frameState.context._gl;
    var ext = gl.getExtension("OES_texture_half_float") || gl.getExtension("EXT_color_buffer_half_float");


    function createEmptyTexture(frameState, width, height, id) {

        var emptyTexture = new Cesium.Texture({
            context: frameState.context,
            source: {
                width: width,
                height: height,
                arrayBufferView: ext ? new Float32Array(width * height * 4) : new Uint8Array(width * height * 4)
            },
            target: Cesium.WebGLConstants.TEXTURE_2D,
            width: width,
            height: height,
            pixelDatatype: ext ? Cesium.PixelDatatype.FLOAT : void (0),
            sampler: new Cesium.Sampler({
                minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
                magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST
            })
        });
        emptyTexture.id = id;
        return emptyTexture;
    }

    var textures = {
        "velocity": createEmptyTexture(viewer.scene.frameState, width, height, "velocity"),
        "nextVelocity": createEmptyTexture(viewer.scene.frameState, width, height, "nextVelocity"),
        "material": createEmptyTexture(viewer.scene.frameState, actualWidth, actualWidth, "material"),
        "nextMaterial": createEmptyTexture(viewer.scene.frameState, actualWidth, actualWidth, "nextMaterial"),
        "pressure": createEmptyTexture(viewer.scene.frameState, width, height, "pressure"),
        "nextPressure": createEmptyTexture(viewer.scene.frameState, width, height, "nextPressure"),
        "u_b": createEmptyTexture(viewer.scene.frameState, width, height, "u_b"),
        "u_x": createEmptyTexture(viewer.scene.frameState, width, height, "u_x"),
        "u_texture": createEmptyTexture(viewer.scene.frameState, width, height, "u_texture"),
        "velocityDivergence": createEmptyTexture(viewer.scene.frameState, width, height, "velocityDivergence")

    };
    var geometry = new Cesium.PlaneBufferGeometry(2, 2);

    var advectVelMtl = new MeshMaterial({
        blending: false,
        uniforms: {
            u_dt: dt,
            u_velocity: textures["velocity"],//速度纹理
            u_material: textures["material"],//
            u_scale: -1,
            u_textureSize: new Cesium.Cartesian2(width, height)
        },
        vertexShader: shaders["2d-vertex-shader"], //shaders["2d-vertex-shader"],
        fragmentShader: shaders["advectShaderVel"]// document.getElementById("advectShaderVel").textContent
    });

    var fb_advectVel = new FramebufferTexture(new Mesh(geometry, advectVelMtl));

    var advectMatMtl = new MeshMaterial({
        blending: false,
        uniforms: {
            u_dt: dt,
            u_velocity: textures["velocity"],//速度纹理
            u_material: textures["material"],//
            u_scale: width / actualWidth,
            u_textureSize: new Cesium.Cartesian2(actualWidth, actualHeight)
        },
        vertexShader: shaders["2d-vertex-shader"],
        fragmentShader: shaders["advectShaderMat"]//document.getElementById("advectShaderMat").textContent
    });
    var fb_advectMat = new FramebufferTexture(new Mesh(geometry, advectMatMtl));

    var gradientSubtractionMtl = new MeshMaterial({
        blending: false,
        uniforms: {
            u_const: 0.5 / dx,
            u_velocity: textures["velocity"],//速度纹理
            u_pressure: textures["pressure"],// 
            u_textureSize: new Cesium.Cartesian2(width, height)
        },
        vertexShader: shaders["2d-vertex-shader"],
        fragmentShader: shaders["gradientSubtractionShader"]//document.getElementById("gradientSubtractionShader").textContent
    });
    var fb_gradientSubtraction = new FramebufferTexture(new Mesh(geometry, gradientSubtractionMtl));

    var divergeMtl = new MeshMaterial({
        blending: false,
        uniforms: {
            u_const: 0.5 / dx,
            u_velocity: textures["velocity"],//速度纹理 
            u_textureSize: new Cesium.Cartesian2(width, height)
        },
        vertexShader: shaders["2d-vertex-shader"],
        fragmentShader: shaders["divergenceShader"]//document.getElementById("divergenceShader").textContent
    });
    var fb_diverge = new FramebufferTexture(new Mesh(geometry, divergeMtl));

    var forceMtl = new MeshMaterial({
        blending: false,
        uniforms: {
            u_dt: dt,
            u_velocity: textures["velocity"],//速度纹理 
            u_textureSize: new Cesium.Cartesian2(width, height),
            u_mouseCoord: new Cesium.Cartesian2(width / 2, height / 2),
            u_mouseDir: new Cesium.Cartesian2(width / 2, height / 2),
            u_reciprocalRadius: 0.1 * scale
        },
        vertexShader: shaders["2d-vertex-shader"],
        fragmentShader: shaders["forceShader"]//document.getElementById("forceShader").textContent
    });
    var fb_force = new FramebufferTexture(new Mesh(geometry, forceMtl));

    var jacobiMtl = new MeshMaterial({
        blending: false,
        uniforms: {
            u_b: textures["u_b"],
            u_x: textures["u_x"],
            u_alpha: alpha,
            u_reciprocalBeta: 1 / (4 + alpha),
            u_textureSize: new Cesium.Cartesian2(width, height)
        },
        vertexShader: shaders["2d-vertex-shader"],
        fragmentShader: shaders["jacobiShader"]//document.getElementById("jacobiShader").textContent
    });
    var fb_jacobi = new FramebufferTexture(new Mesh(geometry, jacobiMtl));

    var renderMtl = new MeshMaterial({
        blending: false,
        uniforms: {
            u_obstacleRad: obstacleRad,
            u_material: textures["material"],
            u_obstaclePosition: new Cesium.Cartesian2(obstaclePosition[0] * width / actualWidth, obstaclePosition[1] * height / actualHeight),
            u_textureSize: new Cesium.Cartesian2(actualWidth, actualHeight)
        },
        vertexShader: shaders["2d-vertex-shader"],
        fragmentShader: shaders["2d-render-shader"]// document.getElementById("2d-render-shader").textContent
    });

    var boundaryMtl = new MeshMaterial({
        blending: false,
        uniforms: {
            u_obstacleRad: obstacleRad,
            u_texture: textures["nextVelocity"],
            u_obstaclePosition: new Cesium.Cartesian2(obstaclePosition[0] * width / actualWidth, obstaclePosition[1] * height / actualHeight),
            u_textureSize: new Cesium.Cartesian2(width, height),
            u_scale: -1
        },
        vertexShader: shaders["2d-vertex-shader"],
        fragmentShader: shaders["boundaryConditionsShader"]//document.getElementById("boundaryConditionsShader").textContent
    });
    var fb_boundary = new FramebufferTexture(new Mesh(geometry, boundaryMtl));

    var resetVelocityMtl = new MeshMaterial({
        blending: false,
        vertexShader: shaders["2d-vertex-shader"],
        fragmentShader: shaders["resetVelocityShader"]//document.getElementById("resetVelocityShader").textContent
    });
    var fb_resetVelocity = new FramebufferTexture(new Mesh(geometry, resetVelocityMtl));

    // meshVisualizer.add(new Mesh(geometry, renderMtl));
    var west = -100000,
       south = -50000,
       east = 100000,
       north = 50000;
    height = 0;
    function createGeometry(west, south, east, north, height) {
        west = Cesium.defaultValue(west, -100000),
        south = Cesium.defaultValue(south, -50000),
        east = Cesium.defaultValue(east, 100000),
        north = Cesium.defaultValue(north, 50000);
        height = Cesium.defaultValue(height, 0);
        var p1 = new Cesium.Cartesian3(west, north, height);
        var p2 = new Cesium.Cartesian3(west, south, height);
        var p3 = new Cesium.Cartesian3(east, south, height);
        var p4 = new Cesium.Cartesian3(east, north, height);

        var positions = new Float64Array([
          p1.x, p1.y, p1.z,
          p2.x, p2.y, p2.z,
          p3.x, p3.y, p3.z,
          p4.x, p4.y, p4.z
        ]);
        var indices = new Uint16Array([
          0, 1, 3,
          1, 2, 3,
        ]);
        var sts = new Float32Array([
           0, 0,
           0, 1,
           1, 1,
           1, 0
        ]);
        var geometry = new Cesium.Geometry({
            attributes: {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: positions
                }),
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: sts
                })
            },
            indices: indices,
            primitiveType: Cesium.PrimitiveType.TRIANGLES,
            boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
        });

        return geometry;
    }
    var customMeshMtl = new MeshMaterial({
        uniforms: {
            u_material: textures.velocity,
            u_textureSize: new Cesium.Cartesian2(actualWidth, actualHeight),
            u_obstacleRad: obstacleRad,
            u_obstaclePosition: new Cesium.Cartesian2(obstaclePosition[0], obstaclePosition[1])
        },
        side: MeshMaterial.Sides.DOUBLE,
        vertexShader: "\n\
                \n\
                varying vec3 v_position;\n\
                varying vec2 v_st;\n\
                \n\
                void main(void) \n\
                {\n\
                vec4 pos = u_modelViewMatrix * vec4(position,1.0);\n\
                v_position = pos.xyz;\n\
                v_st=st;\n\
                gl_Position = u_projectionMatrix * pos;\n\
                }",
        fragmentShader: "precision mediump float;\n\
varying vec2 v_st;\n\
uniform sampler2D u_material; //值为0-1的一个灰度映射  存放在  r 通道  lsh\n\
        uniform vec2 u_obstaclePosition;\n\
        uniform vec2 u_textureSize;\n\
        uniform float u_obstacleRad;\n\
\n\
        void main() {\n\
            vec2 fragCoord = u_textureSize*v_st;//gl_FragCoord.xy;\n\
\n\
            vec2 dir = fragCoord - vec2(0.5, 0.5) - u_obstaclePosition;\n\
            float dist = length(dir);\n\
            if (dist < u_obstacleRad){\n\
                gl_FragColor = vec4(0.0, 0, 0.0, 1);  //圆的颜色 lsh\n\
                return;\n\
            }\n\
\n\
            float mat1 = texture2D(u_material, fragCoord/u_textureSize).x;\n\
            vec3 color = vec3(0.98, 0.93, 0.84);\n\
            //https://www.shadertoy.com/view/MsS3Wc    hsv\n\
            //vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );\n\
            vec3 rgb = clamp( abs(mod((mat1*0.9+0.5)*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );//lsh\n\
            // vec3 rgb = mix(vec3(1.0,1.0,1.0),vec3(0.0,0.0,1.0),mat1*color);//lsh\n\
            //vec3 rgb = mat1*color;\n\
            gl_FragColor =  vec4(rgb, 1);\n\
        }"
        /*"varying vec2 v_st;\
       uniform sampler2D u_textureMap;\
       void main()\
       {\n\
       vec4 color=texture2D(u_textureMap,v_st);\n\
       gl_FragColor = vec4(color.rgb,1.0);\n\
       \
       }\
       " */
    });
    var customMesh = new Mesh(createGeometry(west, south, east, north, height), customMeshMtl);
    meshVisualizer.add(customMesh);

    function swap(object, texture1Name, texture2Name) {
        var temp = object[texture1Name];
        object[texture1Name] = object[texture2Name];
        object[texture2Name] = temp;
    };
    var hasStart = false, paused = false;

    var viewport = { x: 0, y: 0, width: actualWidth, height: actualHeight };
    function setSize(w, h) {
        viewport.width = w;
        viewport.height = h;
    }

    resetWindow();
    var lastTime = new Date();
    var deltTime = 0;

    meshVisualizer.beforeUpdate.addEventListener(function (frameState) {

        if (paused) {
            return;
        }
        deltTime = new Date() - lastTime;
        if (deltTime > 1000) {
            console.log("frame time:" + deltTime + "ms");
        }

        lastTime = new Date();
        if (hasStart) {
            swap(textures, "nextMaterial", "material")
        } else {
            hasStart = true;
        }

        setSize(width, height);
        //advect velocity
        advectVelMtl.uniforms.u_material.value = textures.velocity;
        advectVelMtl.uniforms.u_velocity.value = textures.velocity;
        fb_advectVel.texture = textures.nextVelocity;
        meshVisualizer.updateFrameBufferTexture(frameState, fb_advectVel, viewport);

        if (movingObstacle) {
            boundaryMtl.uniforms.u_obstaclePosition.value.x = obstaclePosition[0] * width / actualWidth,
            boundaryMtl.uniforms.u_obstaclePosition.value.y = obstaclePosition[1] * height / actualHeight;
        }
        boundaryMtl.uniforms.u_texture.value = textures.nextVelocity;
        boundaryMtl.uniforms.u_scale.value = -1;
        fb_boundary.texture = textures.velocity;
        meshVisualizer.updateFrameBufferTexture(frameState, fb_boundary, viewport);


        // diffuse velocity
        var alpha = dx * dx / (nu * dt);
        jacobiMtl.uniforms.u_alpha.value = alpha;
        jacobiMtl.uniforms.u_reciprocalBeta.value = 1 / (4 + alpha);
        for (var i = 0; i < 40; i++) {
            jacobiMtl.uniforms.u_b.value = textures.velocity;
            jacobiMtl.uniforms.u_x.value = textures.velocity;
            fb_jacobi.texture = textures.nextVelocity;
            meshVisualizer.updateFrameBufferTexture(frameState, fb_jacobi, viewport);

            jacobiMtl.uniforms.u_b.value = textures.nextVelocity;
            jacobiMtl.uniforms.u_x.value = textures.nextVelocity;
            fb_jacobi.texture = textures.velocity;
            meshVisualizer.updateFrameBufferTexture(frameState, fb_jacobi, viewport);
        }

        //apply force
        if (mouseEnable) {

            forceMtl.uniforms.u_mouseCoord.value.x = mouseCoordinates[0] * width / actualWidth,
            forceMtl.uniforms.u_mouseCoord.value.y = mouseCoordinates[1] * height / actualHeight;
            forceMtl.uniforms.u_mouseDir.value.x = 2 * (mouseCoordinates[0] - lastMouseCoordinates[0]) / scale,
            forceMtl.uniforms.u_mouseDir.value.x = 2 * (mouseCoordinates[1] - lastMouseCoordinates[1]) / scale;
            forceMtl.uniforms.u_velocity.value = textures.velocity;
            fb_force.texture = textures.nextVelocity;
            meshVisualizer.updateFrameBufferTexture(frameState, fb_force, viewport);


            boundaryMtl.uniforms.u_scale.value = -1;
            boundaryMtl.uniforms.u_texture.value = textures.nextVelocity;
            fb_boundary.texture = textures.velocity;
            meshVisualizer.updateFrameBufferTexture(frameState, fb_boundary, viewport);
        }

        // compute pressure

        divergeMtl.uniforms.u_velocity.value = textures.velocity;
        fb_diverge.texture = textures.velocityDivergence;
        meshVisualizer.updateFrameBufferTexture(frameState, fb_diverge, viewport);//calc velocity divergence


        jacobiMtl.uniforms.u_alpha.value = -dx * dx;
        jacobiMtl.uniforms.u_reciprocalBeta.value = 1 / 4;
        for (var i = 0; i < 20; i++) {
            jacobiMtl.uniforms.u_b.value = textures.velocityDivergence;
            jacobiMtl.uniforms.u_x.value = textures.pressure;
            fb_jacobi.texture = textures.nextPressure;
            meshVisualizer.updateFrameBufferTexture(frameState, fb_jacobi, viewport);//diffuse velocity

            jacobiMtl.uniforms.u_b.value = textures.velocityDivergence;
            jacobiMtl.uniforms.u_x.value = textures.nextPressure;
            fb_jacobi.texture = textures.pressure;
            meshVisualizer.updateFrameBufferTexture(frameState, fb_jacobi, viewport);//diffuse velocity
        }

        boundaryMtl.uniforms.u_scale.value = 1;
        boundaryMtl.uniforms.u_texture.value = textures.pressure;
        fb_boundary.texture = textures.nextPressure;
        meshVisualizer.updateFrameBufferTexture(frameState, fb_boundary, viewport);
        swap(textures, "nextPressure", "pressure");

        // subtract pressure gradient 
        gradientSubtractionMtl.uniforms.u_pressure.value = textures.pressure;
        gradientSubtractionMtl.uniforms.u_velocity.value = textures.velocity;
        fb_gradientSubtraction.texture = textures.nextVelocity;
        meshVisualizer.updateFrameBufferTexture(frameState, fb_gradientSubtraction, viewport);

        boundaryMtl.uniforms.u_scale.value = -1;
        boundaryMtl.uniforms.u_texture.value = textures.nextVelocity;
        fb_boundary.texture = textures.velocity;
        meshVisualizer.updateFrameBufferTexture(frameState, fb_boundary, viewport);

        setSize(actualWidth, actualHeight);
        // move material 
        advectMatMtl.uniforms.u_velocity.value = textures.velocity;
        advectMatMtl.uniforms.u_material.value = textures.material;
        fb_advectMat.texture = textures.nextMaterial;
        meshVisualizer.updateFrameBufferTexture(frameState, fb_advectMat, viewport);

        if (movingObstacle) {
            renderMtl.uniforms.u_obstaclePosition.value.x = obstaclePosition[0],
            renderMtl.uniforms.u_obstaclePosition.value.y = obstaclePosition[1];
            customMeshMtl.uniforms.u_obstaclePosition.value.x = obstaclePosition[0],
            customMeshMtl.uniforms.u_obstaclePosition.value.y = obstaclePosition[1];
        }
        renderMtl.uniforms.u_material.value = textures.velocity;
        customMeshMtl.uniforms.u_material.value = textures.velocity;
        deltTime = new Date() - lastTime;
        if (deltTime > 100) {
            console.log("framebuffer time:" + deltTime + "ms");
        }

    })

    function resetWindow() {

        actualWidth = viewer.scene.canvas.clientWidth; //document.body.clientWidth;
        actualHeight = viewer.scene.canvas.clientHeight; // document.body.clientHeight;

        var maxDim = Math.max(actualHeight, actualWidth);
        var scale = maxDim / gridSize;

        width = Math.floor(actualWidth / scale);
        height = Math.floor(actualHeight / scale);

        obstaclePosition = [actualWidth / 10, actualHeight / 2];  //初始位置

        advectVelMtl.uniforms.u_textureSize.value = new Cesium.Cartesian2(width, height);
        advectVelMtl.uniforms.u_scale.value = 1;

        advectMatMtl.uniforms.u_textureSize.value = new Cesium.Cartesian2(actualWidth, actualHeight);
        advectMatMtl.uniforms.u_scale.value = width / actualWidth;

        gradientSubtractionMtl.uniforms.u_textureSize.value = new Cesium.Cartesian2(width, height);

        divergeMtl.uniforms.u_textureSize.value = new Cesium.Cartesian2(width, height);

        forceMtl.uniforms.u_reciprocalRadius.value = 0.1 * scale;
        forceMtl.uniforms.u_textureSize.value = new Cesium.Cartesian2(width, height);

        jacobiMtl.uniforms.u_textureSize.value = new Cesium.Cartesian2(width, height);

        renderMtl.uniforms.u_obstaclePosition.value.x = obstaclePosition[0],
        renderMtl.uniforms.u_obstaclePosition.value.y = obstaclePosition[1];
        renderMtl.uniforms.u_textureSize.value = new Cesium.Cartesian2(actualWidth, actualHeight);
        renderMtl.uniforms.u_obstacleRad.value = obstacleRad;

        boundaryMtl.uniforms.u_textureSize.value = new Cesium.Cartesian2(width, height);
        boundaryMtl.uniforms.u_obstaclePosition.value = new Cesium.Cartesian2(obstaclePosition[0] * width / actualWidth, obstaclePosition[1] * height / actualHeight);
        boundaryMtl.uniforms.u_obstacleRad.value = obstacleRad * width / actualWidth;

        // var velocity = new Uint16Array(width*height*4);
        // for (var i=0;i<height;i++){
        //     for (var j=0;j<width;j++){
        //         var index = 4*(i*width+j);
        //         velocity[index] = toHalf(1);
        //     }
        // }
        /*GPU.initTextureFromData("velocity", width, height, "HALF_FLOAT", null, true);//velocity
        GPU.initFrameBufferForTexture("velocity", true);
        GPU.initTextureFromData("nextVelocity", width, height, "HALF_FLOAT", null, true);//velocity
        GPU.initFrameBufferForTexture("nextVelocity", true);*/

        fb_resetVelocity.texture = textures.velocity;
        meshVisualizer.updateFrameBufferTexture(viewer.scene.frameState, fb_resetVelocity, viewport);
        fb_resetVelocity.texture = textures.nextVelocity;
        meshVisualizer.updateFrameBufferTexture(viewer.scene.frameState, fb_resetVelocity, viewport);

        /*GPU.initTextureFromData("velocityDivergence", width, height, "HALF_FLOAT", new Uint16Array(width * height * 4), true);
        GPU.initFrameBufferForTexture("velocityDivergence", true);
        GPU.initTextureFromData("pressure", width, height, "HALF_FLOAT", new Uint16Array(width * height * 4), true);
        GPU.initFrameBufferForTexture("pressure", true);
        GPU.initTextureFromData("nextPressure", width, height, "HALF_FLOAT", new Uint16Array(width * height * 4), true);
        GPU.initFrameBufferForTexture("nextPressure", true);*/

        // var numCols = Math.floor(actualHeight/10);
        // if (numCols%2 == 1) numCols--;
        // var numPx = actualHeight/numCols;

        // var material = new Uint16Array(actualWidth*actualHeight*4);
        // for (var i=0;i<actualHeight;i++){
        //     for (var j=0;j<actualWidth;j++){
        //         var index = 4*(i*actualWidth+j);
        //         if (j==0 && Math.floor((i-2)/numPx)%2==0) material[index] = toHalf(1.0);
        //     }
        // }
        /* GPU.initTextureFromData("material", actualWidth, actualHeight, "HALF_FLOAT", null, true);//material
         GPU.initFrameBufferForTexture("material", true);
         GPU.initTextureFromData("nextMaterial", actualWidth, actualHeight, "HALF_FLOAT", null, true);//material
         GPU.initFrameBufferForTexture("nextMaterial", true);*/

        paused = false;
    }

    function onMouseMove(e) {
        lastMouseCoordinates = mouseCoordinates;
        mouseCoordinates = [e.clientX, actualHeight - e.clientY];
        updateObstaclePosition();
    }
    function onTouchMove(e) {
        e.preventDefault();
        var touch = e.touches[0];
        lastMouseCoordinates = mouseCoordinates;
        mouseCoordinates = [touch.pageX, actualHeight - touch.pageY];
        updateObstaclePosition();
    }

    function updateObstaclePosition() {
        if (movingObstacle) obstaclePosition = mouseCoordinates;
    }

    function onMouseDown() {
        var distToObstacle = [mouseCoordinates[0] - obstaclePosition[0], mouseCoordinates[1] - obstaclePosition[1]];
        if (distToObstacle[0] * distToObstacle[0] + distToObstacle[1] * distToObstacle[1] < obstacleRad * obstacleRad) {
            movingObstacle = true;
            mouseEnable = false;
        } else {
            mouseEnable = true;
            movingObstacle = false;
        }
    }

    function onMouseUp() {
        movingObstacle = false;
        mouseEnable = false;
    }
    var canvas = viewer.scene.canvas;
    //canvas.onmousemove = onMouseMove;
    //canvas.ontouchmove = onTouchMove;
    //canvas.onmousedown = onMouseDown;
    //canvas.ontouchstart = onMouseDown;
    //canvas.onmouseup = onMouseUp;
    //canvas.ontouchend = onMouseUp;
    //canvas.onmouseout = onMouseUp;
    //canvas.ontouchcancel = onMouseUp;

    var scene = viewer.scene;
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    var lastMesh = null;
    var clickRequest = false;
    var mouseCoords = new Cesium.Cartesian2();
    var ray = new Cesium.Ray();
    function coords3dTo2d(cartesian3, cartesian2) {
        var xPercent = (cartesian3.x - west) / (east - west);
        var yPercent = (cartesian3.y - south) / (north - south);
        if (!cartesian2) {
            cartesian2 = new Cesium.Cartesian2();
        }
        cartesian2.x = xPercent * actualWidth;
        cartesian2.y = yPercent * actualHeight;
        return cartesian2;
    }
    handler.setInputAction(function (movement) {
        meshVisualizer.getPickRay(movement.position, ray);
        if (ray) {
            coords3dTo2d(ray.origin, mouseCoords);
            onMouseDown({ clientX: mouseCoords.x, clientY: mouseCoords.y });
            if (mouseCoords.x >= 0 && mouseCoords.x <= actualWidth
                && mouseCoords.y >= 0 && mouseCoords.y <= actualHeight
                ) {
                scene.screenSpaceCameraController.enableInputs = false;
            }
            else {
                scene.screenSpaceCameraController.enableInputs = true;
            }
        } else {
            scene.screenSpaceCameraController.enableInputs = true;
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    handler.setInputAction(function (movement) {
        scene.screenSpaceCameraController.enableInputs = true;
    }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);

    handler.setInputAction(function (movement) {
        meshVisualizer.getPickRay(movement.endPosition, ray);
        if (ray) {
            coords3dTo2d(ray.origin, mouseCoords);
            if (mouseCoords.x >= 0 && mouseCoords.x <= actualWidth
              && mouseCoords.y >= 0 && mouseCoords.y <= actualHeight
              ) {
                onMouseMove({ clientX: mouseCoords.x, clientY: mouseCoords.y });
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(function (movement) {
        meshVisualizer.getPickRay(movement.endPosition || movement.position, ray);
        if (ray) {
            coords3dTo2d(ray.origin, mouseCoords);
            onMouseUp({ clientX: mouseCoords.x, clientY: mouseCoords.y });
            if (mouseCoords.x >= 0 && mouseCoords.x <= actualWidth
               && mouseCoords.y >= 0 && mouseCoords.y <= actualHeight
               ) {
                scene.screenSpaceCameraController.enableInputs = false;
            }
            else {
                scene.screenSpaceCameraController.enableInputs = true;
            }
        } else {
            scene.screenSpaceCameraController.enableInputs = true;
        }
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
}