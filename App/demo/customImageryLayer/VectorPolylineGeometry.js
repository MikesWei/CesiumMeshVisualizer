import { GeometryUtils } from "../../../Source/Main.js";

function find_crossPoint(p1, p2, p3, p4, crossPoint) {
    //****************************************************************************************
    //  求二条直线的交点的公式
    //  有如下方程 (x-x1)/(y-y1) = (x2-x1)/(y2-y1) ==> a1*x+b1*y=c1
    //            (x-x3)/(y-y3) = (x4-x3)/(y4-y3) ==> a2*x+b2*y=c2
    //  则交点为
    //                x= | c1 b1|  / | a1 b1 |      y= | a1 c1| / | a1 b1 |
    //                   | c2 b2|  / | a2 b2 |         | a2 c2| / | a2 b2 |
    //
    //   a1= y2-y1
    //   b1= x1-x2
    //   c1= x1*y2-x2*y1
    //   a2= y4-y3
    //   b2= x3-x4
    //   c2= x3*y4-x4*y3

    var a1 = p2.y - p1.y;
    var b1 = p1.x - p2.x;
    var c1 = p1.x * p2.y - p2.x * p1.y;
    var a2 = p4.y - p3.y;
    var b2 = p3.x - p4.x;
    var c2 = p3.x * p4.y - p4.x * p3.y;
    var det = a1 * b2 - a2 * b1;

    if (det == 0) return det;

    crossPoint.x = (c1 * b2 - c2 * b1) / det;
    crossPoint.y = (a1 * c2 - a2 * c1) / det;

    // var abs = Math.abs
    // Now this is cross point of lines
    // Do we need the cross Point of segments(need to judge x,y within 4 endpoints)
    // 是否要判断线段相交
    // if ((abs(crossPoint.x - (p1.x + p2.x) / 2) <= abs(p2.x - p1.x) / 2) &&
    //     (abs(crossPoint.y - (p1.y + p2.y) / 2) <= abs(p2.y - p1.y) / 2) &&
    //     (abs(crossPoint.x - (p3.x + p4.x) / 2) <= abs(p4.x - p3.x) / 2) &&
    //     (abs(crossPoint.y - (p3.y + p4.y) / 2) <= abs(p4.y - p3.y) / 2)) {
    //     return true;
    // }

    return det;
}

function rotate90(p1, p2) {
    var dir = Cesium.Cartesian2.subtract(p1, p2, new Cesium.Cartesian2());
    Cesium.Cartesian2.normalize(dir, dir);
    dir = new Cesium.Cartesian2(-dir.y, dir.x);//旋转90度
    return dir;
}

function find_corner_dir(pt, prevPt, nextPt, lineW) {

    var dir1 = rotate90(prevPt, pt);
    var dir2 = rotate90(pt, nextPt);
    Cesium.Cartesian2.multiplyByScalar(dir1, lineW, dir1);
    Cesium.Cartesian2.multiplyByScalar(dir2, lineW, dir2);

    var pt1 = Cesium.Cartesian2.add(dir1, pt, new Cesium.Cartesian2());
    var pt2 = Cesium.Cartesian2.add(dir2, pt, new Cesium.Cartesian2());

    var prevPt1 = Cesium.Cartesian2.add(dir1, prevPt, new Cesium.Cartesian2());
    var nextPt2 = Cesium.Cartesian2.add(dir2, nextPt, new Cesium.Cartesian2());

    var crossPt = new Cesium.Cartesian2();
    var det = find_crossPoint(prevPt1, pt1, pt2, nextPt2, crossPt)
    if (!det) {
        var dir = rotate90(prevPt, pt);
        return Cesium.Cartesian2.multiplyByScalar(dir, lineW, dir);
    }

    var dir = Cesium.Cartesian2.subtract(crossPt, pt, new Cesium.Cartesian2());
    if (checkDir(dir, lineW)) {
        dir = rotate90(prevPt, pt);
        return Cesium.Cartesian2.multiplyByScalar(dir, lineW, dir);
    }
    return dir;
}

