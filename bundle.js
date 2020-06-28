
var browserify = require('browserify')
    , babelify = require('babelify')
    , path = require('path')
    , fs = require('fs')
    , exorcist = require('exorcist')
    , basePath = './'
    , entryFile = './Source/Main.js'
    , distFile = path.join(__dirname, basePath, 'dist/CesiumMeshVisualizer.js')
    , distMinFile = path.join(__dirname, basePath, 'dist/CesiumMeshVisualizer.min.js')
    , mapfile = path.join(__dirname, basePath, 'dist/CesiumMeshVisualizer.js.map')
    , minMapfile = path.join(__dirname, basePath, 'dist/CesiumMeshVisualizer.min.js.map');

browserify(entryFile, {
    debug: true,
    standalone: "CesiumMeshVisualizer",
    basedir: './'
})
    .transform(babelify.configure({
        presets: ['es2015']
    }))
    .bundle()
    .pipe(exorcist(mapfile))
    .pipe(fs.createWriteStream(distFile, 'utf8'))
    .on('close', function (err) {
        var UglifyJS = require('uglify-js')
        var result = UglifyJS.minify(distFile, {
            inSourceMap: mapfile,
            outSourceMap: path.basename(minMapfile)
        });
        if (result.error) {
            console.trace(result.error)
        } else {
            fs.writeFileSync(distMinFile, result.code);
            fs.writeFileSync(minMapfile, result.map);
        }
    })