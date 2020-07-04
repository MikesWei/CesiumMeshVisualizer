 
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

var arrayBufferView = new Float32Array(
    viewer.scene.canvas.width *
    viewer.scene.canvas.height * 4
);

for (var index = 0; index < arrayBufferView.length; index += 4) {
    var rgb = index * 10;
    arrayBufferView[index] = rgb;
    arrayBufferView[index + 1] = rgb;
    arrayBufferView[index + 2] = rgb;
    arrayBufferView[index + 3] = 255;
};

var heightTex = new Cesium.Texture({
    context: viewer.scene.frameState.context,
    width: viewer.scene.canvas.width,
    height: viewer.scene.canvas.height,
    pixelFormat: Cesium.PixelFormat.RGBA,
    pixelDatatype: Cesium.PixelDatatype.FLOAT,
    source: {
        arrayBufferView: arrayBufferView
    }
})

var geometry = createGeometry();
var customMesh = new Mesh(geometry, new MeshMaterial({

    uniforms: {
        dimensions: new Cesium.Cartesian3(arrayBufferView.length * 10, arrayBufferView.length * 10, arrayBufferView.length * 10),
        u_textureMap: heightTex
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
    fragmentShader: "varying vec2 v_st;\n\
                uniform vec3 dimensions;\n\
                uniform sampler2D u_textureMap;\n\
                void main()\n\
                {\n\
                vec4 color=texture2D(u_textureMap,v_st);\n\
                color=vec4(color.rgb/dimensions,1.);\n\
                if(color.a<1.0)color.a=1.0;\n\
                gl_FragColor = color;\n\
                \
                }\
                "
}));
customMesh.position = new Cesium.Cartesian3(100000, 0, 0);
meshVisualizer.add(customMesh);
