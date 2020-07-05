
import ComputeImageryProvider from './ComputeImageryProvider.js';
import { IComputeImageryProviderOptions } from './ComputeImageryProvider.js';
import {
    FramebufferTexture, Mesh,
    MeshVisualizer,
    defineProperty
} from '../../../Source/Main.js';
import VectorPolylineMaterial from './VectorPolylineMaterial.js'
import VectorPolylineGeometry from './VectorPolylineGeometry.js';

var scratchRectangle, scratchClearCommand;
export class IVector2RasterImageryProviderOptions extends IComputeImageryProviderOptions {
    constructor() {
        super();
        /**
         * @type {geojson.FeatureCollection<geojson.Shape|geojson.IPoint>|geojson.Feature<geojson.Shape|geojson.IPoint>}
         */
        this.source;
        /**
         * @type {object}
         */
        this.style;
        /**
         * @type {FramebufferTexture}
         */
        this.fbTex;
    }
}

export class VectorPolylineStyle {

    constructor(options) {
        options = options || {};

        var symbolOptions = options.symbolOptions;
        var defaultSymbol = (function () {
            var options = symbolOptions || {};

            var backColor = 'rgba(5,39,175,0.5)';
            var arrowColor = 'white';
            var outlineColor
            var angle = options.angle || 45;
            var angleRad = Cesium.Math.toRadians(angle / 2);

            if (options.backColor) {
                if (typeof options.backColor == 'string') {
                    backColor = options.backColor;
                } else {
                    backColor = options.backColor.toCssColorString();
                }
            }
            if (options.arrowColor) {
                if (typeof options.arrowColor == 'string') {
                    arrowColor = options.arrowColor;
                } else {
                    arrowColor = options.arrowColor.toCssColorString();
                }
            }
            if (options.outlineColor) {
                if (typeof options.outlineColor == 'string') {
                    outlineColor = options.outlineColor;
                } else {
                    outlineColor = options.outlineColor.toCssColorString();
                }
            }

            var height = 40;
            var arrowLength = height / (2 * Math.tan(angleRad));
            var offset = arrowLength * 0.3;
            var width = arrowLength * 2 + offset * 2;

            var tex = document.createElement('canvas');
            tex.width = width;
            tex.height = height;
            var ctx = tex.getContext('2d');
            ctx.strokeStyle = outlineColor || arrowColor || 'white';
            ctx.lineWidth = 1;
            ctx.fillStyle = backColor;
            ctx.fillRect(0, 0, tex.width, tex.height);

            // ctx.beginPath();
            //ctx.moveTo(0, 0, tex.width, 0);
            // ctx.stroke();
            // ctx.moveTo(0, tex.height, tex.width, 0);
            // ctx.stroke();

            ctx.fillStyle = arrowColor;

            ctx.beginPath();

            ctx.moveTo(offset, 0);//p1
            ctx.lineTo(offset + arrowLength, 0);//p2
            ctx.lineTo(offset + arrowLength * 2, height / 2);//p3
            ctx.lineTo(offset + arrowLength, height);//p4
            ctx.lineTo(offset, height);//p5
            ctx.lineTo(offset + arrowLength, height / 2);//p6
            ctx.lineTo(offset, 0);//p1

            ctx.stroke();

            ctx.closePath();

            ctx.fill();
            return tex;

        })()

        var defaultStyle = Object.assign({
            line: true,
            lineWidth: 2,
            pointSize: 5,
            lineColor: Cesium.Color.YELLOW,

            shadows: false,
            shadowColor: Cesium.Color.WHITE,
            shadowSize: 2,

            outline: false,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1,

            // lineSymbolSize: new Cesium.Cartesian2(defaultSymbol.width, defaultSymbol.height),
            lineSymbol: defaultSymbol,
            lineSymbolReverse: false,
            useLineSymbol: false
        }, options);

        this.propertyChanged = new Cesium.Event();

        for (const key in defaultStyle) {
            if (defaultStyle.hasOwnProperty(key)) {
                const val = defaultStyle[key];
                defineProperty(this, key, val, (properName, obj, newVal, oldVal) => {
                    this.propertyChanged.raiseEvent(properName, obj, newVal, oldVal)
                })
            }
        }
    }

