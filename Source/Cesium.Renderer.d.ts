//Cesium/Source/Renderer/*
export =Cesium;
export as namespace Cesium;
declare namespace Cesium {

    /**
     * @private
     */
    export enum BufferUsage {
        STREAM_DRAW = WebGLConstants.STREAM_DRAW,
        STATIC_DRAW = WebGLConstants.STATIC_DRAW,
        DYNAMIC_DRAW = WebGLConstants.DYNAMIC_DRAW
    }

    /**
     * @private
     */
    export class Buffer {
        constructor(options: {
            context: Context
            bufferTarget: number
            typedArray: ArrayBufferView
            sizeInBytes: number
            usage: BufferUsage

        })

        _gl: WebGL2RenderingContext | WebGLRenderingContext
        _webgl2: boolean
        _bufferTarget: number
        _sizeInBytes: number
        _usage: BufferUsage
        _buffer: WebGLBuffer
        vertexArrayDestroyable: boolean
        /**
         * @readonly
         */
        sizeInBytes: number
        /**
         * @readonly
         */
        usage: BufferUsage
        _getBuffer: () => WebGLBuffer
        copyFromArrayView: (arrayView: ArrayBufferView, offsetInBytes: number) => void
        copyFromBuffer: (
            readBuffer: Buffer,
            readOffset: number,
            writeOffset: number,
            sizeInBytes: number
        ) => void
        getBufferData: (
            arrayView: ArrayBufferView,
            sourceOffset: number,
            destinationOffset: number,
            length: number
        ) => void

        isDestroyed: () => boolean
        destroy: () => any

        /**
         * Creates a vertex buffer, which contains untyped vertex data in GPU-controlled memory.
         * <br /><br />
         * A vertex array defines the actual makeup of a vertex, e.g., positions, normals, texture coordinates,
         * etc., by interpreting the raw data in one or more vertex buffers.
         *
         * @param {Object} options An object containing the following properties:
         * @param {Context} options.context The context in which to create the buffer
         * @param {ArrayBufferView} [options.typedArray] A typed array containing the data to copy to the buffer.
         * @param {Number} [options.sizeInBytes] A <code>Number</code> defining the size of the buffer in bytes. Required if options.typedArray is not given.
         * @param {BufferUsage} options.usage Specifies the expected usage pattern of the buffer. On some GL implementations, this can significantly affect performance. See {@link BufferUsage}.
         * @returns {VertexBuffer} The vertex buffer, ready to be attached to a vertex array.
         *
         * @exception {DeveloperError} Must specify either <options.typedArray> or <options.sizeInBytes>, but not both.
         * @exception {DeveloperError} The buffer size must be greater than zero.
         * @exception {DeveloperError} Invalid <code>usage</code>.
         *
         *
         * @example
         * // Example 1. Create a dynamic vertex buffer 16 bytes in size.
         * var buffer = Buffer.createVertexBuffer({
         *     context : context,
         *     sizeInBytes : 16,
         *     usage : BufferUsage.DYNAMIC_DRAW
         * });
         *
         * @example
         * // Example 2. Create a dynamic vertex buffer from three floating-point values.
         * // The data copied to the vertex buffer is considered raw bytes until it is
         * // interpreted as vertices using a vertex array.
         * var positionBuffer = buffer.createVertexBuffer({
         *     context : context,
         *     typedArray : new Float32Array([0, 0, 0]),
         *     usage : BufferUsage.STATIC_DRAW
         * });
         *
         * @see {@link https://www.khronos.org/opengles/sdk/docs/man/xhtml/glGenBuffer.xml|glGenBuffer}
         * @see {@link https://www.khronos.org/opengles/sdk/docs/man/xhtml/glBindBuffer.xml|glBindBuffer} with <code>ARRAY_BUFFER</code>
         * @see {@link https://www.khronos.org/opengles/sdk/docs/man/xhtml/glBufferData.xml|glBufferData} with <code>ARRAY_BUFFER</code>
         */
        static createVertexBuffer: (options: {
            context: Context
            typedArray?: ArrayBufferView
            usage: BufferUsage
            sizeInBytes?: number
        }) => Buffer

        /**
         * Creates an index buffer, which contains typed indices in GPU-controlled memory.
         * <br /><br />
         * An index buffer can be attached to a vertex array to select vertices for rendering.
         * <code>Context.draw</code> can render using the entire index buffer or a subset
         * of the index buffer defined by an offset and count.
         *
         * @param {Object} options An object containing the following properties:
         * @param {Context} options.context The context in which to create the buffer
         * @param {ArrayBufferView} [options.typedArray] A typed array containing the data to copy to the buffer.
         * @param {Number} [options.sizeInBytes] A <code>Number</code> defining the size of the buffer in bytes. Required if options.typedArray is not given.
         * @param {BufferUsage} options.usage Specifies the expected usage pattern of the buffer. On some GL implementations, this can significantly affect performance. See {@link BufferUsage}.
         * @param {IndexDatatype} options.indexDatatype The datatype of indices in the buffer.
         * @returns {IndexBuffer} The index buffer, ready to be attached to a vertex array.
         *
         * @exception {DeveloperError} Must specify either <options.typedArray> or <options.sizeInBytes>, but not both.
         * @exception {DeveloperError} IndexDatatype.UNSIGNED_INT requires OES_element_index_uint, which is not supported on this system. Check context.elementIndexUint.
         * @exception {DeveloperError} The size in bytes must be greater than zero.
         * @exception {DeveloperError} Invalid <code>usage</code>.
         * @exception {DeveloperError} Invalid <code>indexDatatype</code>.
         *
         *
         * @example
         * // Example 1. Create a stream index buffer of unsigned shorts that is
         * // 16 bytes in size.
         * var buffer = Buffer.createIndexBuffer({
         *     context : context,
         *     sizeInBytes : 16,
         *     usage : BufferUsage.STREAM_DRAW,
         *     indexDatatype : IndexDatatype.UNSIGNED_SHORT
         * });
         *
         * @example
         * // Example 2. Create a static index buffer containing three unsigned shorts.
         * var buffer = Buffer.createIndexBuffer({
         *     context : context,
         *     typedArray : new Uint16Array([0, 1, 2]),
         *     usage : BufferUsage.STATIC_DRAW,
         *     indexDatatype : IndexDatatype.UNSIGNED_SHORT
         * });
         *
         * @see {@link https://www.khronos.org/opengles/sdk/docs/man/xhtml/glGenBuffer.xml|glGenBuffer}
         * @see {@link https://www.khronos.org/opengles/sdk/docs/man/xhtml/glBindBuffer.xml|glBindBuffer} with <code>ELEMENT_ARRAY_BUFFER</code>
         * @see {@link https://www.khronos.org/opengles/sdk/docs/man/xhtml/glBufferData.xml|glBufferData} with <code>ELEMENT_ARRAY_BUFFER</code>
         */
       static createIndexBuffer: (options: {
            context: Context
            sizeInBytes?: number
            usage: BufferUsage
            indexDatatype: IndexDatatype
            typedArray?: ArrayBufferView
        }) => Buffer
    }

    /**
     * The render pass for a command.
     *
     * @private
     */
    export enum Pass {
        // If you add/modify/remove Pass constants, also change the automatic GLSL constants
        // that start with 'czm_pass'
        //
        // Commands are executed in order by pass up to the translucent pass.
        // Translucent geometry needs special handling (sorting/OIT). The compute pass
        // is executed first and the overlay pass is executed last. Both are not sorted
        // by frustum.
        ENVIRONMENT = 0,
        COMPUTE = 1,
        GLOBE = 2,
        TERRAIN_CLASSIFICATION = 3,
        CESIUM_3D_TILE = 4,
        CESIUM_3D_TILE_CLASSIFICATION = 5,
        CESIUM_3D_TILE_CLASSIFICATION_IGNORE_SHOW = 6,
        OPAQUE = 7,
        TRANSLUCENT = 8,
        OVERLAY = 9,
        NUMBER_OF_PASSES = 10
    }

    /**
     * Represents a command to the renderer for clearing a framebuffer.
     *
     * @private 
     */
    export class ClearCommand {

        constructor(options: {
            /**
         * The value to clear the color buffer to.  When <code>undefined</code>, the color buffer is not cleared.
         *
         * @type {Color}
         *
         * @default undefined
         */
            color: Color

            /**
             * The value to clear the depth buffer to.  When <code>undefined</code>, the depth buffer is not cleared.
             *
             * @type {Number}
             *
             * @default undefined
             */
            depth: number

            /**
             * The value to clear the stencil buffer to.  When <code>undefined</code>, the stencil buffer is not cleared.
             *
             * @type {Number}
             *
             * @default undefined
             */
            stencil: number

            /**
             * The render state to apply when executing the clear command.  The following states affect clearing:
             * scissor test, color mask, depth mask, and stencil mask.  When the render state is
             * <code>undefined</code>, the default render state is used.
             *
             * @type {RenderState}
             *
             * @default undefined
             */
            renderState: RenderState

            /**
             * The framebuffer to clear.
             *
             * @type {Framebuffer}
             *
             * @default undefined
             */
            framebuffer: Framebuffer

            /**
             * The object who created this command.  This is useful for debugging command
             * execution; it allows you to see who created a command when you only have a
             * reference to the command, and can be used to selectively execute commands
             * with {@link Scene#debugCommandFilter}.
             *
             * @type {Object}
             *
             * @default undefined
             *
             * @see Scene#debugCommandFilter
             */
            owner: object

            /**
             * The pass in which to run this command.
             *
             * @type {Pass}
             *
             * @default undefined
             */
            pass: Pass
        })