function checkDir(dir, lineWidth) {
    dir = Cesium.Cartesian2.divideByScalar(dir, lineWidth, new Cesium.Cartesian2());
    var m = Cesium.Cartesian2.magnitude(dir)
    return m > lineWidth * 2;
}
/**
 * 
 * @param {Vector2} pt 
 * @param {Vector2} prevPt 
 * @param {Vector2} nextPt 
 */
function lineBufferDir(pt, prevPt, nextPt, lineWidth) {

    var centerDir;
    if (!nextPt) {
        centerDir = rotate90(prevPt, pt);
        Cesium.Cartesian2.multiplyByScalar(centerDir, lineWidth, centerDir);
        checkDir(centerDir, lineWidth);
        return centerDir;
    } else if (!prevPt) {
        centerDir = rotate90(nextPt, pt);
        Cesium.Cartesian2.multiplyByScalar(centerDir, lineWidth, centerDir);
        checkDir(centerDir, lineWidth);
        return centerDir;
    } else {
        centerDir = find_corner_dir(pt, prevPt, nextPt, lineWidth);
        return centerDir;
    }
}

/**
 * 
 * @param {object} options 
 * @param {number[][]|Vector2[]} options.coordinates
 * @extends BufferGeometry
 */
function VectorPolylineGeometry(options) {
    if (Cesium.defined(options.featureId) && options.featureId > 65535) {
        throw Cesium.DeveloperError('FeatureId must less than or eaqual to 65535.')
    }
    this.featureId = Cesium.defaultValue(options.featureId, 0);
    this.primitiveType = options.line ? Cesium.PrimitiveType.LINES : Cesium.PrimitiveType.TRIANGLES;
    if (Cesium.defined(options.primitiveType)) {
        this.primitiveType = options.primitiveType;
    }
    /**
     * @type {Vector2[]}
     */
    this.coordinates = [];

    var lastCoord;
    for (var index = 0; index < options.coordinates.length; index++) {
        var coord = options.coordinates[index];
        if (Array.isArray(coord)) {
            coord = new Cesium.Cartesian2(coord[0], coord[1]);
            if (!lastCoord || !lastCoord.equals(coord)) {//去重 
                this.coordinates.push(coord);
                lastCoord = coord.clone();
            }
        }
    }

}
/**
 * 
 * @param {VectorPolylineGeometry} polylineGeometry 
 * @return {Cesium.Geometry}
 */
VectorPolylineGeometry.createGeometry = function (polylineGeometry) {
    var pts = polylineGeometry.coordinates;
    var primitiveType = polylineGeometry.primitiveType;
    var featureId = polylineGeometry.featureId;

    var positions = [], dirs = [], featureIds = [],
        sideMasks = [], distances = [];
    var indices = [];
    var isClosed = polylineGeometry.coordinates.length >= 4 && pts[pts.length - 1].equals(
        pts[0]
    );
    var distance = 0;

    for (var index = 0; index < pts.length; index++) {
        var pt = pts[index];
        var prevPt = null, nextPt = null;
        var sign = -1;

        distance += index > 0 ? Cesium.Cartesian2.distance(pt, pts[index - 1]) : 0;

        if (index == 0) {
            if (isClosed) {
                prevPt = pts[pts.length - 2], nextPt = pts[1];
            } else {
                nextPt = pts[1];
                sign = 1;
            }
        } else if (index == pts.length - 1) {
            if (isClosed) {
                prevPt = pts[pts.length - 2], nextPt = pts[1];
            } else {
                prevPt = pts[pts.length - 2];
            }
        } else {
            prevPt = pts[index - 1], nextPt = pts[index + 1];
        }

        var lineWidth = 1;
        var dir = lineBufferDir(pt, prevPt, nextPt, lineWidth);
        dirs.push(sign * dir.x / lineWidth, sign * dir.y / lineWidth,
            sign * dir.x / lineWidth, sign * dir.y / lineWidth);

        positions.push(pt.x, pt.y, 0, pt.x, pt.y, 0);
        featureIds.push(featureId, featureId);
        sideMasks.push(-1, 1);
        distances.push(distance, distance);
    }

    for (var index = 1; index < pts.length; index++) {
        var i0 = (index - 1) * 2,
            i1 = (index - 1) * 2 + 1,
            i2 = index * 2 + 1,
            i3 = index * 2;
        if (primitiveType == Cesium.PrimitiveType.LINES) {
            indices.push(i0, i3, i1, i2);
        }
        else {
            indices.push(i0, i1, i3, i1, i2, i3);
        }
    }

    if (positions.length / 3 < 65535) {
        indices = new Uint16Array(indices);
    } else {
        indices = new Uint32Array(indices);
    }

    return new Cesium.Geometry({
        attributes: {
            position: {
                values: new Float32Array(positions),
                componentsPerAttribute: 3,
                componentDatatype: Cesium.ComponentDatatype.FLOAT
            },
            bufferDir: {
                values: new Float32Array(dirs),
                componentsPerAttribute: 2,
                componentDatatype: Cesium.ComponentDatatype.FLOAT
            },
            featureId: {
                values: new Uint16Array(featureIds),
                componentsPerAttribute: 1,
                componentDatatype: Cesium.ComponentDatatype.UNSIGNED_SHORT
            },
            distanceToStart: {
                values: new Float32Array(distances),
                componentsPerAttribute: 1,
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
            },

            sideMask: {
                values: new Int8Array(sideMasks),
                componentsPerAttribute: 1,
                componentDatatype: Cesium.ComponentDatatype.BYTE
            }
        },
        indices: indices,
        primitiveType: primitiveType
    })
}

