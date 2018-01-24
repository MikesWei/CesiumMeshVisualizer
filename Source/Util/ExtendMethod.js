function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
String.prototype.trim = function (char) {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}
String.prototype.trimStart = function () {
    return this.replace(/(^\s*)/g, "");
}
String.prototype.trimEnd = function () {
    return this.replace(/(\s*$)/g, "");
}
String.IsNullOrEmpty = function (val) {
    return typeof val === 'undefined' || val == null || val == "";
}
String.IsNullOrWhiteSpace = function (val) {
    return typeof val === 'undefined' || val == null || val == "" || val.trim() == "";
}
String.prototype.Contains = function (str) {
    return str && this.indexOf(str) >= 0;
}

String.prototype.insert = function (pos, str) {
    var before = this.slice(0, pos) + str;
    before += this.slice(pos, this.length - 1);
    return before;
}
String.isNumber = function (char) {
    return !isNaN(char);
}
String.prototype.Substring = function (start, length) {
    if (typeof length === 'undefined') {
        length = this.length - start;
    }
    return this.substring(start, start + length);
}

String.prototype.startsWith = function (str) {
    if (!str || !str.length) {
        return false;
    }
    if (str.length > this.length) {
        return false;
    }
   
    var s = this.slice(0, str.length);
    return s == str;
}
String.prototype.endsWith = function (str) {
    if (!str || !str.length) {
        return false;
    }
    if (str.length > this.length) {
        return false;
    }

    var s = this.slice(this.length - str.length, this.length);
    return s == str;
}
if (!Object.assign) {
    Object.assign = function (target, sources) {
        var newObj = {};
        target = arguments[0];
        for (var i in target) {
            if (target.hasOwnProperty(i)) {
                newObj[i] = target[i];
            }
        }

        for (var i = 1; i < arguments.length; i++) {
            for (var j in arguments[i]) {
                if (arguments[i].hasOwnProperty(j)) {
                    newObj[j] = arguments[i][j];
                }
            }
        }
        return newObj;
    }
}
Array.copy = function (src, srcIndex, dest, destIndex, length) {
   
    for (var i = srcIndex; i < length; i++) {
        dest[destIndex++] = src[i];
    }
}

Array.prototype.insertAt = function (index, value) {
    var part1 = this.slice(0, index);
    var part2 = this.slice(index);
    if (value.length) {
        part1 = part1.concat(value);
    } else {
        part1.push(value);
    }

    return (part1.concat(part2));
};

Array.prototype.removeAt = function (index) {
    var part1 = this.slice(0, index);
    var part2 = this.slice(index);
    part1.pop();
    return (part1.concat(part2));
}
Array.prototype.add = function (val) {
    this.push(val);
}
Array.prototype.Add = function (val) {
    this.push(val);
}
window.Array2d = function (dim0, dim1, dm1Constructor) {
    var arr = new Array(dim0);
    for (var i = 0; i < dim0; i++) {
        arr[i] = new dm1Constructor(dim1);
    }
    return arr;
}
window.Array3d = function (dim0, dim1, dim2, dm1Constructor) {
    var arr = new Array(dim0);
    for (var i = 0; i < dim0; i++) {
        arr[i] = new Array(dim1);
        for (var j = 0; j < dim1; j++) {
            arr[i][j] = new dm1Constructor(dim2);
        }
    }
    return arr;
}
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
 

Date.prototype.addHours = function (hours) {
    var that = Cesium.JulianDate.fromDate(this);
    var result = Cesium.JulianDate.fromDate(this);
    Cesium.JulianDate.addHours(that, hours, result);
    return Cesium.JulianDate.toDate(result);
}
Date.prototype.AddHours = Date.prototype.addHours;

Date.prototype.addMinutes = function (minutes) {
    var that = Cesium.JulianDate.fromDate(this);
    var result = Cesium.JulianDate.fromDate(this);
    Cesium.JulianDate.addMinutes(that, minutes, result);
    return Cesium.JulianDate.toDate(result);
}
Date.prototype.AddMinutes = Date.prototype.addMinutes;

Date.prototype.addDays = function (days) {
    var that = Cesium.JulianDate.fromDate(this);
    var result = Cesium.JulianDate.fromDate(this);
    Cesium.JulianDate.addDays(that, days, result);
    return Cesium.JulianDate.toDate(result);
}
Date.prototype.AddDays = Date.prototype.addDays;

Date.prototype.addSeconds = function (seconds) {
    var that = Cesium.JulianDate.fromDate(this);
    var result = Cesium.JulianDate.fromDate(this);
    Cesium.JulianDate.addSeconds(that, seconds, result);
    return Cesium.JulianDate.toDate(result);
}

Date.prototype.AddSeconds = Date.prototype.addSeconds;

