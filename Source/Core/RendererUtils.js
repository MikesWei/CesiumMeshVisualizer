

var yUpToZUp, scratchTranslation, scratchQuaternion, scratchScale, scratchTranslationQuaternionRotationScale, clearCommandScratch;

/**
*
*@constructor
*@memberof Cesium
*/
function RendererUtils() { }
/**
*使用帧缓冲技术，执行渲染命令，渲染到纹理  
*@param {Cesium.DrawCommand|Array<Cesium.DrawCommand>}drawCommand 渲染命令（集合）
*@param {Cesium.FrameState}frameState 帧状态对象，可以从Cesium.Scene中获取
*@param {Cesium.Texture}outpuTexture 将渲染到的目标纹理对象
*@param {Cesium.Texture}[outputDepthTexture] 可选，输出的深度纹理
*/
RendererUtils.renderToTexture = function (drawCommand, frameState, outputTexture, outputDepthTexture) {
    var drawCommands = Array.isArray(drawCommand) ? drawCommand : [drawCommand];
    var context = frameState.context;

    var framebuffer = null, destroy = false;
    if (outputTexture instanceof Cesium.Framebuffer) {
        framebuffer = outputTexture;
    }
    if (!framebuffer) {
        if (!outputDepthTexture
            || outputDepthTexture.width != outputTexture.width
            || outputDepthTexture.height != outputTexture.height) {
            outputDepthTexture = new Cesium.Texture({
                context: context,
                width: outputTexture.width,
                height: outputTexture.height,
                pixelFormat: Cesium.PixelFormat.DEPTH_COMPONENT,
                pixelDatatype: Cesium.PixelDatatype.UNSIGNED_SHORT
            })

        }
        framebuffer = new Cesium.Framebuffer({
            context: context,
            colorTextures: [outputTexture],
            destroyAttachments: false,
            depthTexture: outputDepthTexture
        });
        destroy = true;
    }
    if (!clearCommandScratch) {
        clearCommandScratch = new Cesium.ClearCommand({
            color: new Cesium.Color(0.0, 0.0, 0.0, 0.0)
        });
    }
    var clearCommand = clearCommandScratch;
    clearCommand.framebuffer = framebuffer;
    clearCommand.renderState = frameState.renderState;
    clearCommand.execute(context);

    drawCommands.forEach(function (drawCommand) {
        drawCommand.framebuffer = framebuffer;
        drawCommand.execute(context);
    });
    if (destroy) {
        framebuffer.destroy();
    }
}

/**
*使用帧缓冲技术，执行渲染命令，渲染到纹理并读取像素值，可以用于实现并行计算  
*@param {Cesium.DrawCommand|Array<Cesium.DrawCommand>}drawCommand 渲染命令（集合）
*@param {Cesium.FrameState}frameState 帧状态对象，可以从Cesium.Scene中获取
*@param {Cesium.Texture}outpuTexture 将渲染到的目标纹理对象
*@param {Object}[options] 
*@param {Array.<Number>}outputPixels 
*@return {Array.<Number>}outputPixels  输出的像素
*/
RendererUtils.renderToPixels = function (drawCommand, frameState, outputTexture, options, pixels) {
    var drawCommands = Array.isArray(drawCommand) ? drawCommand : [drawCommand];
    var context = frameState.context;

    var framebuffer = null, destroy = false;
    if (outputTexture instanceof Cesium.Framebuffer) {
        framebuffer = outputTexture;
    }

    if (!framebuffer) {

        var outputDepthTexture = new Cesium.Texture({
            context: context,
            width: outputTexture.width,
            height: outputTexture.height,
            pixelFormat: Cesium.PixelFormat.DEPTH_COMPONENT,
            pixelDatatype: Cesium.PixelDatatype.UNSIGNED_SHORT
        })

        framebuffer = new Cesium.Framebuffer({
            context: context,
            colorTextures: [outputTexture],
            depthTexture: context.depthTexture ? outputDepthTexture : undefined,
            destroyAttachments: false
        });
        destroy = true;
    }
    if (!clearCommandScratch) {
        clearCommandScratch = new Cesium.ClearCommand({
            color: new Cesium.Color(0.0, 0.0, 0.0, 0.0)
        });
    }
    var clearCommand = clearCommandScratch;
    clearCommand.framebuffer = framebuffer;
    clearCommand.renderState = frameState.renderState;
    clearCommand.execute(context);

    drawCommands.forEach(function (drawCommand) {
        drawCommand.framebuffer = framebuffer;
        drawCommand.execute(context);
    });
    options = options ? options : {};

    pixels = RendererUtils.readPixels(frameState, Object.assign(options, {
        framebuffer: framebuffer
    }), pixels);
    delete options.framebuffer;
    if (destroy) {
        framebuffer.destroy();
    }
    return pixels;
}

