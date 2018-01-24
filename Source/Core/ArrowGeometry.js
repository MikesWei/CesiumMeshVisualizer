define([ 
    'Core/GeometryUtils'
], function ( 
    GeometryUtils
    ) {

    /**
    *
      <pre><code>  
              +            ——
            +   +           |
          +       +     headLength
        +           +       |
      ++++headWidth++++   ——
            +  +            |
            +  +            |
            +  +            |
            +  +          length
            +  +            |
            +  +            |
            +  +            |
            ++++           ——
            width

        </code> </pre>
    *@param {Object}[options] 
    *@param {Number}[options.length=50000]   
    *@param {Number}[options.width=250]   
    *@param {Number}[options.headLength=5000]   
    *@param {Number}[options.headWidth=1000]    
    *@param {Boolean}[options.reverse=false]   
    * 
    *@property {Number}length   
    *@property {Number}width   
    *@property {Number}headLength   
    *@property {Number}headWidth   
    *@property {Boolean}reverse  
    *
    *@constructor
    *@memberof Cesium
    */
    function ArrowGeometry(options) {
        options = Cesium.defaultValue(options, {});
        this.length = Cesium.defaultValue(options.length, 50000);
        this.width = Cesium.defaultValue(options.width, 125);
        this.headLength = Cesium.defaultValue(options.headLength, 5000);
        this.headWidth = Cesium.defaultValue(options.headWidth, 1000);
        this.reverse = Cesium.defaultValue(options.reverse, false);
    }

    /**
    *
    *@param {Cesium.ArrowGeometry}
    *@return {Cesium.Geometry}
    */
    ArrowGeometry.createGeometry = function (arrowGeometry) {
        var length = arrowGeometry.length;
        var width = arrowGeometry.width;
        var headLength = arrowGeometry.headLength;
        var headWidth = arrowGeometry.headWidth;
        var reverse = arrowGeometry.reverse;

        var line = Cesium.CylinderGeometry.createGeometry(new Cesium.CylinderGeometry({
            length: length,
            topRadius: width,
            bottomRadius: width,
        }));
        var arrow;
        if (reverse) {
            arrow = Cesium.CylinderGeometry.createGeometry(new Cesium.CylinderGeometry({
                length: headLength,
                topRadius: headWidth,
                bottomRadius: 0,
            }));
            GeometryUtils.translate(arrow, [0, 0, -(length + headLength) / 2]);
        } else {
            arrow = Cesium.CylinderGeometry.createGeometry(new Cesium.CylinderGeometry({
                length: headLength,
                topRadius: 0,
                bottomRadius: headWidth,
            }));
            GeometryUtils.translate(arrow, [0, 0, (length + headLength) / 2]);
        }

        var lineWithArrow = GeometryUtils.mergeGeometries([line, arrow]);

        return lineWithArrow;
    }
    return ArrowGeometry;
})