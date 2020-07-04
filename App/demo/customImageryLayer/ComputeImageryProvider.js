export class IComputeImageryProviderOptions {
    constructor() {
        this.minimumLevel = 0
        this.maximumLevel = 6
        this.tileWidth = 256
        this.tileHeight = 256
        /**
         * @type {Cesium.Rectangle}
         */
        this.rectangle = Cesium.Rectangle.MAX_VALUE
        /**
         * @type {Cesium.GeographicTilingScheme}
         */
        this.tilingScheme = new Cesium.GeographicTilingScheme()
        this.hasAlphaChannel = true
    }
    /**
     * @return {Promise<boolean>|undefined}
     */
    init() {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }
    /**
     * @return {Promise<boolean>|undefined}
     */
    prepareData(x, y, level, request) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} level 
     * @param {Cesium.FrameState} frameState 
     * @param {Cesium.Texture} outputTexture 
     * @return {Cesium.Texture} outputTexture:Cesium.Texture
     */
    compute(x, y, level, frameState, outputTexture) {
        return;
    }
}

/**
 *  
 * @param {object} options 
 * @param {number} [options.minimumLevel=0]
 * @param {number} [options.maximumLevel=6]
 * @param {number} [options.tileWidth=256]
 * @param {number} [options.tileHeight=256]
 * @param {Cesium.Rectangle} [options.rectangle=Cesium.Rectangle.MAX_VALUE]
 * @param {Cesium.GeographicTilingScheme} [options.tilingScheme=new Cesium.GeographicTilingScheme()]
 * @param {boolean} [options.hasAlphaChannel=true]
 * @param {()=>(Promise<boolean>|undefined)}[options.init]
 * @param {(x:number, y:number, level:number, request:Cesium.Request)=>(Promise<boolean>|undefined)}[options.prepareData]
 * @param {(x:number, y:number, level:number, frameState:Cesium.FrameState,outputTexture:Cesium.Texture)=>Cesium.Texture}[options.compute]
 * 
 * @constructor
 * @extends Cesium.ImageryProvider
 */
function ComputeImageryProvider(options) {

    options = options || {};

    this._minimumLevel = Cesium.defaultValue(options.minimumLevel, 0);
    this._maximumLevel = Cesium.defaultValue(options.maximumLevel, 6);

    this._tileWidth = Cesium.defaultValue(options.tileWidth, 256);
    this._tileHeight = Cesium.defaultValue(options.tileHeight, 256);
    this._tilingScheme = Cesium.defaultValue(options.tilingScheme, new Cesium.GeographicTilingScheme())
    this._hasAlphaChannel = Cesium.defaultValue(options.hasAlphaChannel, true);
    this._rectangle = Cesium.defaultValue(options.rectangle, Cesium.Rectangle.MAX_VALUE);

    this._ready = false;
    this._readyPromise = Cesium.when.defer();

    this._errorEvent = new Cesium.Event();

    if (typeof options.compute == 'function') {
        this.compute = options.compute;
    }
    if (typeof options.init == 'function') {
        this.init = options.init;
    }
    if (typeof options.prepareData == 'function') {
        this.prepareData = options.prepareData;
    }

    Cesium.requestAnimationFrame(() => {
        this._init();
    })

}

