
import ComputeImagery from './ComputeImagery.js';

function ComputeImageryLayer(imageryProvider, options) {
    Cesium.ImageryLayer.call(this, imageryProvider, options);
    imageryProvider._imageryLayer=this;
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
        } else {
            imagery.state = Cesium.ImageryState.FAILED;
            return;
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

ComputeImageryLayer.prototype.onImageryDestroyed = function (x, y, level) {
    this.imageryProvider.onTileDestroyed && this.imageryProvider.onTileDestroyed(x, y, level)
}

function getImageryCacheKey(x, y, level) {
    return JSON.stringify([x, y, level]);
}

/**
 * Request a particular piece of imagery from the imagery provider.  This method handles raising an
 * error event if the request fails, and retrying the request if necessary.
 *
 * @private
 *
 * @param {Imagery} imagery The imagery to request.
 */
ComputeImageryLayer.prototype._requestImagery = function (imagery) {
    var imageryProvider = this._imageryProvider;

    var that = this;

    function success(image) {
        if (!Cesium.defined(image) || image == false) {
            if (image == false) {
                imagery.state = Cesium.ImageryState.FAILED;
                imagery.request = undefined;
                return;
            } else {
                return failure();
            }
        }

        imagery.image = image;
        imagery.state = Cesium.ImageryState.RECEIVED;
        imagery.request = undefined;

        Cesium.TileProviderError.handleSuccess(that._requestImageError);
    }

    function failure(e) {
        if (imagery.request.state === Cesium.RequestState.CANCELLED) {
            // Cancelled due to low priority - try again later.
            imagery.state = Cesium.ImageryState.UNLOADED;
            imagery.request = undefined;
            return;
        }

        // Initially assume failure.  handleError may retry, in which case the state will
        // change to TRANSITIONING.
        imagery.state = Cesium.ImageryState.FAILED;
        imagery.request = undefined;

        var message =
            "Failed to obtain image tile X: " +
            imagery.x +
            " Y: " +
            imagery.y +
            " Level: " +
            imagery.level +
            ".";
        that._requestImageError = Cesium.TileProviderError.handleError(
            that._requestImageError,
            imageryProvider,
            imageryProvider.errorEvent,
            message,
            imagery.x,
            imagery.y,
            imagery.level,
            doRequest,
            e
        );
    }

    function doRequest() {
        var request = new Cesium.Request({
            throttle: false,
            throttleByServer: true,
            type: Cesium.RequestType.IMAGERY,
        });
        imagery.request = request;
        imagery.state = Cesium.ImageryState.TRANSITIONING;
        var imagePromise = imageryProvider.requestImage(
            imagery.x,
            imagery.y,
            imagery.level,
            request
        );

        if (!Cesium.defined(imagePromise)) {
            // Too many parallel requests, so postpone loading tile.
            imagery.state = Cesium.ImageryState.UNLOADED;
            imagery.request = undefined;
            return;
        }

        if (Cesium.defined(imageryProvider.getTileCredits)) {
            imagery.credits = imageryProvider.getTileCredits(
                imagery.x,
                imagery.y,
                imagery.level
            );
        }

        Cesium.when(imagePromise, success, failure);
    }

    doRequest();
};


/**
 * Create a WebGL texture for a given {@link Imagery} instance.
 *
 * @private
 *
 * @param {Context} context The rendered context to use to create textures.
 * @param {Imagery} imagery The imagery for which to create a texture.
 */
ComputeImageryLayer.prototype._createTexture = function (context, imagery) {
    var imageryProvider = this._imageryProvider;
    var image = imagery.image;

    // If this imagery provider has a discard policy, use it to check if this
    // image should be discarded.
    if (Cesium.defined(imageryProvider.tileDiscardPolicy)) {
        var discardPolicy = imageryProvider.tileDiscardPolicy;
        if (Cesium.defined(discardPolicy)) {
            // If the discard policy is not ready yet, transition back to the
            // RECEIVED state and we'll try again next time.
            if (!discardPolicy.isReady()) {
                imagery.state = Cesium.ImageryState.RECEIVED;
                return;
            }

            // Mark discarded imagery tiles invalid.  Parent imagery will be used instead.
            if (discardPolicy.shouldDiscardImage(image)) {
                imagery.state = Cesium.ImageryState.INVALID;
                return;
            }
        }
    }

    //>>includeStart('debug', pragmas.debug);
    if (
        this.minificationFilter !== Cesium.TextureMinificationFilter.NEAREST &&
        this.minificationFilter !== Cesium.TextureMinificationFilter.LINEAR
    ) {
        throw new Cesium.DeveloperError(
            "ImageryLayer minification filter must be NEAREST or LINEAR"
        );
    }
    //>>includeEnd('debug');

    // Imagery does not need to be discarded, so upload it to WebGL.
    var texture = this._createTextureWebGL(context, imagery);

    if (
        imageryProvider.tilingScheme.projection instanceof Cesium.WebMercatorProjection
    ) {
        imagery.textureWebMercator = texture;
    } else {
        imagery.texture = texture;
    }
    if (texture) {
        imagery.image = undefined;
        imagery.state = Cesium.ImageryState.TEXTURE_LOADED;
    }else{
        imagery.state = Cesium.ImageryState.INVALID;
    }
};
export default ComputeImageryLayer;