var scratchBackBufferArray;

/**
 * Validates a framebuffer.
 * Available in debug builds only.
 * @private
 */
function validateFramebuffer(context) {
    //>>includeStart('debug', pragmas.debug);
    if (context.validateFramebuffer) {
        var gl = context._gl;
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            var message;

            switch (status) {
                case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                    message = 'Framebuffer is not complete.  Incomplete attachment: at least one attachment point with a renderbuffer or texture attached has its attached object no longer in existence or has an attached image with a width or height of zero, or the color attachment point has a non-color-renderable image attached, or the depth attachment point has a non-depth-renderable image attached, or the stencil attachment point has a non-stencil-renderable image attached.  Color-renderable formats include GL_RGBA4, GL_RGB5_A1, and GL_RGB565. GL_DEPTH_COMPONENT16 is the only depth-renderable format. GL_STENCIL_INDEX8 is the only stencil-renderable format.';
                    break;
                case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                    message = 'Framebuffer is not complete.  Incomplete dimensions: not all attached images have the same width and height.';
                    break;
                case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                    message = 'Framebuffer is not complete.  Missing attachment: no images are attached to the framebuffer.';
                    break;
                case gl.FRAMEBUFFER_UNSUPPORTED:
                    message = 'Framebuffer is not complete.  Unsupported: the combination of internal formats of the attached images violates an implementation-dependent set of restrictions.';
                    break;
            }

            throw new DeveloperError(message);
        }
    }
    //>>includeEnd('debug');
}
function bindFramebuffer(context, framebuffer) {
    if (framebuffer !== context._currentFramebuffer) {
        // this check must use typeof, not defined, because defined doesn't work with undeclared variables.
        if (typeof WebGLRenderingContext !== 'undefined') {
            scratchBackBufferArray = [Cesium.WebGLConstants.BACK];
        }
        context._currentFramebuffer = framebuffer;
        var buffers = scratchBackBufferArray;

        if (Cesium.defined(framebuffer)) {
            framebuffer._bind();
            validateFramebuffer(context);

            // TODO: Need a way for a command to give what draw buffers are active.
            buffers = framebuffer._getActiveColorAttachments();
        } else {
            var gl = context._gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        if (context.drawBuffers) {
            context.glDrawBuffers(buffers);
        }
    }
}
//var pixels;
var scratchPixelFormat;
var scratchPixelDatatype;
/**
 * @param {Cesium.FrameState}frameState
 * @param {Object}[readState]
 * @param {number}readState.x
 * @param {number}readState.y
 * @param {number}readState.width
 * @param {number}readState.height
 * @param {Cesium.PixelDatatype}readState.pixelDatatype
 * @param {Cesium.PixelFormat}readState.pixelFormat
 * @param {ArrayBufferView}pixels
 * @return {ArrayBufferView}
 */
RendererUtils.readPixels = function (frameState, readState, pixels) {
    var gl = frameState.context._gl;

    readState = readState || {};
    var x = Math.max(readState.x || 0, 0);
    var y = Math.max(readState.y || 0, 0);
    var width = readState.width || gl.drawingBufferWidth;
    var height = readState.height || gl.drawingBufferHeight;
    var pixelDatatype = readState.pixelDatatype || Cesium.PixelDatatype.UNSIGNED_BYTE;
    var pixelFormat = readState.pixelFormat || Cesium.PixelFormat.RGBA;
    var framebuffer = readState.framebuffer;

    if (width <= 0) {
        throw new Cesium.DeveloperError('readState.width must be greater than zero.');
    }

    if (height <= 0) {
        throw new Cesium.DeveloperError('readState.height must be greater than zero.');
    }

    bindFramebuffer(this, framebuffer);
    var size = 4;
    if (pixelFormat == Cesium.PixelFormat.RGB) {
        size = 3;
    } else if (pixelFormat == Cesium.PixelFormat.ALPHA) {
        size = 1;
    }

    if (!pixels) {//|| pixels.length !== size * width * height
        //|| scratchPixelFormat != pixelFormat || scratchPixelDatatype != pixelDatatype) {

        if (pixelDatatype == Cesium.PixelDatatype.FLOAT) {
            pixelDatatype = gl.FLOAT;
            pixels = new Float32Array(size * width * height);
        } else if (pixelDatatype == Cesium.PixelDatatype.UNSIGNED_BYTE) {
            pixels = new Uint8Array(size * width * height);
        } else {
            pixels = new Uint16Array(size * width * height);
        }
    }
    gl.readPixels(x, y, width, height, pixelFormat, pixelDatatype, pixels);
    scratchPixelFormat = pixelFormat;
    scratchPixelDatatype = pixelDatatype;
    return pixels;
};

/**
*
*@param {Cesium.Matrix4}srcMatrix
*@param {Cesium.Matrix4}dstMatrix
*@return {Cesium.Matrix4}
*/
RendererUtils.yUp2Zup = function (srcMatrix, dstMatrix) {
    if (!yUpToZUp) {
        yUpToZUp = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationX(Cesium.Math.PI_OVER_TWO));
    }
    return Cesium.Matrix4.multiplyTransformation(srcMatrix, yUpToZUp, dstMatrix);
}
/**
*平移、旋转或缩放，返回计算之后的模型转换矩阵
*@param {Cesium.Cartesian3}[translation=undefined]
*@param {Object}[rotation=undefined] 旋转参数
*@param {Cesium.Cartesian3}[rotation.axis] 旋转轴
*@param {Number}[rotation.angle] 旋转角度
*@param {Cesium.Cartesian3}[rotation.scale] 缩放
*@param {Cesium.Matrix4}[outModelMatrix] 计算结果矩阵，和返回值一样，但是传递此参数时则返回值不是新创建的Cesium.Matrix4实例
*@return {Cesium.Matrix4}
*/
RendererUtils.computeModelMatrix = function (srcModelMatrix, translation, rotation, scale, outModelMatrix) {
    if (arguments.length == 0) {
        return srcModelMatrix;
    }
    if (!scratchTranslation) scratchTranslation = new Cesium.Cartesian3();
    if (!scratchQuaternion) scratchQuaternion = new Cesium.Quaternion();
    if (!scratchScale) scratchScale = new Cesium.Cartesian3();
    if (!scratchTranslationQuaternionRotationScale) scratchTranslationQuaternionRotationScale = new Cesium.Matrix4()

    var Matrix4 = Cesium.Matrix4;
    if (!outModelMatrix) {
        outModelMatrix = new Matrix4();
    }
    Matrix4.clone(srcModelMatrix, outModelMatrix);

    if (!translation) {
        scratchTranslation.x = 0;
        scratchTranslation.y = 0;
        scratchTranslation.z = 0;
    }
    scratchTranslation.x = translation.x;
    scratchTranslation.y = translation.y;
    scratchTranslation.z = translation.z;

    if (!scale) {
        scratchScale.x = 0;
        scratchScale.y = 0;
        scratchScale.z = 0;
    }
    scratchScale.x = scale.x;
    scratchScale.y = scale.y;
    scratchScale.z = scale.z;

    if (rotation instanceof Cesium.Quaternion) {
        Cesium.Quaternion.clone(rotation, scratchQuaternion);
    } else {
        var axis = rotation.axis;
        var angle = rotation.angle;
        Cesium.Quaternion.fromAxisAngle(
            new Cesium.Cartesian3(axis.x, axis.y, axis.z),//axis.y=1 y是旋转轴
            Cesium.Math.toRadians(angle),
            scratchQuaternion
        );
    }

    //translate,rotate,scale

    Matrix4.fromTranslationQuaternionRotationScale(
        scratchTranslation, scratchQuaternion,
        scratchScale, scratchTranslationQuaternionRotationScale);

    Matrix4.multiplyTransformation(
        outModelMatrix,
        scratchTranslationQuaternionRotationScale,
        outModelMatrix);
    return outModelMatrix;
}

export default RendererUtils; 