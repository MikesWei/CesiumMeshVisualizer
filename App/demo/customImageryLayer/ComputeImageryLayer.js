
import ComputeImagery from './ComputeImagery.js';

function ComputeImageryLayer(imageryProvider, options) {
    Cesium.ImageryLayer.call(this, imageryProvider, options);
}

ComputeImageryLayer.prototype = Object.create(Cesium.ImageryLayer.prototype)

/**
 * 
 * @param {Cesium.FrameState} frameState 
 * @param {Cesium.Imagery} imagery 
 * @return {Cesium.Texture}
 * @private
 */
ComputeImageryLayer.prototype._createTextureWebGL = function (frameState, imagery) {
    var sampler = new Cesium.Sampler({
        minificationFilter: this.minificationFilter,
        magnificationFilter: this.magnificationFilter,
    });

    var image = imagery.image;

    if (this._imageryProvider.compute) {
        var texture = this._imageryProvider._compute(
            imagery.x, imagery.y, imagery.level,
            frameState, imagery.texture);
        if (texture) {
            texture.referenceCount = texture.referenceCount ? texture.referenceCount + 1 : 1;
            return texture;
        }
    }

    if (Cesium.defined(image.internalFormat)) {
        return new Cesium.Texture({
            context: frameState.context,
            pixelFormat: image.internalFormat,
            width: image.width,
            height: image.height,
            source: {
                arrayBufferView: image.bufferView,
            },
            sampler: sampler,
        });
    }

    return new Cesium.Texture({
        context: frameState.context,
        source: image,
        pixelFormat: this._imageryProvider.hasAlphaChannel
            ? Cesium.PixelFormat.RGBA
            : Cesium.PixelFormat.RGB,
        sampler: sampler,
    });
};


ComputeImageryLayer.prototype.removeImageryFromCache = function (imagery) {
    var cacheKey = getImageryCacheKey(imagery.x, imagery.y, imagery.level);
    delete this._imageryCache[cacheKey];
};

ComputeImageryLayer.prototype.getImageryFromCache = function (
    x,
    y,
    level,
    imageryRectangle
) {
    var cacheKey = getImageryCacheKey(x, y, level);
    var imagery = this._imageryCache[cacheKey];

    if (!Cesium.defined(imagery)) {
        imagery = new ComputeImagery(this, x, y, level, imageryRectangle);
        this._imageryCache[cacheKey] = imagery;
    }

    imagery.addReference();
    return imagery;
};

function getImageryCacheKey(x, y, level) {
    return JSON.stringify([x, y, level]);
}

export default ComputeImageryLayer;
