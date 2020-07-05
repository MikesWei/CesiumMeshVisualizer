import { MeshMaterial } from "../../../Source/Main.js";
import Vector2RasterVert from './Vector2Raster_vert.js';
import Vector2RasterFrag from './Vector2Raster_frag.js';

class VectorPolylineMaterial extends MeshMaterial {
    /**
     * 
     * @param {object} options 
     * @param {object} [options.uniforms]
     * @param {number} [options.uniforms.tileRectWest=-180]
     * @param {number} [options.uniforms.tileRectEast=180]
     * @param {number} [options.uniforms.tileRectNorth=90]
     * @param {number} [options.uniforms.tileRectSouth=-90]
     * @param {Cesium.Cartesian2} [options.uniforms.resolution=new Cesium.Cartesian2(256, 256)]
     * @param {number} [options.uniforms.lineWidth=10]
     * @param {Cesium.Color} [options.uniforms.color=Cesium.Color.YELLOW]
     */
    constructor(options) {
        options = options || {};
        options.depthTest = Cesium.defaultValue(options.depthTest, false);
        options.blending = Cesium.defaultValue(options.blending, false);
        options.allowPick = Cesium.defaultValue(options.allowPick, false);
        options.vertexShader = options.vertexShader || Vector2RasterVert;
        options.fragmentShader = options.fragmentShader || Vector2RasterFrag;

        var cv=document.createElement('canvas');
        cv.width=128;
        cv.height=32;
        var defaultSymbol=cv;

        options.uniforms = Object.assign({
            tileRectWest: -180,
            tileRectEast: 180,
            tileRectNorth: 90,
            tileRectSouth: -90,
            resolution: new Cesium.Cartesian2(256, 256),

            renderPass: VectorPolylineMaterial.RenderPass.LINE,

            pointSize: 10,
            featureCount: 1,

            lineScale: 1,
            lineWidth: 2,
            lineColor: Cesium.Color.YELLOW,

            shadows:false,
            shadowColor: Cesium.Color.BLACK,
            shadowSize: 0,

            outline:false,
            outlineWidth: 1,
            outlineColor: Cesium.Color.CYAN,

            lineSymbolSize:new Cesium.Cartesian2( defaultSymbol.width,defaultSymbol.height),
            lineSymbol: defaultSymbol,
            lineSymbolReverse:false,
            useLineSymbol:false
        }, options.uniforms);

        super(options);
    }
    /**
     * @type {Cesium.Rectangle}
     */
    set rectangle(rectangle) {

        this.uniforms.tileRectWest.value = Cesium.Math.toDegrees(rectangle.west);
        this.uniforms.tileRectEast.value = Cesium.Math.toDegrees(rectangle.east);
        this.uniforms.tileRectNorth.value = Cesium.Math.toDegrees(rectangle.north);
        this.uniforms.tileRectSouth.value = Cesium.Math.toDegrees(rectangle.south);
    }
    set lineWidth(val) {
        this.uniforms.lineWidth.value = val;
    }
    set resolution(val) {
        Cesium.Cartesian2.clone(val, this.uniforms.resolution.value);
    }
    /**
     * @type {Cesium.Cartesian2}
     */
    get resolution() {
        return this.uniforms.resolution.value;
    }
}
/**
 * 
 */
VectorPolylineMaterial.RenderPass = {
    SHADOWS: 0,
    OUTLINE: 1,
    LINE: 2
}

export default VectorPolylineMaterial;