Object.defineProperties(ComputeImageryProvider.prototype, {
    /**
     * Gets a value indicating whether or not the provider is ready for use.
     * @memberof ComputeImageryProvider.prototype
     * @type {Boolean}
     * @readonly
     */
    ready: {
        get: function () {
            return this._ready;
        }
    },

    /**
     * Gets a promise that resolves to true when the provider is ready for use.
     * @memberof ComputeImageryProvider.prototype
     * @type {Promise.<Boolean>}
     * @readonly
     */
    readyPromise: {
        get: function () {
            return this._readyPromise;
        }
    },

    /**
     * Gets the rectangle, in radians, of the imagery provided by the instance.  This function should
     * not be called before {@link ComputeImageryProvider#ready} returns true.
     * @memberof ComputeImageryProvider.prototype
     * @type {Rectangle}
     * @readonly
     */
    rectangle: {
        get: function () {
            return this._rectangle;
        },
        set: function (val) {
            this._rectangle = val;
            if (this._imageryLayer) {
                this._imageryLayer.rectangle = this._rectangle;
            }
        }
    },

    /**
     * Gets the width of each tile, in pixels.  This function should
     * not be called before {@link ComputeImageryProvider#ready} returns true.
     * @memberof ComputeImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    tileWidth: {
        get: function () {
            return this._tileWidth;
        }
    },

    /**
     * Gets the height of each tile, in pixels.  This function should
     * not be called before {@link ComputeImageryProvider#ready} returns true.
     * @memberof ComputeImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    tileHeight: {
        get: function () {
            return this._tileHeight;
        }
    },

    /**
     * Gets the maximum level-of-detail that can be requested.  This function should
     * not be called before {@link ComputeImageryProvider#ready} returns true.
     * @memberof ComputeImageryProvider.prototype
     * @type {Number|undefined}
     * @readonly
     */
    maximumLevel: {
        get: function () {
            return this._maximumLevel;
        }
    },

    /**
     * Gets the minimum level-of-detail that can be requested.  This function should
     * not be called before {@link ComputeImageryProvider#ready} returns true. Generally,
     * a minimum level should only be used when the rectangle of the imagery is small
     * enough that the number of tiles at the minimum level is small.  An imagery
     * provider with more than a few tiles at the minimum level will lead to
     * rendering problems.
     * @memberof ComputeImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    minimumLevel: {
        get: function () {
            return this._minimumLevel;
        }
    },

    /**
     * Gets the tiling scheme used by the provider.  This function should
     * not be called before {@link ComputeImageryProvider#ready} returns true.
     * @memberof ComputeImageryProvider.prototype
     * @type {TilingScheme}
     * @readonly
     */
    tilingScheme: {
        get: function () {
            return this._tilingScheme;
        }
    },

    /**
     * Gets the tile discard policy.  If not undefined, the discard policy is responsible
     * for filtering out "missing" tiles via its shouldDiscardImage function.  If this function
     * returns undefined, no tiles are filtered.  This function should
     * not be called before {@link ComputeImageryProvider#ready} returns true.
     * @memberof ComputeImageryProvider.prototype
     * @type {TileDiscardPolicy}
     * @readonly
     */
    tileDiscardPolicy: {
        get: function () {
            return undefined;
        }
    },

    /**
     * Gets an event that is raised when the imagery provider encounters an asynchronous error..  By subscribing
     * to the event, you will be notified of the error and can potentially recover from it.  Event listeners
     * are passed an instance of {@link TileProviderError}.
     * @memberof ComputeImageryProvider.prototype
     * @type {Event}
     * @readonly
     */
    errorEvent: {
        get: function () {
            return this._errorEvent;
        }
    },

    /**
     * Gets the credit to display when this imagery provider is active.  Typically this is used to credit
     * the source of the imagery. This function should
     * not be called before {@link ComputeImageryProvider#ready} returns true.
     * @memberof ComputeImageryProvider.prototype
     * @type {Credit}
     * @readonly
     */
    credit: {
        get: function () {
            return undefined;
        }
    },

    /**
     * Gets the proxy used by this provider.
     * @memberof ComputeImageryProvider.prototype
     * @type {Proxy}
     * @readonly
     */
    proxy: {
        get: function () {
            return undefined;
        }
    },

    /**
     * Gets a value indicating whether or not the images provided by this imagery provider
     * include an alpha channel.  If this property is false, an alpha channel, if present, will
     * be ignored.  If this property is true, any images without an alpha channel will be treated
     * as if their alpha is 1.0 everywhere.  When this property is false, memory usage
     * and texture upload time are reduced.
     * @memberof ComputeImageryProvider.prototype
     * @type {Boolean}
     * @readonly
     */
    hasAlphaChannel: {
        get: function () {
            return this._hasAlphaChannel;
        }
    },
});