    line = true
    lineWidth = 2
    pointSize = 5
    lineColor = Cesium.Color.YELLOW

    shadows = false
    shadowColor = Cesium.Color.WHITE
    shadowSize = 2

    outline = false
    outlineColor = Cesium.Color.WHITE
    outlineWidth = 1

    lineSymbolSize = new Cesium.Cartesian2(256, 64)
}

/**
 * 
 * @extends ComputeImageryProvider
 */
class Vector2RasterImageryProvider extends ComputeImageryProvider {

    /**
     * 
     * @param {IVector2RasterImageryProviderOptions} options
     */
    constructor(options) {
        options = options || {};
        super(options);
        /**
        * @type {geojson.FeatureCollection<geojson.Shape|geojson.IPoint>|geojson.Feature<geojson.Shape|geojson.IPoint>}
        * @private
        */
        this._source = options.source;
        this.filter = options.filter;

        this.style = new VectorPolylineStyle(options.style);
        //样式发生改变时重新渲染各个瓦片
        this.style.propertyChanged.addEventListener(() => {
            if (this._ready && this._reload) {
                this._reload();
            }
        });

        /**
         * 缓存瓦片计算结果
         * @type {{[key:string]:FramebufferTexture}}
         * @private
         */
        this._framebufferCache = {};

        this._meshVisualizer = new MeshVisualizer();
        this._lineScale = 2;
        this._viewport = {
            x: 0,
            y: 0,
            width: this._tileWidth * this._lineScale,
            height: this._tileHeight * this._lineScale
        };
        this._cacheRectangle = Cesium.Rectangle.MAX_VALUE.clone();
        /**
         * @type {Cesium.Rectangle[]}
         * @private
         */
        this._sourceRectangles = [];

        if (!scratchRectangle) {
            scratchRectangle = new Cesium.Rectangle();
        }
    }

    /** 
     * @type {geojson.FeatureCollection<geojson.Shape|geojson.IPoint>|geojson.Feature<geojson.Shape|geojson.IPoint>}
     */
    get source() {
        return this._source;
    }
    //范围比较大的数据，不推荐更新此属性，建议新建图层，避免切换过程中由于cesium重构影像调度树而卡顿
    set source(newSource) {
        if (!newSource) {
            console.warn('newSource is required.');
            return;
        }
        if (typeof (newSource) == 'string') {
            this._sourceUrl = newSource;
            return Cesium.Resource.fetchJson(newSource).then((geojson) => {
                this.source = geojson;
            });
        } else {

            this.freeResource();
            this._source = newSource;
            this._setFromGeojson(newSource);
            if (this._frameState) {
                var scene = this._frameState.camera._scene;
                var layerIndex = this._imageryLayer._layerIndex;
                scene.imageryLayers.remove(this._imageryLayer,false);
                scene.imageryLayers.add(this._imageryLayer, layerIndex);
            }

        }
    }

    _setFromGeojson(geojson) {

        console.time('prepare mesh');
        var result = VectorPolylineGeometry.fromFeatures(geojson.features, this.filter);

        var bbox = result.bbox, geometry = result.geometry;
        this.bbox = bbox;
        var w = bbox[2] - bbox[0], h = bbox[3] - bbox[1];
        var style = this.style;
        var extendPixels = style.lineWidth + (style.shadowSize + style.outlineWidth) * 2;
        var deltaW = 10 * extendPixels * w / (this._tileWidth - 1), deltaH = extendPixels * h / (this._tileHeight - 1);

        var rectangle = Cesium.Rectangle.fromDegrees(
            bbox[0] - deltaW, bbox[1] - deltaH, bbox[2] + deltaW, bbox[3] + deltaH
        );
        this._rectangle = rectangle;

        // if (!this.mesh) {
        var material = new VectorPolylineMaterial({
            uniforms: {
                lineWidth: 2,
                lineScale: this._lineScale,
                resolution: new Cesium.Cartesian2(
                    this._viewport.width, this._viewport.height)
            }
        });

        this.mesh = new Mesh(geometry, material);
        this.material = material;
        // } else {
        //     this.mesh.geometry = geometry;
        //     this.mesh.geometry.needsUpdate = true;
        // }

        delete result.geometry;
        delete result.bbox;
        console.timeEnd('prepare mesh');

    }