        /**
         * The value to clear the color buffer to.  When <code>undefined</code>, the color buffer is not cleared.
         *
         * @type {Color}
         *
         * @default undefined
         */
        color: Color

        /**
         * The value to clear the depth buffer to.  When <code>undefined</code>, the depth buffer is not cleared.
         *
         * @type {Number}
         *
         * @default undefined
         */
        depth: number

        /**
         * The value to clear the stencil buffer to.  When <code>undefined</code>, the stencil buffer is not cleared.
         *
         * @type {Number}
         *
         * @default undefined
         */
        stencil: number

        /**
         * The render state to apply when executing the clear command.  The following states affect clearing:
         * scissor test, color mask, depth mask, and stencil mask.  When the render state is
         * <code>undefined</code>, the default render state is used.
         *
         * @type {RenderState}
         *
         * @default undefined
         */
        renderState: RenderState

        /**
         * The framebuffer to clear.
         *
         * @type {Framebuffer}
         *
         * @default undefined
         */
        framebuffer: Framebuffer

        /**
         * The object who created this command.  This is useful for debugging command
         * execution; it allows you to see who created a command when you only have a
         * reference to the command, and can be used to selectively execute commands
         * with {@link Scene#debugCommandFilter}.
         *
         * @type {Object}
         *
         * @default undefined
         *
         * @see Scene#debugCommandFilter
         */
        owner: object

        /**
         * The pass in which to run this command.
         *
         * @type {Pass}
         *
         * @default undefined
         */
        pass: Pass

        /**
         * Clears color to (0.0, 0.0, 0.0, 0.0); depth to 1.0; and stencil to 0.
         *
         * @type {ClearCommand}
         *
         * @constant
         */
        static ALL = ClearCommand

        execute(context: Context, passState: PassState): void
    }

    /**
     * @private
     */
    export class CubeMap {
        constructor(options: {
            context: Context
            source: {
                positiveX: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
                negativeX: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
                positiveY: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
                negativeY: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
                positiveZ: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
                negativeZ: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
            }
            pixelFormat?: PixelFormat
            pixelDatatype?: PixelDatatype
            preMultiplyAlpha?: boolean
            width?: number
            height?: number
            flipY?: boolean
        })

        _context: Context

        positiveX: CubeMapFace
        negativeX: CubeMapFace
        positiveY: CubeMapFace
        negativeY: CubeMapFace
        positiveZ: CubeMapFace
        negativeZ: CubeMapFace
        sampler: Sampler
        pixelFormat: PixelFormat
        pixelDatatype: number
        width: number
        height: number
        sizeInBytes: number
        preMultiplyAlpha: boolean
        flipY: boolean

        _target: number

        /**
         * Generates a complete mipmap chain for each cubemap face.
         *
         * @param {MipmapHint} [hint=MipmapHint.DONT_CARE] A performance vs. quality hint.
         *
         * @exception {DeveloperError} hint is invalid.
         * @exception {DeveloperError} This CubeMap's width must be a power of two to call generateMipmap().
         * @exception {DeveloperError} This CubeMap's height must be a power of two to call generateMipmap().
         * @exception {DeveloperError} This CubeMap was destroyed, i.e., destroy() was called.
         *
         * @example
         * // Generate mipmaps, and then set the sampler so mipmaps are used for
         * // minification when the cube map is sampled.
         * cubeMap.generateMipmap();
         * cubeMap.sampler = new Sampler({
         *   minificationFilter : Cesium.TextureMinificationFilter.NEAREST_MIPMAP_LINEAR
         * });
         */
        generateMipmap(hint): void

        isDestroyed(): boolean

        destroy(): any
    }

    /**
     * Asynchronously loads six images and creates a cube map.  Returns a promise that
     * will resolve to a {@link CubeMap} once loaded, or reject if any image fails to load.
     *
     * @function loadCubeMap
     *
     * @param {Context} context The context to use to create the cube map.
     * @param {Object} urls The source URL of each image.  See the example below.
     * @returns {Promise.<CubeMap>} a promise that will resolve to the requested {@link CubeMap} when loaded.
     *
     * @exception {DeveloperError} context is required.
     * @exception {DeveloperError} urls is required and must have positiveX, negativeX, positiveY, negativeY, positiveZ, and negativeZ properties.
     *
     *
     * @example
     * Cesium.loadCubeMap(context, {
     *     positiveX : 'skybox_px.png',
     *     negativeX : 'skybox_nx.png',
     *     positiveY : 'skybox_py.png',
     *     negativeY : 'skybox_ny.png',
     *     positiveZ : 'skybox_pz.png',
     *     negativeZ : 'skybox_nz.png'
     * }).then(function(cubeMap) {
     *     // use the cubemap
     * }).otherwise(function(error) {
     *     // an error occurred
     * });
     *
     * @see {@link http://www.w3.org/TR/cors/|Cross-Origin Resource Sharing}
     * @see {@link http://wiki.commonjs.org/wiki/Promises/A|CommonJS Promises/A}
     *
     * @private
     */
    export function loadCubeMap(context: Context, urls: string): Promise<CubeMap>

    /**
     * The state for a particular rendering pass.  This is used to supplement the state
     * in a command being executed.
     *
     * @private
     * @constructor
     */
    export class PassState {
        constructor(context)
        /**
         * The context used to execute commands for this pass.
         *
         * @type {Context}
         */
        context: Context

        /**
         * The framebuffer to render to.  This framebuffer is used unless a {@link DrawCommand}
         * or {@link ClearCommand} explicitly define a framebuffer, which is used for off-screen
         * rendering.
         *
         * @type {Framebuffer}
         * @default undefined
         */
        framebuffer: Framebuffer

        /**
         * When defined, this overrides the blending property of a {@link DrawCommand}'s render state.
         * This is used to, for example, to allow the renderer to turn off blending during the picking pass.
         * <p>
         * When this is <code>undefined</code>, the {@link DrawCommand}'s property is used.
         * </p>
         *
         * @type {Boolean}
         * @default undefined
         */
        blendingEnabled: Boolean

        /**
         * When defined, this overrides the scissor test property of a {@link DrawCommand}'s render state.
         * This is used to, for example, to allow the renderer to scissor out the pick region during the picking pass.
         * <p>
         * When this is <code>undefined</code>, the {@link DrawCommand}'s property is used.
         * </p>
         *
         * @type {Object}
         * @default undefined
         */
        scissorTest: Object

        /**
         * The viewport used when one is not defined by a {@link DrawCommand}'s render state.
         * @type {BoundingRectangle}
         * @default undefined
         */
        viewport: BoundingRectangle
    }
 
    /**
     * @private
     */
    interface PickId {
        _pickObjects: object
        key: string
        color: Color
        destroy: () => void
    }

    /**
     * @private
     */
    interface IRenderState {
        frontFace: WindingOrder //= defaultValue(rs.frontFace, WindingOrder.COUNTER_CLOCKWISE);
        cull: {
            enabled: boolean// defaultValue(cull.enabled, false),
            face: CullFace// WebGLConstants.BACK|WebGLConstants.FRONT|WebGLConstants.FRONT_AND_BACK //defaultValue(cull.face, WebGLConstants.BACK),
        };

