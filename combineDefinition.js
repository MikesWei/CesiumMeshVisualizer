/**
  功能：合并TypeScript类型定义文件(.d.ts)。
 */

/**
 * 入口文件
 */
var entry = './ThirdParty/three.js/src/Three.d.ts';
/**
 * 输出合并结果文件
 */
var outFilename = './Source/THREE.d.ts';

var fs = require('fs');
var path = require('path');
var regexp = /[import|export]+\s+({[\/\sa-zA-Z_0-9,]+})*.*\s*from\s*['|"].*['|"];/g;
//标记已经导入过的文件
var fileExists = {};
//递归处理d.ts文件
function parseeFile(filename) {
    var currDir = path.dirname(filename);

    var fileCont = fs.readFileSync(filename, { encoding: 'utf-8' })

    var matches = fileCont.match(regexp);

    if (!matches || !matches.length) {
        return fileCont;
    }

    var importFileConts = [];
    matches.forEach((item) => {

        if (/^\/\//.test(item.trimLeft())) return
        var m = item.match(/['|"](?<filename>.*)['|"]/)

        if (m.groups && m.groups.filename) {

            var importFilename = m.groups.filename + '.d.ts'
            importFilename = path.join(currDir, importFilename);
            var absFname = path.resolve(currDir, importFilename);

            if (fileExists[absFname]) {
                return;
            }
            fileExists[absFname] = true;
            var importFileCont = parseeFile(importFilename);
            importFileConts.push(importFileCont);

        }
    });

    importFileConts.push(fileCont.replace(regexp, '').trimLeft());
    return importFileConts.join('\r\n');
}

var result = parseeFile(entry);
fs.writeFileSync(outFilename, result, {
    encoding: 'utf-8'
})