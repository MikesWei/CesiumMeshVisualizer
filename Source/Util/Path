//define(function () {

/**
*@class
*@memberof Cesium
*/
function Path() { }
/**
*
*获取文件扩展名（后缀）
*@param {String}fname 文件名
*/
Path.GetExtension = function (fname) {
    var start = fname.lastIndexOf(".");
    if (start >= 0) {
        return fname.substring(start, fname.length);
    }
    return "";
}

/**
*
*获取文件扩展名（后缀）
*@param {String}fname 文件名
*/
Path.GetFileName = function (fname) {
    var start = fname.lastIndexOf("/");
    if (start < 0) {
        return fname;
    }
    return fname.substring(start + 1, fname.length);
}
/**
*
*获取文件夹
*@param {String}fname 文件名
*/
Path.GetDirectoryName = function (fname) {
    var start = fname.lastIndexOf("/");
    if (start < 0) {
        return "";
    }
    return fname.substring(0, start);
}
/**
*
*获取文件夹
*@param {String}fname 文件名
*/
Path.Combine = function (dir, fname) {
    return dir + fname;
}
Path.ChangeExtension = function (fname, newExt) {
    return fname.replace(Path.GetExtension(fname), newExt);
}
//    return Path;
//});

if (typeof module === "undefined") {
    this.Path = Path;
} else {
    module.exports = Path;
}
if (typeof define === "function") {
    define(function () { return Path; });
}
