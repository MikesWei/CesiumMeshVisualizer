define(function () {
    var Cartesian3 = Cesium.Cartesian3;
    var CesiumMath = Cesium.Math;
    var yUpToZUp = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationX(CesiumMath.PI_OVER_TWO));
    var scratchTranslation = new Cesium.Cartesian3();
    var scratchQuaternion = new Cesium.Quaternion();
    var scratchScale = new Cesium.Cartesian3();
    var scratchTranslationQuaternionRotationScale = new Cesium.Matrix4();
    var computeModelMatrix = new Cesium.Matrix4();
    var scratchPosition = new Cesium.Cartesian3();
    var clearCommandScratch = new Cesium.ClearCommand({
        color: new Cesium.Color(0.0, 0.0, 0.0, 0.0)
    });

    /**
    *
    *@constructor
    *@memberof Cesium
    */
    function RendererUtils() { }
    /**
    *使用帧缓冲技术，执行渲染命令，渲染到纹理  
    *@param {Cesium.DrawCommand|Array<Cesium.DrawCommand>}drawCommand 渲染命令
    *@param {Cesium.FrameState}frameState 帧状态对象，可以从Cesium.Scene中获取
    *@param {Cesium.Texture}outpuTexture 将渲染到的目标纹理对象
    */
    RendererUtils.renderToTexture = function (drawCommand, frameState, outputTexture) {
        var drawCommands = Cesium.isArray(drawCommand) ? drawCommand : [drawCommand];
        var context = frameState.context;

        var framebuffer = new Cesium.Framebuffer({
            context: context,
            colorTextures: [outputTexture],
            destroyAttachments: false
        });

        var clearCommand = clearCommandScratch;
        clearCommand.framebuffer = framebuffer;
        clearCommand.renderState = frameState.renderState;
        clearCommand.execute(context);

        drawCommands.forEach(function (drawCommand) {
            drawCommand.framebuffer = framebuffer;
            drawCommand.execute(context);
        });

        framebuffer.destroy();
    }

    /**
    *
    *@param {Cesium.Matrix4}srcMatrix
    *@param {Cesium.Matrix4}dstMatrix
    *@param {Cesium.Matrix4}
    */
    RendererUtils.yUp2Zup = function (srcMatrix, dstMatrix) {
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
                    new Cartesian3(axis.x, axis.y, axis.z),//axis.y=1 y是旋转轴
                    CesiumMath.toRadians(angle),
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

    return RendererUtils;

})