/**
 * 
 * @param {geojson.FeatureCollection<geojson.Shape>} features 
 * @param {Cesium.PrimitiveType} primitiveType 
 * @param {(feature)=>boolean} filter 
 */
VectorPolylineGeometry.fromFeatures = function (features, primitiveType, filter) {
    if (!filter && typeof primitiveType == 'function') {
        filter = primitiveType;
    }
    Cesium.defaultValue(primitiveType, Cesium.PrimitiveType.TRIANGLES)
    var bbox = [Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];

    var calcBBox = false;
    var geometries = [];

    function addGeometry(ring, currBBox, featureId) {
        var geometry = new VectorPolylineGeometry({
            coordinates: ring,
            primitiveType: primitiveType,
            featureId: featureId
        });

        geometry = VectorPolylineGeometry.createGeometry(geometry);
        geometries.push(geometry);

        if (calcBBox) {
            for (let index = 0; index < ring.length; index++) {
                const lonlat = ring[index];
                currBBox[0] = Math.min(currBBox[0], lonlat[0]);
                currBBox[1] = Math.min(currBBox[1], lonlat[1]);
                currBBox[2] = Math.max(currBBox[2], lonlat[0]);
                currBBox[3] = Math.max(currBBox[3], lonlat[1]);
            }
        }

    }

    for (let featureId = 0; featureId < features.length; featureId++) {
        const ft = features[featureId];
        const geom = ft.geometry;
        if (filter) {
            if (!filter(ft)) {
                continue;
            }
        }

        var currBBox = geom.bbox;
        calcBBox = false;
        if (!ft.geometry.bbox) {
            currBBox = [Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];
            calcBBox = true;
            ft.geometry.bbox = currBBox;
        }

        if (geom.type == 'MultiPolygon') {
            for (let i = 0; i < geom.coordinates.length; i++) {
                const rings = geom.coordinates[i];
                for (let j = 0; j < rings.length; j++) {
                    const ring = rings[j];
                    addGeometry(ring, currBBox, featureId);
                }
            }

        } else if (geom.type == 'Polygon' || geom.type == 'MultiLineString') {
            for (let i = 0; i < geom.coordinates.length; i++) {
                const ring = geom.coordinates[i];
                addGeometry(ring, currBBox, featureId);
            }

        } else if (geom.type == 'LineString') {
            addGeometry(geom.coordinates, currBBox, featureId);
        }

        if (ft.geometry.bbox) {
            bbox[0] = Math.min(bbox[0], ft.geometry.bbox[0]);
            bbox[1] = Math.min(bbox[1], ft.geometry.bbox[1]);
            bbox[2] = Math.max(bbox[2], ft.geometry.bbox[2]);
            bbox[3] = Math.max(bbox[3], ft.geometry.bbox[3]);
        }
    }

    var geometry = GeometryUtils.mergeGeometries(geometries);
    return {
        geometry: geometry,
        bbox: bbox
    }
}

export default VectorPolylineGeometry;