if (!Date.prototype.ToString) {
    Date.prototype.ToString = function (fmt) {
        return this.Format(fmt);
    }
}
if (!Array.prototype.AddRange) {
    Array.prototype.AddRange = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            this.push(arr[i]);
        }
    }
}
if (!Array.prototype.contains) {
    Array.prototype.contains = function (v) {
        if (v instanceof Date) {
            var jd = Cesium.JulianDate.fromDate(v);
            for (var i = 0; i <this. length; i++) {

                var d = Cesium.JulianDate.fromDate(this[i]);
                if (Cesium.JulianDate.equals(d,jd)) {
                    return true;
                }
            }
            return false;
        }
        return this.indexOf(v) >= 0;
        //for (var i = 0; i < this.length; i++) {
        //    if (this[i] === v) {
        //        return true;
        //    }
        //}
        //return false;
    }
}
if (!Array.prototype.Contains) {
    Array.prototype.Contains = Array.prototype.contains;
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (v) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === v) {
                return i;
            }
            return -1;
        }
    }
}
Number.pad = function (num, fill) {
    var len = ('' + num).length;
    return (Array(
        fill > len ? fill - len + 1 || 0 : 0
    ).join(0) + num);
}
Number.padSpaceEnd = function (num, fill) {
    num = '' + num;
    if (num.indexOf('.') < 0) {
        num += '.';
    }
    var len = num.length;
    if (len > fill) {
        num = num.slice(0, fill);
    }
    return (num + Array(
        fill > len ? fill - len + 1 || 0 : 0
    ).join(0));
}
var eastNorthUpToFixedFrameNormal = new Cesium.Cartesian3();
var eastNorthUpToFixedFrameTangent = new Cesium.Cartesian3();
var eastNorthUpToFixedFrameBitangent = new Cesium.Cartesian3();

Cesium.Transforms.northDownEastToFixedFrame = function (origin, ellipsoid, result) {
    //>>includeStart('debug', pragmas.debug);
    if (!Cesium.defined(origin)) {
        throw new Cesium.DeveloperError('origin is required.');
    }
    //>>includeEnd('debug');

    // If x and y are zero, assume origin is at a pole, which is a special case.
    if (Cesium.Math.equalsEpsilon(origin.x, 0.0, Cesium.Math.EPSILON14) &&
        Cesium.Math.equalsEpsilon(origin.y, 0.0, Cesium.Math.EPSILON14)) {
        var sign = Cesium.Math.sign(origin.z);
        if (!Cesium.defined(result)) {
            return new Cesium.Matrix4(
                   -sign, 0.0, 0.0, origin.x,
                    0.0, 0.0, 1.0, origin.y,
                    0.0, sign, 0.0, origin.z,
                    0.0, 0.0, 0.0, 1.0);
        }
        result[0] = -sign;
        result[1] = 0.0;
        result[2] = 0.0;
        result[3] = 0.0;
        result[4] = 0.0;
        result[5] = 0.0;
        result[6] = sign;
        result[7] = 0.0;
        result[8] = 0.0;
        result[9] = 1.0;
        result[10] = 0.0;
        result[11] = 0.0;
        result[12] = origin.x;
        result[13] = origin.y;
        result[14] = origin.z;
        result[15] = 1.0;
        return result;
    }

    var normal = eastNorthUpToFixedFrameNormal;
    var tangent = eastNorthUpToFixedFrameTangent;
    var bitangent = eastNorthUpToFixedFrameBitangent;

    ellipsoid = Cesium.defaultValue(ellipsoid, Cesium.Ellipsoid.WGS84);
    ellipsoid.geodeticSurfaceNormal(origin, normal);

    tangent.x = -origin.y;
    tangent.y = origin.x;
    tangent.z = 0.0;
    Cesium.Cartesian3.normalize(tangent, tangent);

    Cesium.Cartesian3.cross(normal, tangent, bitangent);

    if (!Cesium.defined(result)) {
        return new Cesium.Matrix4(
                -bitangent.x, -normal.x, tangent.x, origin.x,
                -bitangent.y, -normal.y, tangent.y, origin.y,
                -bitangent.z, -normal.z, tangent.z, origin.z,
                0.0, 0.0, 0.0, 1.0);
    }
    result[0] = bitangent.x;
    result[1] = bitangent.y;
    result[2] = bitangent.z;
    result[3] = 0.0;
    result[4] = normal.x;
    result[5] = normal.y;
    result[6] = normal.z;
    result[7] = 0.0;
    result[8] = tangent.x;
    result[9] = tangent.y;
    result[10] = tangent.z;
    result[11] = 0.0;
    result[12] = origin.x;
    result[13] = origin.y;
    result[14] = origin.z;
    result[15] = 1.0;
    return result;
};
  