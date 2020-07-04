/**
 * 
 * @param {ComputeImageryLayer} imageryLayer 
 * @param {number} x 
 * @param {number} y 
 * @param {number} level 
 * @param {Cesium.Rectangle} rectangle 
 * @constructor
 * @extends  Cesium.Imagery
 */
function ComputeImagery(imageryLayer, x, y, level, rectangle) {
    Cesium.Imagery.call(this, imageryLayer, x, y, level, rectangle);
}

ComputeImagery.prototype = Object.create(Cesium.Imagery.prototype);


ComputeImagery.prototype.addReference = function () {
    ++this.referenceCount;
};

ComputeImagery.prototype.releaseReference = function () {
    --this.referenceCount;

    if (this.referenceCount === 0) {
        this.imageryLayer.removeImageryFromCache(this);

        if (Cesium.defined(this.parent)) {
            this.parent.releaseReference();
        }

        if (Cesium.defined(this.image) && Cesium.defined(this.image.destroy)) {
            this.image.destroy();
        }

        if (Cesium.defined(this.texture)) {
            //original:this.texture.destroy();

            if (!this.texture.referenceCount) {
                this.texture.destroy();
            }
            else {
                this.texture.referenceCount = this.texture.referenceCount - 1;
            }
            delete this.texture;
        }

        if (
            Cesium.defined(this.textureWebMercator) &&
            this.texture !== this.textureWebMercator
        ) {
            this.textureWebMercator.destroy();
        }

        if (this.imageryLayer.onImageryDestroyed)
            this.imageryLayer.onImageryDestroyed(this.x, this.y, this.level);

        Cesium.destroyObject(this);

        return 0;
    }

    return this.referenceCount;
};

ComputeImagery.prototype.processStateMachine = function (
    frameState,
    needGeographicProjection,
    skipLoading
) {
    if (this.state === Cesium.ImageryState.UNLOADED && !skipLoading) {
        this.state = Cesium.ImageryState.TRANSITIONING;
        this.imageryLayer._requestImagery(this);
    }

    if (this.state === Cesium.ImageryState.RECEIVED) {
        this.state = Cesium.ImageryState.TRANSITIONING;
        this.imageryLayer._createTexture(frameState, this);//original:this.imageryLayer._createTexture(frameState.context, this);
    }

    // If the imagery is already ready, but we need a geographic version and don't have it yet,
    // we still need to do the reprojection step. This can happen if the Web Mercator version
    // is fine initially, but the geographic one is needed later.
    var needsReprojection =
        this.state === Cesium.ImageryState.READY &&
        needGeographicProjection &&
        !this.texture;

    if (this.state === Cesium.ImageryState.TEXTURE_LOADED || needsReprojection) {
        this.state = Cesium.ImageryState.TRANSITIONING;
        this.imageryLayer._reprojectTexture(
            frameState,
            this,
            needGeographicProjection
        );
    }
};
export default ComputeImagery;