        lineWidth: number//= defaultValue(rs.lineWidth, 1.0);
        polygonOffset: {
            enabled: boolean //defaultValue(polygonOffset.enabled, false),
            factor: number // defaultValue(polygonOffset.factor, 0),
            units: number// defaultValue(polygonOffset.units, 0),
        };
        scissorTest: {
            enabled: boolean// defaultValue(scissorTest.enabled, false),
            rectangle: BoundingRectangle// BoundingRectangle.clone(scissorTestRectangle),
        };
        depthRange: {
            near: number// defaultValue(depthRange.near, 0),
            far: number//defaultValue(depthRange.far, 1),
        };
        depthTest: {
            enabled: boolean// defaultValue(depthTest.enabled, false),
            func: DepthFunction// WebGLConstants.LESS|WebGLConstants.LEQUAL|WebGLConstants.GREATER|WebGLConstants.GEQUAL //defaultValue(depthTest.func, WebGLConstants.LESS), // func, because function is a JavaScript keyword
        };
        colorMask: {
            red: boolean// defaultValue(colorMask.red, true),
            green: boolean//defaultValue(colorMask.green, true),
            blue: boolean//defaultValue(colorMask.blue, true),
            alpha: boolean//defaultValue(colorMask.alpha, true),
        };
        depthMask: boolean// defaultValue(rs.depthMask, true);
        stencilMask: number// defaultValue(rs.stencilMask, ~0);
        blending: {
            enabled: boolean// defaultValue(blending.enabled, false),
            color: Color
            equationRgb: BlendEquation// WebGLConstants.FUNC_ADD|WebGLConstants.FUNC_SUBTRACT|WebGLConstants.FUNC_REVERSE_SUBTRACT //defaultValue(blending.equationRgb, WebGLConstants.FUNC_ADD),
            equationAlpha: BlendEquation //WebGLConstants.FUNC_ADD|WebGLConstants.FUNC_SUBTRACT|WebGLConstants.FUNC_REVERSE_SUBTRACT
            // defaultValue(
            //   blending.equationAlpha,
            //   WebGLConstants.FUNC_ADD
            // ),
            functionSourceRgb: BlendFunction// WebGLConstants.ONE| WebGLConstants.ZERO| WebGLConstants.ON
            // defaultValue(
            //   blending.functionSourceRgb,
            //   WebGLConstants.ONE
            // ),
            functionSourceAlpha: BlendFunction
            // defaultValue(
            //   blending.functionSourceAlpha,
            //   WebGLConstants.ONE
            // ),
            functionDestinationRgb: BlendFunction
            functionDestinationAlpha: BlendFunction
        };
        stencilTest: {
            enabled: boolean //defaultValue(stencilTest.enabled, false),
            frontFunction: StencilFunction
            backFunction: StencilFunction //defaultValue(stencilTest.backFunction, WebGLConstants.ALWAYS),
            reference: number// defaultValue(stencilTest.reference, 0),
            mask: number// defaultValue(stencilTest.mask, ~0),
            frontOperation: {
                fail: StencilOperation //defaultValue(stencilTestFrontOperation.fail, WebGLConstants.KEEP),
                zFail: StencilOperation//defaultValue(stencilTestFrontOperation.zFail, WebGLConstants.KEEP),
                zPass: StencilOperation// defaultValue(stencilTestFrontOperation.zPass, WebGLConstants.KEEP),
            },
            backOperation: {
                fail: StencilOperation//defaultValue(stencilTestBackOperation.fail, WebGLConstants.KEEP),
                zFail: StencilOperation//defaultValue(stencilTestBackOperation.zFail, WebGLConstants.KEEP),
                zPass: StencilOperation//defaultValue(stencilTestBackOperation.zPass, WebGLConstants.KEEP),
            },
        };
        sampleCoverage: {
            enabled: boolean// defaultValue(sampleCoverage.enabled, false),
            value: number// defaultValue(sampleCoverage.value, 1.0),
            invert: boolean// defaultValue(sampleCoverage.invert, false),
        };
        viewport: {
            x: number
            y: number
            width: number
            height: number
        }
    }

    /**
     * @private
     */
    export  class RenderState extends IRenderState {
        constructor(renderState: IRenderState)

        /**
         * Validates and then finds or creates an immutable render state, which defines the pipeline
         * state for a {@link DrawCommand} or {@link ClearCommand}.  All inputs states are optional.  Omitted states
         * use the defaults shown in the example below.
         *
         * @param {Object} [renderState] The states defining the render state as shown in the example below.
         *
         * @exception {RuntimeError} renderState.lineWidth is out of range.
         * @exception {DeveloperError} Invalid renderState.frontFace.
         * @exception {DeveloperError} Invalid renderState.cull.face.
         * @exception {DeveloperError} scissorTest.rectangle.width and scissorTest.rectangle.height must be greater than or equal to zero.
         * @exception {DeveloperError} renderState.depthRange.near can't be greater than renderState.depthRange.far.
         * @exception {DeveloperError} renderState.depthRange.near must be greater than or equal to zero.
         * @exception {DeveloperError} renderState.depthRange.far must be less than or equal to zero.
         * @exception {DeveloperError} Invalid renderState.depthTest.func.
         * @exception {DeveloperError} renderState.blending.color components must be greater than or equal to zero and less than or equal to one
         * @exception {DeveloperError} Invalid renderState.blending.equationRgb.
         * @exception {DeveloperError} Invalid renderState.blending.equationAlpha.
         * @exception {DeveloperError} Invalid renderState.blending.functionSourceRgb.
         * @exception {DeveloperError} Invalid renderState.blending.functionSourceAlpha.
         * @exception {DeveloperError} Invalid renderState.blending.functionDestinationRgb.
         * @exception {DeveloperError} Invalid renderState.blending.functionDestinationAlpha.
         * @exception {DeveloperError} Invalid renderState.stencilTest.frontFunction.
         * @exception {DeveloperError} Invalid renderState.stencilTest.backFunction.
         * @exception {DeveloperError} Invalid renderState.stencilTest.frontOperation.fail.
         * @exception {DeveloperError} Invalid renderState.stencilTest.frontOperation.zFail.
         * @exception {DeveloperError} Invalid renderState.stencilTest.frontOperation.zPass.
         * @exception {DeveloperError} Invalid renderState.stencilTest.backOperation.fail.
         * @exception {DeveloperError} Invalid renderState.stencilTest.backOperation.zFail.
         * @exception {DeveloperError} Invalid renderState.stencilTest.backOperation.zPass.
         * @exception {DeveloperError} renderState.viewport.width must be greater than or equal to zero.
         * @exception {DeveloperError} renderState.viewport.width must be less than or equal to the maximum viewport width.
         * @exception {DeveloperError} renderState.viewport.height must be greater than or equal to zero.
         * @exception {DeveloperError} renderState.viewport.height must be less than or equal to the maximum viewport height.
         *
         *
         * @example
         * var defaults = {
         *     frontFace : WindingOrder.COUNTER_CLOCKWISE,
         *     cull : {
         *         enabled : false,
         *         face : CullFace.BACK
         *     },
         *     lineWidth : 1,
         *     polygonOffset : {
         *         enabled : false,
         *         factor : 0,
         *         units : 0
         *     },
         *     scissorTest : {
         *         enabled : false,
         *         rectangle : {
         *             x : 0,
         *             y : 0,
         *             width : 0,
         *             height : 0
         *         }
         *     },
         *     depthRange : {
         *         near : 0,
         *         far : 1
         *     },
         *     depthTest : {
         *         enabled : false,
         *         func : DepthFunction.LESS
         *      },
         *     colorMask : {
         *         red : true,
         *         green : true,
         *         blue : true,
         *         alpha : true
         *     },
         *     depthMask : true,
         *     stencilMask : ~0,
         *     blending : {
         *         enabled : false,
         *         color : {
         *             red : 0.0,
         *             green : 0.0,
         *             blue : 0.0,
         *             alpha : 0.0
         *         },
         *         equationRgb : BlendEquation.ADD,
         *         equationAlpha : BlendEquation.ADD,
         *         functionSourceRgb : BlendFunction.ONE,
         *         functionSourceAlpha : BlendFunction.ONE,
         *         functionDestinationRgb : BlendFunction.ZERO,
         *         functionDestinationAlpha : BlendFunction.ZERO
         *     },
         *     stencilTest : {
         *         enabled : false,
         *         frontFunction : StencilFunction.ALWAYS,
         *         backFunction : StencilFunction.ALWAYS,
         *         reference : 0,
         *         mask : ~0,
         *         frontOperation : {
         *             fail : StencilOperation.KEEP,
         *             zFail : StencilOperation.KEEP,
         *             zPass : StencilOperation.KEEP
         *         },
         *         backOperation : {
         *             fail : StencilOperation.KEEP,
         *             zFail : StencilOperation.KEEP,
         *             zPass : StencilOperation.KEEP
         *         }
         *     },
         *     sampleCoverage : {
         *         enabled : false,
         *         value : 1.0,
         *         invert : false
         *      }
         * };
         *
         * var rs = RenderState.fromCache(defaults);
         *
         * @see DrawCommand
         * @see ClearCommand
         *
         * @private
         */
        static fromCache: (renderState: IRenderState) => RenderState
    }

    /**
     * @private
     * @constructor
     */
    export class Context {
        constructor(canvas: HTMLCanvasElement, options: Object)

        isDestroyed: () => void