    /**
     *  @override ComputeImageryProvider.prototype.init
     */
    init() {
        if (typeof (this.source) == 'string') {
            this._sourceUrl = this.source;
            return Cesium.Resource.fetchJson(this.source).then((geojson) => {
                this._source = geojson;
                this._setFromGeojson(this.source);
            });
        } else if (this.source) {
            this._setFromGeojson(this.source);
        }
    }

    /**
     *  @override ComputeImageryProvider.prototype.prepareData
     */
    prepareData(x, y, level, request) {
        return true;
        this._tilingScheme.tileXYToRectangle(x, y, level, this._cacheRectangle);
        var features = this.source.features;
        var shouldRender = false;
        for (var featureId = 0; featureId < features.length; featureId++) {
            var feature = features[featureId];
            var rectangle = this._sourceRectangles[featureId];
            if (!rectangle) {
                var bbox = feature.geometry.bbox;
                rectangle = Cesium.Rectangle.fromDegrees(
                    bbox[0], bbox[1], bbox[2], bbox[3]
                )
                this._sourceRectangles[featureId] = rectangle;
            }
            if (Cesium.Rectangle.intersection(this._cacheRectangle, rectangle, scratchRectangle)) {
                shouldRender = true;
                break;
            }
        }

        return shouldRender;
    }

    /**
     *  @override ComputeImageryProvider.prototype.compute
     */
    compute(x, y, level, frameState, outputTexture) {

        this._tilingScheme.tileXYToRectangle(x, y, level, this._cacheRectangle);
        var framebufferTex = this._getFboFromCache(x, y, level, frameState);

        this._render(frameState, framebufferTex, this._viewport);

        return framebufferTex.texture;
    }

    _getFboFromCache(x, y, level, frameState) {
        var cacheKey = getFrambufferCacheKey(x, y, level);
        var framebufferTexture = this._framebufferCache[cacheKey];
        if (!framebufferTexture) {
            var colorTexture = new Cesium.Texture({
                context: frameState.context,
                width: this._viewport.width,
                height: this._viewport.height,
                pixelFormat: Cesium.PixelFormat.RGBA
            });
            var depthTexture = new Cesium.Texture({
                context: frameState.context,
                width: colorTexture.width,
                height: colorTexture.height,
                pixelFormat: Cesium.PixelFormat.DEPTH_COMPONENT,
                pixelDatatype: Cesium.PixelDatatype.UNSIGNED_SHORT
            });
            var framebuffer = new Cesium.Framebuffer({
                context: frameState.context,
                colorTextures: [colorTexture],
                destroyAttachments: false,
                depthTexture: depthTexture
            });

            framebufferTexture = new FramebufferTexture(this.mesh, framebuffer);
            this._framebufferCache[cacheKey] = framebufferTexture;
        }
        return framebufferTexture;
    }

