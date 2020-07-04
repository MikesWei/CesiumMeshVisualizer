import { MeshMaterial } from "../../../Source/Main.js";
import Vector2RasterVert from './Vector2Raster_vert.js';
import Vector2RasterFrag from './Vector2Raster_frag.js';

class Vector2RasterMaterial extends MeshMaterial {
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
        options.vertexShader = options.vertexShader || Vector2RasterVert;
        options.fragmentShader = options.fragmentShader || Vector2RasterFrag;
        options.uniforms = Object.assign({
            tileRectWest: -180,
            tileRectEast: 180,
            tileRectNorth: 90,
            tileRectSouth: -90,
            resolution: new Cesium.Cartesian2(256, 256),
            lineWidth: 2,
            lineScale:1,
            pointSize: 10,
            color: Cesium.Color.YELLOW
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

export default Vector2RasterMaterial;