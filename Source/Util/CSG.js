import CSG from '../ThirdParty/csg/csg.js';

/**
*@param {Cesium.Geometry}
*@param {Cesium.Cartesian3}[offset]
*@return {CSG}
*/
CSG.toCSG = function (geometry, offset) {
    if (!offset) {
        offset = { x: 0, y: 0, z: 0 };
    }
    if (!geometry.attributes.normal) {
        geometry = Cesium.GeometryPipeline.computeNormal(geometry);
    }
    if (geometry.primitiveType !== Cesium.PrimitiveType.TRIANGLES) {
        throw new Error("暂不支持此类几何体");
    }
     
    var polygons = [], vertices = [];
    var positions = geometry.attributes.position.values;
    var normals = geometry.attributes.normal.values;
    var normalIdx = 0, positionIdx = 0;

    for (var i = 0; i < geometry.indices.length; i += 3) {
        vertices = [];

        var idx1 = geometry.indices[i];
        var idx2 = geometry.indices[i + 1];
        var idx3 = geometry.indices[i + 2];

        positionIdx = idx1 * 3;
        normalIdx = idx1 * 3;

        vertices.push(new CSG.Vertex(
            [positions[positionIdx++] + offset.x, positions[positionIdx++] + offset.y, positions[positionIdx++] + offset.z],
            [normals[normalIdx++], normals[normalIdx++], normals[normalIdx++]]
        ));

        positionIdx = idx2 * 3;
        normalIdx = idx2 * 3;
        vertices.push(new CSG.Vertex(
            [positions[positionIdx++] + offset.x, positions[positionIdx++] + offset.y, positions[positionIdx++] + offset.z],
            [normals[normalIdx++], normals[normalIdx++], normals[normalIdx++]]
        ));

        positionIdx = idx3 * 3;
        normalIdx = idx3 * 3;
        vertices.push(new CSG.Vertex(
            [positions[positionIdx++] + offset.x, positions[positionIdx++] + offset.y, positions[positionIdx++] + offset.z],
            [normals[normalIdx++], normals[normalIdx++], normals[normalIdx++]]
        ));
        polygons.push(new CSG.Polygon(vertices));
    }
    return CSG.fromPolygons(polygons);
}
/**
*@param {CSG}csg_model
*@return {Cesium.Geometry}
*/
CSG.fromCSG = function (csg_model) {
    var i, j, vertices,
        polygons = csg_model.toPolygons();

    if (!CSG) {
        throw new Error('CSG 库未加载。请从 https://github.com/evanw/csg.js 获取');
    }

    var positions = [];
    var normals = [];
    var indices = [];

    for (i = 0; i < polygons.length; i++) {

        // Vertices
        vertices = [];
        for (j = 0; j < polygons[i].vertices.length; j++) {
            vertices.push(this.getGeometryVertice(positions, normals, polygons[i].vertices[j].pos, polygons[i].plane.normal));
        }
        if (vertices[0] === vertices[vertices.length - 1]) {
            vertices.pop();
        }

        for (var j = 2; j < vertices.length; j++) {
            indices.push(vertices[0], vertices[j - 1], vertices[j]);
        }
    }

    positions = new Float32Array(positions);
    normals = new Float32Array(normals);

    indices = new Int32Array(indices);
    var attributes = {};
    attributes.position = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: positions
    });
    attributes.normal = new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: normals
    });

    var cesGeometry = new Cesium.Geometry({
        attributes: attributes,
        indices: indices,
        primitiveType: Cesium.PrimitiveType.TRIANGLES
    });

    return cesGeometry;
}
/**
*@param {Array<Number>}positions
*@param {Array<Number>}normals
*@param {Cesium.CSG.Vector}vertice_position
*@param {Cesium.CSG.Vector}plane_normal
*@return {Number}
*@private
*/
CSG.getGeometryVertice = function (positions, normals, vertice_position, plane_normal) {
    var i, idx = 0;
    for (i = 0; i < positions.length; i += 3) {
        if (positions[i] === vertice_position.x
            && positions[i + 1] === vertice_position.y
            && positions[i + 2] === vertice_position.z) {
            // Vertice already exists
            return idx;
        }
        idx++;
    };

    positions.push(vertice_position.x, vertice_position.y, vertice_position.z);
    normals.push(plane_normal.x, plane_normal.y, plane_normal.z);
    return idx;
}

export default CSG;