    _render(frameState, framebufferTex, viewport) {

        this.material.rectangle = this._cacheRectangle;
        var uniforms = this.material.uniforms;
        uniforms.featureCount.value = this.source.features.length;

        uniforms.lineWidth.value = this.style.lineWidth;
        uniforms.pointSize.value = this.style.pointSize;
        uniforms.shadowSize.value = this.style.shadowSize;
        uniforms.outlineWidth.value = this.style.outlineWidth;

        uniforms.lineColor.value = this.style.lineColor;
        uniforms.shadowColor.value = this.style.shadowColor;
        uniforms.outlineColor.value = this.style.outlineColor;

        if (this.style.lineSymbol) {
            uniforms.lineSymbolSize.value.x = this.style.lineSymbol.width;
            uniforms.lineSymbolSize.value.y = this.style.lineSymbol.height;
            uniforms.lineSymbol.value = this.style.lineSymbol;
        }
        uniforms.lineSymbolReverse.value = this.style.lineSymbolReverse;
        uniforms.useLineSymbol.value = this.style.useLineSymbol;

        this._clear(frameState, framebufferTex);
        this._meshVisualizer.initFrameBufferTexture(frameState, framebufferTex, viewport)
        this._renderShadows(frameState, framebufferTex, viewport);
        this._renderOutline(frameState, framebufferTex, viewport);
        this._renderLine(frameState, framebufferTex, viewport);
    }

    _clear(frameState, framebufferTex) {

        if (!scratchClearCommand) {
            scratchClearCommand = new Cesium.ClearCommand({
                color: new Cesium.Color(0.0, 0.0, 0.0, 0.0)
            });
        }

        var framebuffer = framebufferTex.framebuffer;
        var clearCommand = scratchClearCommand;
        clearCommand.framebuffer = framebuffer;
        clearCommand.renderState = frameState.renderState;
        clearCommand.execute(frameState.context);
    }

    _renderLine(frameState, framebufferTex) {
        if (this.style.line) {
            var uniforms = this.material.uniforms;
            uniforms.renderPass.value = VectorPolylineMaterial.RenderPass.LINE;

            this._executeDraw(frameState.context, framebufferTex);
        }
    }

    _renderOutline(frameState, framebufferTex) {
        if (this.style.outline) {
            var uniforms = this.material.uniforms;
            uniforms.renderPass.value = VectorPolylineMaterial.RenderPass.OUTLINE;
            this._executeDraw(frameState.context, framebufferTex);
        }
    }

    _renderShadows(frameState, framebufferTex) {
        if (this.style.shadows) {
            var uniforms = this.material.uniforms;

            uniforms.renderPass.value = VectorPolylineMaterial.RenderPass.SHADOWS;
            this._executeDraw(frameState.context, framebufferTex);
        }
    }

    _executeDraw(context, framebufferTex) {
        var drawCommands = framebufferTex.drawCommands
        for (let index = 0; index < drawCommands.length; index++) {
            const drawCommand = drawCommands[index];
            drawCommand.framebuffer = framebufferTex.framebuffer;
            drawCommand.execute(context);
        }
    }

    updateFborFromCache() {
        var frameState = this._frameState;
        if (frameState) {
            for (const key in this._framebufferCache) {
                if (this._framebufferCache.hasOwnProperty(key)) {
                    const framebufferTex = this._framebufferCache[key];
                    var xyz = JSON.parse(key);
                    this._tilingScheme.tileXYToRectangle(xyz[0], xyz[1], xyz[2], this._cacheRectangle);
                    this._render(frameState, framebufferTex, this._viewport);

                }
            }
        }
    }

    /**
     *  @override ComputeImageryProvider.prototype.onTileDestroyed
     */
    onTileDestroyed(x, y, level) {
        var cacheKey = getFrambufferCacheKey(x, y, level);
        var fb = this._framebufferCache[cacheKey];
        if (fb) {
            fb.destroy && fb.destroy();

            fb.depthTexture.destroy();
            fb.framebuffer.destroy();

            delete fb.depthTexture;
            delete fb.framebuffer;
            delete fb.texture;

            delete this._framebufferCache[cacheKey];
        }
    }

    freeResource() {
        if (this.mesh) {
            this._meshVisualizer.remove(this.mesh);
            this.mesh && this.mesh.destroy();
            delete this.mesh;
        }
        if (this.material) {
            this.material && this.material.destroy();
            delete this.material;
        }
    }

    /**
     *  @override ImageryProvider.prototype.destroy
     */
    destroy() {
        this.freeResource();
    }

}

function getFrambufferCacheKey(x, y, level) {
    return JSON.stringify([x, y, level]);
}

export default Vector2RasterImageryProvider