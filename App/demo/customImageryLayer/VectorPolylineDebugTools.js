
function scaleCoords(pt, scalar) {
    return Cesium.Cartesian2.multiplyByScalar(pt, scalar, new Cesium.Cartesian2())
}

var cv = document.createElement('canvas');
cv.width = 400;
cv.height = 400;
cv.style.position='absolute';
cv.style.zIndex=9;
cv.style.top='10px'
document.body.appendChild(cv);
var g = cv.getContext('2d');

function drawPoint(p, color, size) {
    size = size || 6;
    g.fillStyle = color;
    g.fillRect(p.x - size / 2, p.y - size / 2, size, size);
}

function drawLine(p1, p2, color, size) {
    g.lineWidth = size;
    g.strokeStyle = color;
    g.beginPath();
    g.moveTo(p1.x, p1.y);
    g.lineTo(p2.x, p2.y);
    g.stroke();
}

function calcCvBBox(pts) {
    var bbox = [Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];
    pts.forEach((pt) => {
        bbox[0] = Math.min(pt.x, bbox[0]);
        bbox[1] = Math.min(pt.y, bbox[1]);
        bbox[2] = Math.max(pt.x, bbox[2]);
        bbox[3] = Math.max(pt.y, bbox[3]);
    });
    return bbox;
}

function projCvCoords(pt, bbox) {
    return new Cesium.Cartesian2(
        cv.width * 0.125 + (pt.x - bbox[0]) / (bbox[2] - bbox[0]) * cv.width * 0.75,
        cv.height * 0.125 + (pt.y - bbox[1]) / (bbox[3] - bbox[1]) * cv.height * 0.75
    )
}

function drawCheckResult(pt, prevPt, nextPt, dir) {
    var bbox = calcCvBBox([pt, prevPt, nextPt]);
    drawPoint(projCvCoords(pt, bbox), 'red');
    drawPoint(projCvCoords(prevPt, bbox), 'red');
    drawPoint(projCvCoords(nextPt, bbox), 'red');
   drawPoint(projCvCoords(Cesium.Cartesian2.add(pt, dir, new Cesium.Cartesian2()), bbox), 'red');

}
