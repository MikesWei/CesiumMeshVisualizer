define([], function () {

    /**
    *
    *@param {Object}options
    *@param {Array<Number>|Float32Array}options.positions
    *@param {Array<Number>|Int32Array}options.indices
    *@param {Array<Number>|Float32Array}[options.normals]
    *@param {Array<Number>|Float32Array}[options.uvs]
    *
    *@memberof Cesium
    *@constructor
    */
    function BasicGeometry(options) {
        this.positions = options.positions;
        this.normals = options.normals;
        this.uvs = options.uvs;
        this.indices = options.indices;
    }
    /**
    *
    *@param {Cesium.BasicGeometry}basicGeometry
    *@return {Cesiumm.Geometry} 
    */
    BasicGeometry.createGeometry = function (basicGeometry) {
        if (!basicGeometry.positions) {
            throw new Error("缺少positions参数");
        }
        if (!basicGeometry.indices) {
            throw new Error("缺少indices参数");
        }
        var positions = basicGeometry.positions;
        var normals = basicGeometry.normals;
        var uvs = basicGeometry.uvs;
        var indices = basicGeometry.indices instanceof Int32Array ? basicGeometry.indices : new Int32Array(basicGeometry.indices);

        var attributes = {
            position: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute: 3,
                values: positions instanceof Float32Array ? positions : new Float32Array(basicGeometry.positions)
            })
        };
        if (normals) {
            attributes.normal = new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: normals instanceof Float32Array ? normals : new Float32Array(normals)
            })
        }
        if (uvs) {
            attributes.uv = new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 2,
                values: uvs instanceof Float32Array ? uvs : new Float32Array(uvs)
            })
        }


        var bs = Cesium.BoundingSphere.fromVertices(positions);
        var geo = new Cesium.Geometry({
            attributes: attributes,
            indices: new Int32Array(indices),
            primitiveType: Cesium.PrimitiveType.TRIANGLES,
            boundingSphere: bs
        });
        return geo;
    }
    return BasicGeometry;
})