        destroy: () => any
        /**
         * Creates a unique ID associated with the input object for use with color-buffer picking.
         * The ID has an RGBA color value unique to this context.  You must call destroy()
         * on the pick ID when destroying the input object.
         *
         * @param {Object} object The object to associate with the pick ID.
         * @returns {Object} A PickId object with a <code>color</code> property.
         *
         * @exception {RuntimeError} Out of unique Pick IDs.
         *
         *
         * @example
         * this._pickId = context.createPickId({
         *   primitive : this,
         *   id : this.id
         * });
         *
         * @see Context#getObjectByPickColor
         */
        createPickId: (object: Object) => Object
        /**
         * Gets the object associated with a pick color.
         *
         * @param {Color} pickColor The pick color.
         * @returns {Object} The object associated with the pick color, or undefined if no object is associated with that color.
         *
         * @example
         * var object = context.getObjectByPickColor(pickColor);
         *
         * @see Context#createPickId
         */
        getObjectByPickColor: (pickColor: Color) => Object

        getViewportQuadVertexArray: () => VertexArray
        createViewportQuadCommand: (
            fragmentShaderSource: string,
            overrides?: {
                renderState?: RenderState
                uniformMap?: {[key: string]: () => (number | boolean | number[] | Cartesian2 | Cartesian3 | Cartesian4 | Color | Matrix2 | Matrix3 | Matrix4 | Texture | CubeMap)}
                owner?: object
                framebuffer?: Framebuffer
                pass?: Pass
            }
        ) => DrawCommand
        readPixels: (readState?: {
            x?: number
            y?: number
            width?: number
            height?: number
            framebuffer?: Framebuffer;
        }) => ArrayBufferView
        endFrame: () => void
        draw: (drawCommand: DrawCommand, passState: PassState, shaderProgram: ShaderProgram, uniformMap: {[key: string]: () => (number | boolean | number[] | Cartesian2 | Cartesian3 | Cartesian4 | Color | Matrix2 | Matrix3 | Matrix4 | Texture | CubeMap)}) => void
        clear: (clearCommand: ClearCommand, passState: PassState) => void
        /**
         * The number of stencil bits per pixel in the default bound framebuffer.  The minimum is eight bits.
         * @memberof Context.prototype
         * @type {Number}
         * @readonly
         * @see {@link https://www.khronos.org/opengles/sdk/docs/man/xhtml/glGet.xml|glGet} with <code>STENCIL_BITS</code>.
         */
        stencilBits: number

        /**
         * <code>true</code> if the WebGL context supports stencil buffers.
         * Stencil buffers are not supported by all systems.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         */
        stencilBuffer: boolean

        /**
         * <code>true</code> if the WebGL context supports antialiasing.  By default
         * antialiasing is requested, but it is not supported by all systems.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         */
        antialias: boolean

        /**
         * <code>true</code> if the OES_standard_derivatives extension is supported.  This
         * extension provides access to <code>dFdx</code>, <code>dFdy</code>, and <code>fwidth</code>
         * functions from GLSL.  A shader using these functions still needs to explicitly enable the
         * extension with <code>#extension GL_OES_standard_derivatives : enable</code>.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link http://www.khronos.org/registry/gles/extensions/OES/OES_standard_derivatives.txt|OES_standard_derivatives}
         */
        standardDerivatives: boolean

        /**
         * <code>true</code> if the EXT_float_blend extension is supported. This
         * extension enables blending with 32-bit float values.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/extensions/EXT_float_blend/}
         */
        floatBlend: boolean

        /**
         * <code>true</code> if the EXT_blend_minmax extension is supported.  This
         * extension extends blending capabilities by adding two new blend equations:
         * the minimum or maximum color components of the source and destination colors.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/extensions/EXT_blend_minmax/}
         */
        blendMinmax: boolean

        /**
         * <code>true</code> if the OES_element_index_uint extension is supported.  This
         * extension allows the use of unsigned int indices, which can improve performance by
         * eliminating batch breaking caused by unsigned short indices.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link http://www.khronos.org/registry/webgl/extensions/OES_element_index_uint/|OES_element_index_uint}
         */
        elementIndexUint: boolean

        /**
         * <code>true</code> if WEBGL_depth_texture is supported.  This extension provides
         * access to depth textures that, for example, can be attached to framebuffers for shadow mapping.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link http://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/|WEBGL_depth_texture}
         */
        depthTexture: boolean

        /**
         * <code>true</code> if OES_texture_float is supported. This extension provides
         * access to floating point textures that, for example, can be attached to framebuffers for high dynamic range.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/extensions/OES_texture_float/}
         */
        floatingPointTexture: boolean

        /**
         * <code>true</code> if OES_texture_half_float is supported. This extension provides
         * access to floating point textures that, for example, can be attached to framebuffers for high dynamic range.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/extensions/OES_texture_float/}
         */
        halfFloatingPointTexture: boolean

        /**
         * <code>true</code> if OES_texture_float_linear is supported. This extension provides
         * access to linear sampling methods for minification and magnification filters of floating-point textures.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/extensions/OES_texture_float_linear/}
         */
        textureFloatLinear: boolean

        /**
         * <code>true</code> if OES_texture_half_float_linear is supported. This extension provides
         * access to linear sampling methods for minification and magnification filters of half floating-point textures.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/extensions/OES_texture_half_float_linear/}
         */
        textureHalfFloatLinear: boolean
        /**
         * <code>true</code> if EXT_texture_filter_anisotropic is supported. This extension provides
         * access to anisotropic filtering for textured surfaces at an oblique angle from the viewer.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/extensions/EXT_texture_filter_anisotropic/}
         */
        textureFilterAnisotropic: boolean

        /**
         * <code>true</code> if WEBGL_texture_compression_s3tc is supported.  This extension provides
         * access to DXT compressed textures.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/}
         */
        s3tc: boolean

        /**
         * <code>true</code> if WEBGL_texture_compression_pvrtc is supported.  This extension provides
         * access to PVR compressed textures.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_pvrtc/}
         */
        pvrtc: boolean

        /**
         * <code>true</code> if WEBGL_texture_compression_etc1 is supported.  This extension provides
         * access to ETC1 compressed textures.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_etc1/}
         */
        etc1: boolean

        /**
         * <code>true</code> if the OES_vertex_array_object extension is supported.  This
         * extension can improve performance by reducing the overhead of switching vertex arrays.
         * When enabled, this extension is automatically used by {@link VertexArray}.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link http://www.khronos.org/registry/webgl/extensions/OES_vertex_array_object/|OES_vertex_array_object}
         */
        vertexArrayObject: boolean

        /**
         * <code>true</code> if the EXT_frag_depth extension is supported.  This
         * extension provides access to the <code>gl_FragDepthEXT</code> built-in output variable
         * from GLSL fragment shaders.  A shader using these functions still needs to explicitly enable the
         * extension with <code>#extension GL_EXT_frag_depth : enable</code>.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link http://www.khronos.org/registry/webgl/extensions/EXT_frag_depth/|EXT_frag_depth}
         */
        fragmentDepth: boolean

        /**
         * <code>true</code> if the ANGLE_instanced_arrays extension is supported.  This
         * extension provides access to instanced rendering.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/extensions/ANGLE_instanced_arrays}
         */
        instancedArrays: boolean

        /**
         * <code>true</code> if the EXT_color_buffer_float extension is supported.  This
         * extension makes the gl.RGBA32F format color renderable.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/extensions/WEBGL_color_buffer_float/}
         * @see {@link https://www.khronos.org/registry/webgl/extensions/EXT_color_buffer_float/}
         */
        colorBufferFloat: boolean

        /**
         * <code>true</code> if the EXT_color_buffer_half_float extension is supported.  This
         * extension makes the format gl.RGBA16F format color renderable.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/extensions/EXT_color_buffer_half_float/}
         * @see {@link https://www.khronos.org/registry/webgl/extensions/EXT_color_buffer_float/}
         */
        colorBufferHalfFloat: boolean

        /**
         * <code>true</code> if the WEBGL_draw_buffers extension is supported. This
         * extensions provides support for multiple render targets. The framebuffer object can have mutiple
         * color attachments and the GLSL fragment shader can write to the built-in output array <code>gl_FragData</code>.
         * A shader using this feature needs to explicitly enable the extension with
         * <code>#extension GL_EXT_draw_buffers : enable</code>.
         * @memberof Context.prototype
         * @type {Boolean}
         * @readonly
         * @see {@link http://www.khronos.org/registry/webgl/extensions/WEBGL_draw_buffers/|WEBGL_draw_buffers}
         */
        drawBuffers: boolean


        /**
         * A 1x1 RGBA texture initialized to [255, 255, 255, 255].  This can
         * be used as a placeholder texture while other textures are downloaded.
         * @memberof Context.prototype
         * @type {Texture}
         * @readonly
         */
        defaultTexture: Texture

        /**
         * A cube map, where each face is a 1x1 RGBA texture initialized to
         * [255, 255, 255, 255].  This can be used as a placeholder cube map while
         * other cube maps are downloaded.
         * @memberof Context.prototype
         * @type {CubeMap}
         * @readonly
         */
        defaultCubeMap: CubeMap

