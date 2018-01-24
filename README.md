#CesiumMeshVisualizer 

###https://mikeswei.github.io/CesiumMeshVisualizer/Document/index.html
 <a href="https://mikeswei.github.io/CesiumMeshVisualizer/Document/index.html" target="_blank">Document</a>
    <hr />
    demos:<br />
    <a target="_blank" href="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/CSG/index.html">
           <img src="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/CSG/screenshot.jpg" /> 
    </a><br />
    <a target="_blank" href="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/CSG/index.html">CSG</a><br /><br />
    <a target="_blank" href="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/LOD/index.html">
       <img src="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/LOD/screenshot.jpg" /> 
    </a><br />
    <a target="_blank" href="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/LOD/index.html">LOD</a><br /><br />
   <a target="_blank" href="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/MeshVisualizer/index.html">MeshVisualizer</a><br /><br />
<a target="_blank" href="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/physics/helloworld.html">physics/helloworld</a><br/><br />
  <a target="_blank" href="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/physics/cloth.html">
        <img src="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/physics/cloth.jpg" />
     </a><br /> 
    <a target="_blank" href="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/physics/cloth.html">physics/cloth</a><br /><br />
    <a target="_blank" href="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/physics/vehicle.html">
       <img src="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/physics/vehicle.jpg" />
    </a><br /> 
   <a target="_blank" href="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/physics/vehicle.html">physics/vehicle</a><br /><br />
   <a target="_blank" href="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/ReferenceMesh/index.html">ReferenceMesh</a><br /><br />
   <a target="_blank" href="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/VolumeRendering/index.html">
     <img src="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/VolumeRendering/screenshot.jpg" /> 
   </a><br />
 <a target="_blank" href="https://mikeswei.github.io/CesiumMeshVisualizer/App/demo/VolumeRendering/index.html">VolumeRendering</a><br />

Example<br/>


        MeshVisualizer = Cesium.MeshVisualizer;
        Mesh = Cesium.Mesh;
        MeshMaterial = Cesium.MeshMaterial; 
        FramebufferTexture = Cesium.FramebufferTexture;

        var center = Cesium.Cartesian3.fromDegrees(homePosition[0], homePosition[1], 50000);
        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

        var meshVisualizer = new MeshVisualizer({
            modelMatrix: modelMatrix,
        });
        viewer.scene.primitives.add(meshVisualizer);


        //示例1：Cesium.Geometry+Cesium.MeshMaterial组合
        var box = Cesium.BoxGeometry.createGeometry(Cesium.BoxGeometry.fromDimensions({
            dimensions: new Cesium.Cartesian3(100000, 50000, 50000),
            vertexFormat: Cesium.VertexFormat.POSITION_ONLY
        }));
        
        var material = new MeshMaterial({
            defaultColor: "rgba(255,0,0,1.0)",
            wireframe: false,
            side: MeshMaterial.Sides.DOUBLE
        });
        var boxMesh = new Mesh(box, material);

        meshVisualizer.add(boxMesh);

        //示例2：Cesium.CSG+Cesium.MeshMaterial组合，可以用Cesium.CSG做布尔运算并渲染运算结果

        //首先使用Cesium创建球体
         var sphere = new Cesium.SphereGeometry({
             radius: 50000.0,
             vertexFormat: Cesium.VertexFormat.POSITION_ONLY
         });
         sphere = Cesium.SphereGeometry.createGeometry(sphere);
        
         var sphereMesh = new Mesh(sphere, material);
         sphereMesh.position = new Cesium.Cartesian3(100000, 0, 0)
         meshVisualizer.add(sphereMesh);

         //将球体对象Cesium.SphereGeometry转成Cesium.CSG实例
         sphere = CSG.toCSG(sphere);
         //将盒子对象转成Cesium.CSG实例
         box = CSG.toCSG(box);

          //做布尔运算
          var subResult = sphere.subtract(box);
          //渲染运算结果
          var subResultMesh = new Mesh(subResult, material);
          subResultMesh.position = new Cesium.Cartesian3(700000, 0, 0)
          meshVisualizer.add(subResultMesh);

          //示例3：使用帧缓存作纹理,实际应用中如体绘制，风场流场绘制等等都可以运用此技术

          function createGeometry() {
            var p1 = new Cesium.Cartesian3(-50000, 50000, 100);
            var p2 = new Cesium.Cartesian3(-50000, -50000, 100);
            var p3 = new Cesium.Cartesian3(50000, -50000, 100);
            var p4 = new Cesium.Cartesian3(50000, 50000, 100);

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
              1, 1,
              1, 0,
              0, 0,
              0, 1
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
        //将上文中的盒子渲染到缓存，作为纹理参与createGeometry（）方法创建的几何体渲染过程
        var framebufferTex = new FramebufferTexture(boxMesh);
        var geometry = createGeometry();
        var customMesh = new Mesh(geometry, new MeshMaterial({

            uniforms: {
                u_textureMap: framebufferTex//Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/STK.png')
            },
            side: MeshMaterial.Sides.DOUBLE,
            vertexShader : "\n\
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
            fragmentShader : "varying vec2 v_st;\
                uniform sampler2D u_textureMap;\
                void main()\
                {\
                gl_FragColor = texture2D(u_textureMap,v_st);\n\
                \
                }\
                "
        }));
        customMesh.position = new Cesium.Cartesian3(100000, 0, 0);
        meshVisualizer.add(customMesh);
