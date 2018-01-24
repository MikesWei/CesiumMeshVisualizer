define(function () {

    /**
    *
      <pre><code>  
        p1++++++++++++p4
        +          +  +
        +       +     +
        +     +       +
        +   +         +
        + +           +
        p2++++++++++++p3
        </code> </pre>
    *@param {Object}options 
    *@param {Array<Number|Cesium.Cartesian3>}options.positions [p1,p2,p3,p4]或者[p1.x,p1.y,p1.z,p2.x,...,p4.z] 
    *
    *@property {Array<Number|Cesium.Cartesian3>}positions 
    *
    *@constructor
    *@memberof Cesium
    */
    function PlaneGeometry(options) {//positions, widthSegments, heightSegments) {
        this.type = 'PlaneGeometry';
        if (!options || !options.positions) {
            throw new Error("缺少positions参数");
        }
        if (options.positions.length != 4 && options.positions.length / 3 != 4) {
            throw new Error("positions参数必须包含四个顶点的位置坐标");
        }
        this.positions = options.positions;

    }
    /**
    *
    *@param {Cesium.PlaneGeometry}
    *@return {Cesium.Geometry}
    */
    PlaneGeometry.createGeometry = function (planeGeometry) {
        var positions = planeGeometry.positions;

        var positionsVal;
        if (Cesium.isArray(positions)) {
            if (positions[0] instanceof Cesium.Cartesian3) {
                positionsVal = new Float32Array(12);
                for (var i = 0; i < positions.length; i++) {
                    var p = positions[i];
                    positionsVal[i * 3] = p.x;
                    positionsVal[i * 3 + 1] = p.y;
                    positionsVal[i * 3 + 2] = p.z;
                }
            } else if (typeof positions[0] === 'number') {
                positionsVal = new Float32Array(positionsVal);
            } else {
                throw new Error("positions参数有误");
            }
        } else {
            throw new Error("positions参数必须是数组类型");
        }
        var indices = new Int32Array([0, 1, 3, 1, 2, 3]);
        var attributes = {
            position: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute: 3,
                values: positions
            })
        };
        var bs = Cesium.BoundingSphere.fromVertices(positions);
        var geo = new Cesium.Geometry({
            attributes: attributes,
            indices: new Int32Array(indices),
            primitiveType: Cesium.PrimitiveType.TRIANGLES,
            boundingSphere: bs
        });
        return geo;
    }
    return PlaneGeometry
})