        /**
         * The drawingBufferHeight of the underlying GL context.
         * @memberof Context.prototype
         * @type {Number}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/specs/1.0/#DOM-WebGLRenderingContext-drawingBufferHeight|drawingBufferHeight}
         */
        drawingBufferHeight: number

        /**
         * The drawingBufferWidth of the underlying GL context.
         * @memberof Context.prototype
         * @type {Number}
         * @readonly
         * @see {@link https://www.khronos.org/registry/webgl/specs/1.0/#DOM-WebGLRenderingContext-drawingBufferWidth|drawingBufferWidth}
         */
        drawingBufferWidth: number

        /**
         * Gets an object representing the currently bound framebuffer.  While this instance is not an actual
         * {@link Framebuffer}, it is used to represent the default framebuffer in calls to
         * {@link Texture.fromFramebuffer}.
         * @memberof Context.prototype
         * @type {Object}
         * @readonly
         */
        defaultFramebuffer: Framebuffer
    }

    /**
     * @private
     */
    interface VertexArrayAttribute {
        index: number
        vertexBuffer: Buffer
        componentsPerAttribute: number
        componentDatatype: ComponentDatatype
        /**
         * @default false
         */
        normalize?: boolean
        /**
         * @default 0
         */
        offsetInBytes?: number
        /**
         * @default 0
         */
        strideInBytes?: number
        /**
        * @default 0
        */
        instanceDivisor?: number
    }

    /**
     * Creates a vertex array, which defines the attributes making up a vertex, and contains an optional index buffer
     * to select vertices for rendering.  Attributes are defined using object literals as shown in Example 1 below.
     *
     * @param {Object} options Object with the following properties:
     * @param {Context} options.context The context in which the VertexArray gets created.
     * @param {Object[]} options.attributes An array of attributes.
     * @param {IndexBuffer} [options.indexBuffer] An optional index buffer.
     *
     * @returns {VertexArray} The vertex array, ready for use with drawing.
     *
     * @exception {DeveloperError} Attribute must have a <code>vertexBuffer</code>.
     * @exception {DeveloperError} Attribute must have a <code>componentsPerAttribute</code>.
     * @exception {DeveloperError} Attribute must have a valid <code>componentDatatype</code> or not specify it.
     * @exception {DeveloperError} Attribute must have a <code>strideInBytes</code> less than or equal to 255 or not specify it.
     * @exception {DeveloperError} Index n is used by more than one attribute.
     *
     *
     * @example
     * // Example 1. Create a vertex array with vertices made up of three floating point
     * // values, e.g., a position, from a single vertex buffer.  No index buffer is used.
     * var positionBuffer = Buffer.createVertexBuffer({
     *     context : context,
     *     sizeInBytes : 12,
     *     usage : BufferUsage.STATIC_DRAW
     * });
     * var attributes = [
     *     {
     *         index                  : 0,
     *         enabled                : true,
     *         vertexBuffer           : positionBuffer,
     *         componentsPerAttribute : 3,
     *         componentDatatype      : ComponentDatatype.FLOAT,
     *         normalize              : false,
     *         offsetInBytes          : 0,
     *         strideInBytes          : 0 // tightly packed
     *         instanceDivisor        : 0 // not instanced
     *     }
     * ];
     * var va = new VertexArray({
     *     context : context,
     *     attributes : attributes
     * });
     *
     * @example
     * // Example 2. Create a vertex array with vertices from two different vertex buffers.
     * // Each vertex has a three-component position and three-component normal.
     * var positionBuffer = Buffer.createVertexBuffer({
     *     context : context,
     *     sizeInBytes : 12,
     *     usage : BufferUsage.STATIC_DRAW
     * });
     * var normalBuffer = Buffer.createVertexBuffer({
     *     context : context,
     *     sizeInBytes : 12,
     *     usage : BufferUsage.STATIC_DRAW
     * });
     * var attributes = [
     *     {
     *         index                  : 0,
     *         vertexBuffer           : positionBuffer,
     *         componentsPerAttribute : 3,
     *         componentDatatype      : ComponentDatatype.FLOAT
     *     },
     *     {
     *         index                  : 1,
     *         vertexBuffer           : normalBuffer,
     *         componentsPerAttribute : 3,
     *         componentDatatype      : ComponentDatatype.FLOAT
     *     }
     * ];
     * var va = new VertexArray({
     *     context : context,
     *     attributes : attributes
     * });
     *
     * @example
     * // Example 3. Creates the same vertex layout as Example 2 using a single
     * // vertex buffer, instead of two.
     * var buffer = Buffer.createVertexBuffer({
     *     context : context,
     *     sizeInBytes : 24,
     *     usage : BufferUsage.STATIC_DRAW
     * });
     * var attributes = [
     *     {
     *         vertexBuffer           : buffer,
     *         componentsPerAttribute : 3,
     *         componentDatatype      : ComponentDatatype.FLOAT,
     *         offsetInBytes          : 0,
     *         strideInBytes          : 24
     *     },
     *     {
     *         vertexBuffer           : buffer,
     *         componentsPerAttribute : 3,
     *         componentDatatype      : ComponentDatatype.FLOAT,
     *         normalize              : true,
     *         offsetInBytes          : 12,
     *         strideInBytes          : 24
     *     }
     * ];
     * var va = new VertexArray({
     *     context : context,
     *     attributes : attributes
     * });
     *
     * @see Buffer#createVertexBuffer
     * @see Buffer#createIndexBuffer
     * @see Context#draw
     *
     * @private
     */
    export class VertexArray {
        constructor(options: {
            /**
             * The context in which the VertexArray gets created.
             */
            context: Context
            /**
             * An array of attributes.
             */
            attributes: VertexArrayAttribute[]
            /**
             * An optional index buffer.
             */
            indexBuffer: IndexBuffer
        })

        /**
         * @readonly
         */
        numberOfAttributes: number
        /**
         * @readonly
         */
        numberOfVertices: number
        /**
         * @readonly
         */
        indexBuffer: Buffer

        _bind: () => void
        _unBind: () => void
        isDestroyed: () => boolean
        destroy: () => void
        /**
         * Creates a vertex array from a geometry.  A geometry contains vertex attributes and optional index data
         * in system memory, whereas a vertex array contains vertex buffers and an optional index buffer in WebGL
         * memory for use with rendering.
         * <br /><br />
         * The <code>geometry</code> argument should use the standard layout like the geometry returned by {@link BoxGeometry}.
         * <br /><br />
         * <code>options</code> can have four properties:
         * <ul>
         *   <li><code>geometry</code>:  The source geometry containing data used to create the vertex array.</li>
         *   <li><code>attributeLocations</code>:  An object that maps geometry attribute names to vertex shader attribute locations.</li>
         *   <li><code>bufferUsage</code>:  The expected usage pattern of the vertex array's buffers.  On some WebGL implementations, this can significantly affect performance.  See {@link BufferUsage}.  Default: <code>BufferUsage.DYNAMIC_DRAW</code>.</li>
         *   <li><code>interleave</code>:  Determines if all attributes are interleaved in a single vertex buffer or if each attribute is stored in a separate vertex buffer.  Default: <code>false</code>.</li>
         * </ul>
         * <br />
         * If <code>options</code> is not specified or the <code>geometry</code> contains no data, the returned vertex array is empty.
         *
         * @param {Object} options An object defining the geometry, attribute indices, buffer usage, and vertex layout used to create the vertex array.
         *
         * @exception {RuntimeError} Each attribute list must have the same number of vertices.
         * @exception {DeveloperError} The geometry must have zero or one index lists.
         * @exception {DeveloperError} Index n is used by more than one attribute.
         *
         *
         * @example
         * // Example 1. Creates a vertex array for rendering a box.  The default dynamic draw
         * // usage is used for the created vertex and index buffer.  The attributes are not
         * // interleaved by default.
         * var geometry = new BoxGeometry();
         * var va = VertexArray.fromGeometry({
         *     context            : context,
         *     geometry           : geometry,
         *     attributeLocations : GeometryPipeline.createAttributeLocations(geometry),
         * });
         *
         * @example
         * // Example 2. Creates a vertex array with interleaved attributes in a
         * // single vertex buffer.  The vertex and index buffer have static draw usage.
         * var va = VertexArray.fromGeometry({
         *     context            : context,
         *     geometry           : geometry,
         *     attributeLocations : GeometryPipeline.createAttributeLocations(geometry),
         *     bufferUsage        : BufferUsage.STATIC_DRAW,
         *     interleave         : true
         * });
         *
         * @example
         * // Example 3.  When the caller destroys the vertex array, it also destroys the
         * // attached vertex buffer(s) and index buffer.
         * va = va.destroy();
         *
         * @see Buffer#createVertexBuffer
         * @see Buffer#createIndexBuffer
         * @see GeometryPipeline.createAttributeLocations
         * @see ShaderProgram
         */
        static fromGeometry: (options: {
            context: Context
            geometry: Geometry
            attributeLocations: { [key: string]: number }
            bufferUsage?: BufferUsage
            interleave?: boolean
            vertexArrayAttributes?: VertexArrayAttribute[]
        }) => VertexArray
    }

