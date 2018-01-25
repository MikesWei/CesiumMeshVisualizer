define([
    'Util/CSG' 
], function (CSG) {

    /**
    *
    *@constructor
    *@memberof Cesium
    */
    function GeometryUtils() {

    }

    function getAttrs(geo) {
        var attrNames = [];

        for (var name in geo.attributes) {
            if (geo.attributes.hasOwnProperty(name) && geo.attributes[name]) {
                attrNames.push(name);
            }
        }
        return attrNames
    }

    var scratchPosition = new Cesium.Cartesian3();
    var scratchQuaternion = new Cesium.Quaternion();
    var scratchMatrix4 = new Cesium.Matrix4();
    var scratchRotation = new Cesium.Matrix3();

    /**
    *绕x轴旋转，修改顶点坐标
    *@param {Cesium.Geometry}geometry
    *@param {Number}angle 弧度
    */
    GeometryUtils.rotateX = function (geometry, angle) {

        var positions = geometry.attributes.position.values;

        Cesium.Matrix3.fromRotationX(angle, scratchRotation);
        Cesium.Matrix4.fromRotationTranslation(scratchRotation, Cesium.Cartesian3.ZERO, scratchMatrix4);

        for (var i = 0; i < positions.length; i += 3) {
            scratchPosition.x = positions[i];
            scratchPosition.y = positions[i + 1];
            scratchPosition.z = positions[i + 2];
            Cesium.Matrix4.multiplyByPoint(scratchMatrix4, scratchPosition, scratchPosition);
            positions[i] = scratchPosition.x;
            positions[i + 1] = scratchPosition.y;
            positions[i + 2] = scratchPosition.z;
        }

    }
    /**
    *绕y轴旋转，修改顶点坐标
    *@param {Cesium.Geometry}geometry
    *@param {Number}angle 弧度
    */
    GeometryUtils.rotateY = function (geometry, angle) {

        var positions = geometry.attributes.position.values;

        Cesium.Matrix3.fromRotationY(angle, scratchRotation);
        Cesium.Matrix4.fromRotationTranslation(scratchRotation, Cesium.Cartesian3.ZERO, scratchMatrix4);

        for (var i = 0; i < positions.length; i += 3) {
            scratchPosition.x = positions[i];
            scratchPosition.y = positions[i + 1];
            scratchPosition.z = positions[i + 2];
            Cesium.Matrix4.multiplyByPoint(scratchMatrix4, scratchPosition, scratchPosition);
            positions[i] = scratchPosition.x;
            positions[i + 1] = scratchPosition.y;
            positions[i + 2] = scratchPosition.z;
        }

    }

    /**
    *绕z轴旋转，修改顶点坐标
    *@param {Cesium.Geometry}geometry
    *@param {Number}angle 弧度
    */
    GeometryUtils.rotateZ = function (geometry, angle) {

        var positions = geometry.attributes.position.values;

        Cesium.Matrix3.fromRotationZ(angle, scratchRotation);
        Cesium.Matrix4.fromRotationTranslation(scratchRotation, Cesium.Cartesian3.ZERO, scratchMatrix4);

        for (var i = 0; i < positions.length; i += 3) {
            scratchPosition.x = positions[i];
            scratchPosition.y = positions[i + 1];
            scratchPosition.z = positions[i + 2];
            Cesium.Matrix4.multiplyByPoint(scratchMatrix4, scratchPosition, scratchPosition);
            positions[i] = scratchPosition.x;
            positions[i + 1] = scratchPosition.y;
            positions[i + 2] = scratchPosition.z;
        }

    }
    /**
    *
    *@param {Cesium.Geometry}geometry
    */
    GeometryUtils.computeVertexNormals = function (geometry) {

        var indices = geometry.indices;
        var attributes = geometry.attributes;
        var il = indices.length;
        if (attributes.position) {

            var positions = attributes.position.values;

            if (attributes.normal === undefined) {
                attributes.normal = new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    values: new Float32Array(positions.length)
                })

            } else {

                // reset existing normals to zero

                var array = attributes.normal.values;

                for (var i = 0; i < il; i++) {

                    array[i] = 0;

                }

            }

            var normals = attributes.normal.values;

            var vA, vB, vC;
          
            var pA = new Cesium.Cartesian3(), pB = new Cesium.Cartesian3(), pC = new Cesium.Cartesian3();
            var cb = new Cesium.Cartesian3(), ab = new Cesium.Cartesian3();

            for (var i = 0; i < il; i += 3) {

                vA = indices[i + 0] * 3;
                vB = indices[i + 1] * 3;
                vC = indices[i + 2] * 3;

                Cesium.Cartesian3.fromArray(positions, vA, pA);
                Cesium.Cartesian3.fromArray(positions, vB, pB);
                Cesium.Cartesian3.fromArray(positions, vC, pC);
                  
                Cesium.Cartesian3.subtract(pC, pB, cb);
                Cesium.Cartesian3.subtract(pA, pB, ab);
                Cesium.Cartesian3.cross(cb, ab, cb);
                 
                normals[vA] += cb.x;
                normals[vA + 1] += cb.y;
                normals[vA + 2] += cb.z;

                normals[vB] += cb.x;
                normals[vB + 1] += cb.y;
                normals[vB + 2] += cb.z;

                normals[vC] += cb.x;
                normals[vC + 1] += cb.y;
                normals[vC + 2] += cb.z;

            }

            normalizeNormals(geometry);

            attributes.normal.needsUpdate = true;

        }

        return geometry;
    }
    function normalizeNormals(geometry) {

        var normals = geometry.attributes.normal.values;

        var x, y, z, n;

        for (var i = 0; i < normals.length; i += 3) {

            x = normals[i];
            y = normals[i + 1];
            z = normals[i + 2];

            n = 1.0 / Math.sqrt(x * x + y * y + z * z);

            normals[i] = x * n;
            normals[i + 1] = y * n;
            normals[i + 2] = z * n;
        }

    }

    /**
    *合并两个或两个以上图形类型（primitiveType），属性数量、名称以及属性值的类型（GeometryAttribute的componentDatatype、componentsPerAttribute等）都一致的几何体
    *@param {Array<Cesium.Geometry>}geometries 
    *@return {Cesium.Geometry}
    */
    GeometryUtils.mergeGeometries = function (geometries) {
        if (!geometries || !geometries.length) {
            throw new Error("缺少geometries参数");
        }

        if (geometries.length == 1) {
            return geometries[0];
        }
        var geometriesAttrs = [];

        var lengthChanged = false;
        var primitiveTypeChanged = false;
        var primitiveType = geometries[0].primitiveType;
        for (var i = 0; i < geometries.length; i++) {

            geometriesAttrs[i] = getAttrs(geometries[i]);
            if (i > 0) {
                if (primitiveType != geometries[i].primitiveType) {
                    primitiveTypeChanged = true;
                    break;
                }
                var lastGeoAttrs = geometriesAttrs[i - 1];
                lengthChanged = lastGeoAttrs.length != geometriesAttrs[i].length;
                if (!lengthChanged) {

                    for (var j = 0; j < lastGeoAttrs.length; j++) {
                        if (lastGeoAttrs[j] != geometriesAttrs[i][j]) {
                            lengthChanged = true;
                            break;
                        }

                    }
                }
            }
            primitiveType = geometries[i].primitiveType;
            if (lengthChanged || primitiveTypeChanged) {
                break;
            }
        }
        if (primitiveTypeChanged) {
            throw new Error("待合并的几何体中primitiveType属性不完全一致");
        }
        if (lengthChanged) {
            throw new Error("待合并的几何体中属性数量和和名称不完全一致");
        }
        var newAttrs = {};
        var attrNames = geometriesAttrs[0];
        for (var i = 0; i < attrNames.length; i++) {
            var attrName = attrNames[i];
            var geometry = geometries[0];
            newAttrs[attrName] = {};
            //newAttrs[attrName] = Cesium.clone(geometry.attributes[attrName]);
            for (var n in geometry.attributes[attrName]) {
                if (geometry.attributes[attrName].hasOwnProperty(n)) {
                    newAttrs[attrName][n] = geometry.attributes[attrName][n];
                }
            }
            var values = Array.from(newAttrs[attrName].values);

            for (var j = 1; j < geometries.length; j++) {
                geometry = geometries[j];
                for (var vi = 0; vi < geometry.attributes[attrName].values.length; vi++) {
                    values.push(geometry.attributes[attrName].values[vi]);
                }
            }

            newAttrs[attrName].values = new newAttrs[attrName].values.constructor(values);
        }
        var indices = [];
        var currIndex = 0;
        for (var j = 0; j < geometries.length; j++) {
            var geometry = geometries[0];
            for (var i = 0; i < geometry.indices.length; i++) {
                indices.push(geometry.indices[i] + currIndex);
            }
            currIndex += geometry.attributes.position.values.length / 3;
        }

        var bs = Cesium.BoundingSphere.fromVertices(newAttrs.position.values);
        var geo = new Cesium.Geometry({
            attributes: newAttrs,
            indices: new Int32Array(indices),
            primitiveType: geometries[0].primitiveType,
            boundingSphere: bs
        });
        return geo;
    }
    var scratchOffset = new Cesium.Cartesian3();
    /**
    *
    *@param {Cesium.Geometry}geometry
    *@param {Cesium.Cartesian3}offset
    */
    GeometryUtils.translate = function (geometry, offset) {
        if (Cesium.isArray(offset)) {
            scratchOffset.x = offset[0];
            scratchOffset.y = offset[1];
            scratchOffset.z = offset[2];
        } else {
            Cesium.Cartesian3.clone(offset, scratchOffset);
        }

        for (var i = 0; i < geometry.attributes.position.values.length; i += 3) {
            geometry.attributes.position.values[i] += scratchOffset.x;
            geometry.attributes.position.values[i + 1] += scratchOffset.y;
            geometry.attributes.position.values[i + 2] += scratchOffset.z;
        }
        //if (geometry.attributes.normal) {
        //    Cesium.GeometryPipeline.computeNormal(geometry);
        //}
    }

    /**
    *
    *@param {TypeArray} array
    *@return {Cesium.ComponentDatatype}  
    */
    GeometryUtils.getAttributeComponentType = function (array) {

        var attributeComponentType = Cesium.ComponentDatatype.SHORT;
        if (array instanceof Int8Array) {
            attributeComponentType = Cesium.ComponentDatatype.BYTE;

        } else if (array instanceof Uint8Array || array instanceof Uint8ClampedArray) {
            attributeComponentType = Cesium.ComponentDatatype.UNSIGNED_BYTE;

        } else if (array instanceof Int16Array) {
            attributeComponentType = Cesium.ComponentDatatype.SHORT;

        } else if (array instanceof Uint16Array) {
            attributeComponentType = Cesium.ComponentDatatype.UNSIGNED_SHORT;

        } else if (array instanceof Int32Array) {
            attributeComponentType = Cesium.ComponentDatatype.INT;

        } else if (array instanceof Uint32Array) {
            attributeComponentType = Cesium.ComponentDatatype.UNSIGNED_INT;

        } else if (array instanceof Float32Array) {
            attributeComponentType = Cesium.ComponentDatatype.FLOAT;

        } else if (array instanceof Float64Array) {
            attributeComponentType = Cesium.ComponentDatatype.DOUBLE;

        }

        return attributeComponentType;

    }

    /**
    *
    *@param {Object}geometry
    *@return {Boolean}
    */
    GeometryUtils.isGeometry3js = function (geometry) {
        return (typeof THREE !== 'undefined' && (geometry instanceof THREE.Geometry || geometry instanceof THREE.BufferGeometry))
            || (geometry.attributes && geometry.attributes.position && geometry.index)
            || (geometry.vertices && geometry.faces);
    }
    
    /**
     *
     *@param {THREE.BufferGeometry}geometry 
     *@private
     */
    GeometryUtils.parseBufferGeometry3js = function (geometry) {
        // var start = new Date();

        var attributes = {};
        if (!geometry.attributes.normal) {
            geometry.computeFaceNormals();
        }
        for (var attrName in geometry.attributes) {

            if (geometry.attributes.hasOwnProperty(attrName)) {
                var attr = geometry.getAttribute(attrName);
                if (attr && attr.array.length > 0) {

                    attributes[attrName] = new Cesium.GeometryAttribute({
                        componentDatatype: GeometryUtils.getAttributeComponentType(attr.array),
                        componentsPerAttribute: attr.itemSize,
                        values: attr.array,
                        normalize: attr.normalized
                    });

                }

            }
        }
        var indices=[];
        if (!geometry.index&&geometry.groups) {
            geometry.groups.forEach(function (group) {
                for (var i = 0; i < group.count; i++) {
                    indices.push(i+group.start);
                }
            })
            indices = new Int32Array(indices);
        }else{
            indices=geometry.index.array;
        }
        var cesGeometry = new Cesium.Geometry({
            attributes: attributes,
            indices: indices,
            primitiveType: Cesium.PrimitiveType.TRIANGLES
        });

        return cesGeometry;
    }

    /**
    *
    *@param {THREE.Geometry}geometry3js
    *@return {Cesium.Geometry} 
    */
    GeometryUtils.fromGeometry3js = function (geometry3js) {
        
        if (geometry3js.attributes && (geometry3js.index||geometry3js.groups.length)) {
            return GeometryUtils.parseBufferGeometry3js(geometry3js);
        }
        var positions = new Float32Array(geometry3js.vertices.length * 3);
        for (var i = 0; i < geometry3js.vertices.length; i++) {
            positions[i * 3] = geometry3js.vertices[i].x;
            if (!geometry3js.up || geometry3js.up.y) {
                positions[i * 3 + 1] = geometry3js.vertices[i].z;
                positions[i * 3 + 2] = geometry3js.vertices[i].y;
            } else {
                positions[i * 3 + 1] = geometry3js.vertices[i].y;
                positions[i * 3 + 2] = geometry3js.vertices[i].z;
            }
        }
        var indices = new Int32Array(geometry3js.faces.length * 3);
        for (var i = 0; i < geometry3js.faces.length; i++) {
            indices[i * 3] = geometry3js.faces[i].a;
            indices[i * 3 + 1] = geometry3js.faces[i].b;
            indices[i * 3 + 2] = geometry3js.faces[i].c;
        }
        var attributes = {};
        attributes.position = new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 3,
            values: positions
        });
        var cesGeometry = new Cesium.Geometry({
            attributes: attributes,
            indices: indices,
            primitiveType: Cesium.PrimitiveType.TRIANGLES
        });
        return cesGeometry;
    }
    /**
    *
    *@param {Cesium.Geometry}geometry
    *@return {THREE.Geometry} 
    */
    GeometryUtils.toGeometry3js = function (geometry) {
        if (typeof THREE === 'undefined') {
            throw new Error("THREE 未加载");
        }

        var positions = geometry.attributes.position.values;
        var positionIdx = 0;

        var geometry3js = new THREE.Geometry();

        for (var i = 0; i < positions.length  ; i += 3) {
            positionIdx = i * 3;
            geometry3js.vertices.push(
                 new THREE.Vector3(positions[positionIdx], positions[positionIdx + 2], positions[positionIdx + 1])
             );
        }

        for (var i = 0; i < geometry.indices.length  ; i += 3) {
            var idx1 = geometry.indices[i];
            var idx2 = geometry.indices[i + 1];
            var idx3 = geometry.indices[i + 2];
            geometry3js.faces.push(new THREE.Face3(idx1, idx2, idx3));
        }

        return geometry3js;
    }

    /**
   *@param {Cesium.Geometry|THREE.Geometry}
   *@param {Cesium.Cartesian3}[offset]
   *@return {CSG}
   */
    GeometryUtils.toCSG = function (geometry, offset) {
        if (!(typeof THREE === 'undefined')) {
            if (geometry instanceof THREE.Geometry) {
                return GeometryUtils._toCSG3js(geometry, offset);
            }
        }
        if (!offset) {
            offset = { x: 0, y: 0, z: 0 };
        }
        if (!geometry.attributes.normal) {
            geometry = Cesium.GeometryPipeline.computeNormal(geometry);
        }
        if (geometry.primitiveType !== Cesium.PrimitiveType.TRIANGLES) {
            throw new Error("暂不支持此类几何体");
        }
        if (!CSG) {
            throw new Error('CSG 库未加载。请从 https://github.com/evanw/csg.js 获取');
        }
        var faceCount = geometry.indices.length / 3;
        var polygons = [], vertices = [];
        var positions = geometry.attributes.position.values;
        var normals = geometry.attributes.normal.values;
        var normalIdx = 0, positionIdx = 0;

        for (var i = 0; i < geometry.indices.length  ; i += 3) {
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
    *@param {Boolean}[toGeometry3js=false]
    *@return {Cesium.Geometry|THREE.Geometry}
    */
    GeometryUtils.fromCSG = function (csg_model, toGeometry3js) {
        if (!(typeof THREE === 'undefined')) {
            if (geometry instanceof THREE.Geometry) {
                return GeometryUtils._fromCSG3js(geometry, offset);
            }
        }
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

    GeometryUtils._toCSG3js = function (three_model, offset, rotation) {
        if (typeof THREE === 'undefined') {
            throw new Error("THREE 未加载");
        }

        var i, geometry, polygons, vertices, rotation_matrix;

        if (!CSG) {
            throw 'CSG library not loaded. Please get a copy from https://github.com/evanw/csg.js';
        }

        if (three_model instanceof THREE.Mesh) {
            geometry = three_model.geometry;
            offset = offset || three_model.position;
            rotation = rotation || three_model.rotation;
        } else if (three_model instanceof THREE.Geometry) {
            geometry = three_model;
            offset = offset || new THREE.Vector3(0, 0, 0);
            rotation = rotation || new THREE.Euler(0, 0, 0);
        } else {
            throw 'Model type not supported.';
        }
        rotation_matrix = new THREE.Matrix4().makeRotationFromEuler(rotation);

        var polygons = [];
        for (i = 0; i < geometry.faces.length; i++) {
            if (geometry.faces[i] instanceof THREE.Face3) {

                vertices = [];
                vertices.push(new CSG.Vertex(geometry.vertices[geometry.faces[i].a].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
                vertices.push(new CSG.Vertex(geometry.vertices[geometry.faces[i].b].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
                vertices.push(new CSG.Vertex(geometry.vertices[geometry.faces[i].c].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
                polygons.push(new CSG.Polygon(vertices));

            } else if (geometry.faces[i] instanceof THREE.Face4) {

                vertices = [];
                vertices.push(new CSG.Vertex(geometry.vertices[geometry.faces[i].a].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
                vertices.push(new CSG.Vertex(geometry.vertices[geometry.faces[i].b].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
                vertices.push(new CSG.Vertex(geometry.vertices[geometry.faces[i].d].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
                polygons.push(new CSG.Polygon(vertices));

                vertices = [];
                vertices.push(new CSG.Vertex(geometry.vertices[geometry.faces[i].b].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
                vertices.push(new CSG.Vertex(geometry.vertices[geometry.faces[i].c].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
                vertices.push(new CSG.Vertex(geometry.vertices[geometry.faces[i].d].clone().add(offset).applyMatrix4(rotation_matrix), [geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z]));
                polygons.push(new CSG.Polygon(vertices));

            } else {
                throw 'Model contains unsupported face.';
            }
        }

        return CSG.fromPolygons(polygons);
    }

    GeometryUtils._fromCSG3js = function (csg_model) {
        if (typeof THREE === 'undefined') {
            throw new Error("THREE 未加载");
        }
        var i, j, vertices, face,
            three_geometry = new THREE.Geometry(),
            polygons = csg_model.toPolygons();

        if (!CSG) {
            throw 'CSG library not loaded. Please get a copy from https://github.com/evanw/csg.js';
        }

        for (i = 0; i < polygons.length; i++) {

            // Vertices
            vertices = [];
            for (j = 0; j < polygons[i].vertices.length; j++) {
                vertices.push(GeometryUtils._getGeometryVertice3js(three_geometry, polygons[i].vertices[j].pos));
            }
            if (vertices[0] === vertices[vertices.length - 1]) {
                vertices.pop();
            }

            for (var j = 2; j < vertices.length; j++) {
                face = new THREE.Face3(vertices[0], vertices[j - 1], vertices[j], new THREE.Vector3().copy(polygons[i].plane.normal));
                three_geometry.faces.push(face);
                three_geometry.faceVertexUvs[0].push(new THREE.Vector2());
            }
        }

        three_geometry.computeBoundingBox();

        return three_geometry;
    },

    GeometryUtils._getGeometryVertice3js = function (geometry, vertice_position) {
        var i;
        for (i = 0; i < geometry.vertices.length; i++) {
            if (geometry.vertices[i].x === vertice_position.x && geometry.vertices[i].y === vertice_position.y && geometry.vertices[i].z === vertice_position.z) {
                // Vertice already exists
                return i;
            }
        };

        geometry.vertices.push(new THREE.Vector3(vertice_position.x, vertice_position.y, vertice_position.z));
        return geometry.vertices.length - 1;
    }

    return GeometryUtils;
})