/**
 * Requests the image for a given tile.  This function should
 * not be called before {@link ComputeImageryProvider#ready} returns true.
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level.
 * @param {Request} [request] The request object. Intended for internal use only.
 * @returns {Promise.<HTMLImageElement|HTMLCanvasElement>|undefined} A promise for the image that will resolve when the image is available, or
 *          undefined if there are too many active requests to the server, and the request
 *          should be retried later.  The resolved image may be either an
 *          Image or a Canvas DOM object.
 *
 * @exception {DeveloperError} <code>requestImage</code> must not be called before the imagery provider is ready.
 */
ComputeImageryProvider.prototype.requestImage = function (x, y, level, request) {
    return this.prepareData(x, y, level, request);
};

/**
 * Asynchronously determines what features, if any, are located at a given longitude and latitude within
 * a tile.  This function should not be called before {@link ComputeImageryProvider#ready} returns true.
 * This function is optional, so it may not exist on all ImageryProviders.
 *
 * @function
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level.
 * @param {Number} longitude The longitude at which to pick features.
 * @param {Number} latitude  The latitude at which to pick features.
 * @return {Promise.<ImageryLayerFeatureInfo[]>|undefined} A promise for the picked features that will resolve when the asynchronous
 *                   picking completes.  The resolved value is an array of {@link ImageryLayerFeatureInfo}
 *                   instances.  The array may be empty if no features are found at the given location.
 *                   It may also be undefined if picking is not supported.
 *
 * @exception {DeveloperError} <code>pickFeatures</code> must not be called before the imagery provider is ready.
 */
ComputeImageryProvider.prototype.pickFeatures = function (
    x,
    y,
    level,
    longitude,
    latitude
) {
    return;
};

/**
 * 
 * @param {number} x
 * @param {number} y
 * @param {number} level
 * @param {Cesium.FrameState} frameState 
 * @param {Cesium.Texture} [outputTexture] 
 * @return {Cesium.Texture} outputTexture,type: Cesium.Texture
 * @private
 */
ComputeImageryProvider.prototype._compute = function (
    x,
    y,
    level,
    frameState,
    outputTexture) {

    this._frameState = frameState;
    return this.compute(x, y, level, frameState, outputTexture);
}

/**
 * @private
 */
ComputeImageryProvider.prototype._init = function () {
    var that = this;
    if (typeof this.init == 'function') {
        Cesium.when(this.init(), function () {
            that._ready = true;
            that._readyPromise.resolve(true);
        })
    }
    else {
        that._ready = true;
        that._readyPromise.resolve(true);
    }
}


/**
 * 
 */
ComputeImageryProvider.prototype.init = function () {
    return true;
}

/**
 * Requests the data for a given tile.  This function should
 * not be called before {@link ComputeImageryProvider#ready} returns true.
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level.
 * @param {Cesium.Request} [request] The request object. Intended for internal use only.
 * @returns {Promise.<boolean>|undefined}  
 */
ComputeImageryProvider.prototype.prepareData = function (x, y, level, request) {
    return true;
};
/**
 * 
 * @param {number} x
 * @param {number} y
 * @param {number} level
 * @param {Cesium.FrameState} frameState 
 * @param {Cesium.Texture} [outputTexture] 
 * @return {Cesium.Texture} outputTexture,type: Cesium.Texture
 */
ComputeImageryProvider.prototype.compute = function (
    x,
    y,
    level,
    frameState,
    outputTexture) {
    return;
}
/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} level 
 */
ComputeImageryProvider.prototype.onTileDestroyed = function (x, y, level) {
}
export default ComputeImageryProvider;