    /**
     * An object containing various inputs that will be combined to form a final GLSL shader string.
     *
     * @param {Object} [options] Object with the following properties:
     * @param {String[]} [options.sources] An array of strings to combine containing GLSL code for the shader.
     * @param {String[]} [options.defines] An array of strings containing GLSL identifiers to <code>#define</code>.
     * @param {String} [options.pickColorQualifier] The GLSL qualifier, <code>uniform</code> or <code>varying</code>, for the input <code>czm_pickColor</code>.  When defined, a pick fragment shader is generated.
     * @param {Boolean} [options.includeBuiltIns=true] If true, referenced built-in functions will be included with the combined shader.  Set to false if this shader will become a source in another shader, to avoid duplicating functions.
     *
     * @exception {DeveloperError} options.pickColorQualifier must be 'uniform' or 'varying'.
     *
     * @example
     * // 1. Prepend #defines to a shader
     * var source = new Cesium.ShaderSource({
     *   defines : ['WHITE'],
     *   sources : ['void main() { \n#ifdef WHITE\n gl_FragColor = vec4(1.0); \n#else\n gl_FragColor = vec4(0.0); \n#endif\n }']
     * });
     *
     * // 2. Modify a fragment shader for picking
     * var source = new Cesium.ShaderSource({
     *   sources : ['void main() { gl_FragColor = vec4(1.0); }'],
     *   pickColorQualifier : 'uniform'
     * });
     *
     * @private
     */
    export class ShaderSource {

        constructor(options?: {
            defines?: string[]
            sources?: string[]
            pickColorQualifier?: string
            includeBuiltIns?: boolean
        })

        clone(): ShaderSource

        /**
         * Create a single string containing the full, combined vertex shader with all dependencies and defines.
         *
         * @param {Context} context The current rendering context
         *
         * @returns {String} The combined shader string.
         */
        createCombinedVertexShader(context: Context): String

        /**
         * Create a single string containing the full, combined fragment shader with all dependencies and defines.
         *
         * @param {Context} context The current rendering context
         *
         * @returns {String} The combined shader string.
         */
        createCombinedFragmentShader(context: Context): string

        static replaceMain(source, renamedMain): string
        /**
         * For ShaderProgram testing
         * @private
         */
        static _czmBuiltinsAndUniforms = {};

        static createPickVertexShaderSource(vertexShaderSource: string): string

        static createPickFragmentShaderSource(
            fragmentShaderSource: string,
            pickColorQualifier: string
        ): string

        static findVarying: (shaderSource: ShaderSource, names: string[]) => string

        static findNormalVarying: (shaderSource: ShaderSource) => string

        static findPositionVarying: (shaderSource: ShaderSource) => string
    }

    /**
     * @private
     */
    export class ShaderProgram {
        constructor(options: {
            vertexShaderText: string
            fragmentShaderText: string
            attributeLocations: { [key: string]: number }
            logShaderCompilation?: boolean
            debugShaders?: boolean
            vertexShaderSource?: ShaderSource
            duplicateUniformNames?: { [key: string]: string }
            fragmentShaderSource?: ShaderSource
        })
        /**
         * 
         */
        static fromCache: (options: {
            /**
              *  The GLSL source for the vertex shader.
              */
            vertexShaderSource: String | ShaderSource
            /**
             *  The GLSL source for the fragment shader.
             */
            fragmentShaderSource: String | ShaderSource
            /**
             * Indices for the attribute inputs to the vertex shader.
             */
            attributeLocations: { [key: string]: number }
        }) => ShaderProgram


        static replaceCache: (options: {
            /**
             *  The shader program that is being reassigned.
             */
            shaderProgram: ShaderProgram;
            /**
             *  The GLSL source for the vertex shader.
             */
            vertexShaderSource: String | ShaderSource
            /**
             *  The GLSL source for the fragment shader.
             */
            fragmentShaderSource: String | ShaderSource
            /**
             * Indices for the attribute inputs to the vertex shader.
             */
            attributeLocations: { [key: string]: number }

        }) => ShaderProgram

        /**
         * GLSL source for the shader program's vertex shader.
         * @memberof ShaderProgram.prototype
         *
         * @type {ShaderSource}
         * @readonly
         */
        vertexShaderSource: ShaderSource
        /**
         * GLSL source for the shader program's fragment shader.
         * @memberof ShaderProgram.prototype
         *
         * @type {ShaderSource}
         * @readonly
         */
        fragmentShaderSource: ShaderSource
        /**
         * @readonly
         */
        vertexAttributes: {
            [key: string]: {
                name: string
                type: number
                index: number
            }
        }
        /**
         * @readonly
         */
        numberOfVertexAttributes: number
        /**
         * @readonly
         */
        allUniforms: string[]
    }

    /**
     * @private
     */
    export enum TextureWrap {
        CLAMP_TO_EDGE = WebGLConstants.CLAMP_TO_EDGE,
        REPEAT = WebGLConstants.REPEAT,
        MIRRORED_REPEAT = WebGLConstants.MIRRORED_REPEAT
    }

    /**
     * @private
     */
    export class Sampler {
        constructor(options: {
            wrapS: TextureWrap
            wrapT: TextureWrap
            minificationFilter: TextureMinificationFilter
            magnificationFilter: TextureMagnificationFilter
            maximumAnisotropy?: number
        })
        /**
         * @readonly
         */
        wrapS: TextureWrap
        /**
         * @readonly
         */
        wrapT: TextureWrap
        /**
         * @readonly
         */
        minificationFilter: TextureMinificationFilter

        /**
         * @readonly
         */
        magnificationFilter: TextureMagnificationFilter
        /**
         * @readonly
         */
        maximumAnisotropy: number

        static equals(left: Sampler, right: Sampler): boolean

        static NEAREST: Sampler
    }

    /**
     * @private
     */
    export class Texture {
        constructor(options: {
            context: Context
            width: number
            height: number
            source?: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
            pixelFormat?: PixelFormat
            pixelDatatype?: PixelDatatype
            preMultiplyAlpha?: boolean
            sampler?: Sampler
        })


        /**
         * This function is identical to using the Texture constructor except that it can be
         * replaced with a mock/spy in tests.
         * @private
         */
        static create(options: {
            context: Context
            width: number
            height: number
            source?: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
            pixelFormat?: PixelFormat
            pixelDatatype?: PixelDatatype
            preMultiplyAlpha?: boolean
            sampler?: Sampler
        }): Texture

        /**
         * Creates a texture, and copies a subimage of the framebuffer to it.  When called without arguments,
         * the texture is the same width and height as the framebuffer and contains its contents.
         *
         * @param {Object} options Object with the following properties:
         * @param {Context} options.context The context in which the Texture gets created.
         * @param {PixelFormat} [options.pixelFormat=PixelFormat.RGB] The texture's internal pixel format.
         * @param {Number} [options.framebufferXOffset=0] An offset in the x direction in the framebuffer where copying begins from.
         * @param {Number} [options.framebufferYOffset=0] An offset in the y direction in the framebuffer where copying begins from.
         * @param {Number} [options.width=canvas.clientWidth] The width of the texture in texels.
         * @param {Number} [options.height=canvas.clientHeight] The height of the texture in texels.
         * @param {Framebuffer} [options.framebuffer=defaultFramebuffer] The framebuffer from which to create the texture.  If this
         *        parameter is not specified, the default framebuffer is used.
         * @returns {Texture} A texture with contents from the framebuffer.
         *
         * @exception {DeveloperError} Invalid pixelFormat.
         * @exception {DeveloperError} pixelFormat cannot be DEPTH_COMPONENT, DEPTH_STENCIL or a compressed format.
         * @exception {DeveloperError} framebufferXOffset must be greater than or equal to zero.
         * @exception {DeveloperError} framebufferYOffset must be greater than or equal to zero.
         * @exception {DeveloperError} framebufferXOffset + width must be less than or equal to canvas.clientWidth.
         * @exception {DeveloperError} framebufferYOffset + height must be less than or equal to canvas.clientHeight.
         *
         *
         * @example
         * // Create a texture with the contents of the framebuffer.
         * var t = Texture.fromFramebuffer({
         *     context : context
         * });
         *
         * @see Sampler
         *
         * @private
         */
        fromFramebuffer(options: {
            context: Context
            pixelFormat?: PixelFormat.RGB
            framebufferXOffset?: number
            framebufferYOffset?: number
            width?: number
            height?: number
            framebuffer?: Framebuffer
        }): Texture

        /**
         * A unique id for the texture
         * @memberof Texture.prototype
         * @type {String}
         * @readonly
         * @private
         */
        id: string
        /**
         * The sampler to use when sampling this texture.
         * Create a sampler by calling {@link Sampler}.  If this
         * parameter is not specified, a default sampler is used.  The default sampler clamps texture
         * coordinates in both directions, uses linear filtering for both magnification and minification,
         * and uses a maximum anisotropy of 1.0.
         * @memberof Texture.prototype
         * @type {Object}
         */
        sampler: Object | Sampler
        /**
         * @readonly
         */
        pixelFormat: PixelFormat
        /**
         * @readonly
         */
        pixelDatatype: PixelDatatype
        /**
         * @readonly
         */
        dimensions: Cartesian2
        /**
         * @readonly
         */
        preMultiplyAlpha: boolean

        /**
         * @readonly
         */
        flipY: boolean
        /**
         * @readonly
         */
        width: number
        /**
         * @readonly
         */
        height: number
        /**
         * @readonly
         */
        sizeInBytes: number
        /**
         * @readonly
         */
        _target: number

        /**
         * Copy new image data into this texture, from a source {@link ImageData}, {@link HTMLImageElement}, {@link HTMLCanvasElement}, or {@link HTMLVideoElement}.
         * or an object with width, height, and arrayBufferView properties.
         *
         * @param {Object} source The source {@link ImageData}, {@link HTMLImageElement}, {@link HTMLCanvasElement}, or {@link HTMLVideoElement},
         *                        or an object with width, height, and arrayBufferView properties.
         * @param {Number} [xOffset=0] The offset in the x direction within the texture to copy into.
         * @param {Number} [yOffset=0] The offset in the y direction within the texture to copy into.
         *
         * @exception {DeveloperError} Cannot call copyFrom when the texture pixel format is DEPTH_COMPONENT or DEPTH_STENCIL.
         * @exception {DeveloperError} Cannot call copyFrom with a compressed texture pixel format.
         * @exception {DeveloperError} xOffset must be greater than or equal to zero.
         * @exception {DeveloperError} yOffset must be greater than or equal to zero.
         * @exception {DeveloperError} xOffset + source.width must be less than or equal to width.
         * @exception {DeveloperError} yOffset + source.height must be less than or equal to height.
         * @exception {DeveloperError} This texture was destroyed, i.e., destroy() was called.
         *
         * @example
         * texture.copyFrom({
         *   width : 1,
         *   height : 1,
         *   arrayBufferView : new Uint8Array([255, 0, 0, 255])
         * });
         */
        copyFrom(source: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, xOffset?: number, yOffset?: number): void

        /**
         * @param {Number} [xOffset=0] The offset in the x direction within the texture to copy into.
         * @param {Number} [yOffset=0] The offset in the y direction within the texture to copy into.
         * @param {Number} [framebufferXOffset=0] optional
         * @param {Number} [framebufferYOffset=0] optional
         * @param {Number} [width=width] optional
         * @param {Number} [height=height] optional
         *
         * @exception {DeveloperError} Cannot call copyFromFramebuffer when the texture pixel format is DEPTH_COMPONENT or DEPTH_STENCIL.
         * @exception {DeveloperError} Cannot call copyFromFramebuffer when the texture pixel data type is FLOAT.
         * @exception {DeveloperError} Cannot call copyFromFramebuffer when the texture pixel data type is HALF_FLOAT.
         * @exception {DeveloperError} Cannot call copyFrom with a compressed texture pixel format.
         * @exception {DeveloperError} This texture was destroyed, i.e., destroy() was called.
         * @exception {DeveloperError} xOffset must be greater than or equal to zero.
         * @exception {DeveloperError} yOffset must be greater than or equal to zero.
         * @exception {DeveloperError} framebufferXOffset must be greater than or equal to zero.
         * @exception {DeveloperError} framebufferYOffset must be greater than or equal to zero.
         * @exception {DeveloperError} xOffset + width must be less than or equal to width.
         * @exception {DeveloperError} yOffset + height must be less than or equal to height.
         */
        copyFromFramebuffer(
            xOffset: number,
            yOffset: number,
            framebufferXOffset: number,
            framebufferYOffset: number,
            width: number,
            height: number
        ): void

        /**
         * @param {MipmapHint} [hint=MipmapHint.DONT_CARE] optional.
         *
         * @exception {DeveloperError} Cannot call generateMipmap when the texture pixel format is DEPTH_COMPONENT or DEPTH_STENCIL.
         * @exception {DeveloperError} Cannot call generateMipmap when the texture pixel format is a compressed format.
         * @exception {DeveloperError} hint is invalid.
         * @exception {DeveloperError} This texture's width must be a power of two to call generateMipmap().
         * @exception {DeveloperError} This texture's height must be a power of two to call generateMipmap().
         * @exception {DeveloperError} This texture was destroyed, i.e., destroy() was called.
         */
        generateMipmap(hint: MipmapHint): void

        isDestroyed(): boolean

        destroy(): any
    }

    /**
     * @private
     */
    export enum RenderbufferFormat {
        RGBA4 = WebGLConstants.RGBA4,
        RGB5_A1 = WebGLConstants.RGB5_A1,
        RGB565 = WebGLConstants.RGB565,
        DEPTH_COMPONENT16 = WebGLConstants.DEPTH_COMPONENT16,
        STENCIL_INDEX8 = WebGLConstants.STENCIL_INDEX8,
        DEPTH_STENCIL = WebGLConstants.DEPTH_STENCIL,

    }

    /**
     * @private
     */
    export class Renderbuffer {
        constructor(options: {
            context: Context
            format: RenderbufferFormat
            width: number
            height: number
        })
        _gl: WebGL2RenderingContext | WebGLRenderingContext
        _format: RenderbufferFormat
        _width: number
        _height: number
        _renderbuffer: WebGLRenderbuffer
        /**
         * @readonly
         */
        format: RenderbufferFormat
        /**
         * @readonly
         */
        width: number
        /**
         * @readonly
         */
        height: number

        _getRenderbuffer(): WebGLRenderbuffer

        isDestroyed(): boolean

        destroy(): void
    }

    /**
     * Creates a framebuffer with optional initial color, depth, and stencil attachments.
     * Framebuffers are used for render-to-texture effects; they allow us to render to
     * textures in one pass, and read from it in a later pass.
     *
     * @param {Object} options The initial framebuffer attachments as shown in the example below. <code>context</code> is required. The possible properties are <code>colorTextures</code>, <code>colorRenderbuffers</code>, <code>depthTexture</code>, <code>depthRenderbuffer</code>, <code>stencilRenderbuffer</code>, <code>depthStencilTexture</code>, and <code>depthStencilRenderbuffer</code>.
     *
     * @exception {DeveloperError} Cannot have both color texture and color renderbuffer attachments.
     * @exception {DeveloperError} Cannot have both a depth texture and depth renderbuffer attachment.
     * @exception {DeveloperError} Cannot have both a depth-stencil texture and depth-stencil renderbuffer attachment.
     * @exception {DeveloperError} Cannot have both a depth and depth-stencil renderbuffer.
     * @exception {DeveloperError} Cannot have both a stencil and depth-stencil renderbuffer.
     * @exception {DeveloperError} Cannot have both a depth and stencil renderbuffer.
     * @exception {DeveloperError} The color-texture pixel-format must be a color format.
     * @exception {DeveloperError} The depth-texture pixel-format must be DEPTH_COMPONENT.
     * @exception {DeveloperError} The depth-stencil-texture pixel-format must be DEPTH_STENCIL.
     * @exception {DeveloperError} The number of color attachments exceeds the number supported.
     * @exception {DeveloperError} The color-texture pixel datatype is HALF_FLOAT and the WebGL implementation does not support the EXT_color_buffer_half_float extension.
     * @exception {DeveloperError} The color-texture pixel datatype is FLOAT and the WebGL implementation does not support the EXT_color_buffer_float or WEBGL_color_buffer_float extensions.
     *
     * @example
     * // Create a framebuffer with color and depth texture attachments.
     * var width = context.canvas.clientWidth;
     * var height = context.canvas.clientHeight;
     * var framebuffer = new Framebuffer({
     *   context : context,
     *   colorTextures : [new Texture({
     *     context : context,
     *     width : width,
     *     height : height,
     *     pixelFormat : PixelFormat.RGBA
     *   })],
     *   depthTexture : new Texture({
     *     context : context,
     *     width : width,
     *     height : height,
     *     pixelFormat : PixelFormat.DEPTH_COMPONENT,
     *     pixelDatatype : PixelDatatype.UNSIGNED_SHORT
     *   })
     * });
     *
     * @private
     * @constructor
     */
    export  class Framebuffer {
        constructor(options: {
            context: Context
            colorTextures: Texture[]
            colorRenderbuffers?: Renderbuffer[]
            depthTexture: Texture
            depthRenderbuffer: Renderbuffer
            /**
             * @default true
             */
            destroyAttachments?: boolean

            depthStencilTexture?: Texture
            depthStencilRenderbuffer?: Renderbuffer
        })

        /**
         * The status of the framebuffer. If the status is not WebGLConstants.FRAMEBUFFER_COMPLETE,
         * a {@link DeveloperError} will be thrown when attempting to render to the framebuffer.
         * @memberof Framebuffer.prototype
         * @type {Number}
         * @readonly
         */
        status: number
        /**
         * @readonly
         */
        numberOfColorAttachments: number
        /**
         * @readonly
         */
        depthTexture: Texture
        /**
         * @readonly
         */
        depthRenderbuffer: Renderbuffer
        /**
         * @readonly
         */
        stencilRenderbuffer: Renderbuffer
        /**
         * @readonly
         */
        depthStencilTexture: Texture
        /**
         * @readonly
         */
        depthStencilRenderbuffer: Renderbuffer

        /**
         * True if the framebuffer has a depth attachment.  Depth attachments include
         * depth and depth-stencil textures, and depth and depth-stencil renderbuffers.  When
         * rendering to a framebuffer, a depth attachment is required for the depth test to have effect.
         * @memberof Framebuffer.prototype
         * @type {Boolean}
         * @readonly
         */
        hasDepthAttachment: boolean

        _bind(): void

        _unBind(): void

        _getActiveColorAttachments(): void

        getColorTexture(index): Texture
        getColorRenderbuffer(index): Renderbuffer
        isDestroyed(): boolean
        destroy(): any
    }

    /**
     * Represents a command to the renderer for drawing.
     *
     * @private
     */
    export class DrawCommand {
        constructor(options: {
            modelMatrix: Matrix4
            vertexArray: VertexArray
            shaderProgram: ShaderProgram
            uniformMap: {[key: string]: () => (number | boolean | number[] | Cartesian2 | Cartesian3 | Cartesian4 | Color | Matrix2 | Matrix3 | Matrix4 | Texture | CubeMap)}
            renderState: RenderState

            /** 
             * @default PrimitiveType.TRIANGLES
             */
            primitiveType?: PrimitiveType
            owner?: object
            instanceCount?: number
            framebuffer?: Framebuffer
            /** 
             * @default false
             */
            castShadows?: boolean
            /** 
             * @default false
             */
            receiveShadows?: boolean
            pickId: Object
            /** 
             * @default false
             */
            pickOnly?: boolean

            boundingVolume?: BoundingSphere | AxisAlignedBoundingBox
            orientedBoundingBox?: OrientedBoundingBox
            /**
             * @default true
             */
            cull?: boolean
            /**
             * @default true
             */
            occlude?: boolean

            executeInClosestFrustum?: boolean
            pass?: Pass
            count?: number
            debugShowBoundingVolume?: boolean
        })

        /**
         * Executes the draw command.
         *
         * @param {Context} context The renderer context in which to draw.
         * @param {PassState} [passState] The state for the current render pass.
         */
        execute: (context: Context, passState: PassState) => void
        /**
         * @private
         */
        static shallowClone: (command: DrawCommand, result?: DrawCommand) => DrawCommand
        /**
       * The bounding volume of the geometry in world space.  This is used for culling and frustum selection.
       * <p>
       * For best rendering performance, use the tightest possible bounding volume.  Although
       * <code>undefined</code> is allowed, always try to provide a bounding volume to
       * allow the tightest possible near and far planes to be computed for the scene, and
       * minimize the number of frustums needed.
       * </p>
       *
       * @memberof DrawCommand.prototype
       * @type {Object}
       * @default undefined
       *
       * @see DrawCommand#debugShowBoundingVolume
       */
        boundingVolume: Object

        /**
         * The oriented bounding box of the geometry in world space. If this is defined, it is used instead of
         * {@link DrawCommand#boundingVolume} for plane intersection testing.
         *
         * @memberof DrawCommand.prototype
         * @type {OrientedBoundingBox}
         * @default undefined
         *
         * @see DrawCommand#debugShowBoundingVolume
         */
        orientedBoundingBox: OrientedBoundingBox

        /**
         * When <code>true</code>, the renderer frustum and horizon culls the command based on its {@link DrawCommand#boundingVolume}.
         * If the command was already culled, set this to <code>false</code> for a performance improvement.
         *
         * @memberof DrawCommand.prototype
         * @type {Boolean}
         * @default true
         */
        cull: boolean

        /**
         * When <code>true</code>, the horizon culls the command based on its {@link DrawCommand#boundingVolume}.
         * {@link DrawCommand#cull} must also be <code>true</code> in order for the command to be culled.
         *
         * @memberof DrawCommand.prototype
         * @type {Boolean}
         * @default true
         */
        occlude: boolean

        /**
         * The transformation from the geometry in model space to world space.
         * <p>
         * When <code>undefined</code>, the geometry is assumed to be defined in world space.
         * </p>
         *
         * @memberof DrawCommand.prototype
         * @type {Matrix4}
         * @default undefined
         */
        modelMatrix: Matrix4

        /**
         * The type of geometry in the vertex array.
         *
         * @memberof DrawCommand.prototype
         * @type {PrimitiveType}
         * @default PrimitiveType.TRIANGLES
         */
        primitiveType: PrimitiveType

        /**
         * The vertex array.
         *
         * @memberof DrawCommand.prototype
         * @type {VertexArray}
         * @default undefined
         */
        vertexArray: VertexArray

        /**
         * The number of vertices to draw in the vertex array.
         *
         * @memberof DrawCommand.prototype
         * @type {Number}
         * @default undefined
         */
        count: number

        /**
         * The offset to start drawing in the vertex array.
         *
         * @memberof DrawCommand.prototype
         * @type {Number}
         * @default 0
         */
        offset: number

        /**
         * The number of instances to draw.
         *
         * @memberof DrawCommand.prototype
         * @type {Number}
         * @default 0
         */
        instanceCount: number

        /**
         * The shader program to apply.
         *
         * @memberof DrawCommand.prototype
         * @type {ShaderProgram}
         * @default undefined
         */
        shaderProgram: ShaderProgram

        /**
         * Whether this command should cast shadows when shadowing is enabled.
         *
         * @memberof DrawCommand.prototype
         * @type {Boolean}
         * @default false
         */
        castShadows: boolean

        /**
         * Whether this command should receive shadows when shadowing is enabled.
         *
         * @memberof DrawCommand.prototype
         * @type {Boolean}
         * @default false
         */
        receiveShadows: boolean

        /**
         * An object with functions whose names match the uniforms in the shader program
         * and return values to set those uniforms.
         *
         * @memberof DrawCommand.prototype
         * @type {Object}
         * @default undefined
         */
        uniformMap: {[key: string]: () => (number | boolean | number[] | Cartesian2 | Cartesian3 | Cartesian4 | Color | Matrix2 | Matrix3 | Matrix4 | Texture | CubeMap)}

        /**
         * The render state.
         *
         * @memberof DrawCommand.prototype
         * @type {RenderState}
         * @default undefined
         */
        renderState: RenderState

        /**
         * The framebuffer to draw to.
         *
         * @memberof DrawCommand.prototype
         * @type {Framebuffer}
         * @default undefined
         */
        framebuffer: Framebuffer

        /**
         * The pass when to render.
         *
         * @memberof DrawCommand.prototype
         * @type {Pass}
         * @default undefined
         */
        pass: Pass

        /**
         * Specifies if this command is only to be executed in the frustum closest
         * to the eye containing the bounding volume. Defaults to <code>false</code>.
         *
         * @memberof DrawCommand.prototype
         * @type {Boolean}
         * @default false
         */
        executeInClosestFrustum: boolean

        /**
         * The object who created this command.  This is useful for debugging command
         * execution; it allows us to see who created a command when we only have a
         * reference to the command, and can be used to selectively execute commands
         * with {@link Scene#debugCommandFilter}.
         *
         * @memberof DrawCommand.prototype
         * @type {Object}
         * @default undefined
         *
         * @see Scene#debugCommandFilter
         */
        owner: Object

        /**
         * This property is for debugging only; it is not for production use nor is it optimized.
         * <p>
         * Draws the {@link DrawCommand#boundingVolume} for this command, assuming it is a sphere, when the command executes.
         * </p>
         *
         * @memberof DrawCommand.prototype
         * @type {Boolean}
         * @default false
         *
         * @see DrawCommand#boundingVolume
         */
        debugShowBoundingVolume: boolean

        /**
         * Used to implement Scene.debugShowFrustums.
         * @private
         */
        debugOverlappingFrustums: boolean
        /**
         * A GLSL string that will evaluate to a pick id. When <code>undefined</code>, the command will only draw depth
         * during the pick pass.
         *
         * @memberof DrawCommand.prototype
         * @type {String}
         * @default undefined
         */
        pickId: string
        /**
         * Whether this command should be executed in the pick pass only.
         *
         * @memberof DrawCommand.prototype
         * @type {Boolean}
         * @default false
         */
        pickOnly: boolean
    }