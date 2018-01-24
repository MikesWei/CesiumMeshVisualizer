define(['Util/defineProperty'], function (defineProperty) {
    var defaultValue = Cesium.defaultValue;
    /**
    *
    *@param {Object}options
    *@param {Object}[options.uniforms]
    *@param {Object}[options.uniformStateUsed]
    *@param {Boolean}[options.translucent]
    *@param {Boolean}[options.wireframe]
    *@param {Enum}[options.side=Cesium.MeshMaterial.Sides.DOUBLE]
    *@param {String|Cesium.Color}[options.defaultColor=Cesium.Color.WHITE]
    *@param {String}[options.vertexShader]
    *@param {String}[options.fragmentShader]
    *
    *
    *@property {Object}uniforms
    *@property {Object}uniformStateUsed
    *@property {Boolean}translucent
    *@property {Boolean}wireframe
    *@property {Enum}side
    *@property {String|Cesium.Color}defaultColor
    *@property {String}vertexShader
    *@property {String}fragmentShader
    *
    *@constructor
    *@memberof Cesium
    */
    function MeshMaterial(options) {
        options = defaultValue(options, {});
        options.uniforms = defaultValue(options.uniforms, {});
        var that = this;

        this._uuid = Cesium.createGuid();

        function initUniform(srcUniforms) {
            var _uniforms = {};

            for (var i in srcUniforms) {
                if (srcUniforms.hasOwnProperty(i) && Cesium.defined(srcUniforms[i])) {
                    var item = srcUniforms[i];

                    var val = {};
                    val.needsUpdate = true;

                    if (Cesium.isArray(item) && item.length >= 3 && item.length <= 4 && typeof item[0] === 'number') {
                        srcUniforms[i] = new Cesium.Color(srcUniforms[i][0], srcUniforms[i][1], srcUniforms[i][2], srcUniforms[i][3]);
                    } else if (Cesium.defined(item.value)) {
                        for (var n in item) {
                            if (item.hasOwnProperty(n)) {
                                val[n] = item[n];
                            }
                        }
                    }

                    if (srcUniforms[i].hasOwnProperty("uuid")) {
                        defineProperty(val, "uuid", srcUniforms[i].uuid, function (changed, owner) {
                            owner.needsUpdate = changed;
                        });
                    } else {
                        defineProperty(val, "uuid", Cesium.createGuid(), function (changed, owner) {
                            owner.needsUpdate = changed;
                        });
                    }
                    if (srcUniforms[i].hasOwnProperty("value")) {
                        defineProperty(val, "value", srcUniforms[i].value, function (changed, owner) {
                            owner.needsUpdate = changed;
                        });
                    } else {
                        defineProperty(val, "value", srcUniforms[i], function (changed, owner) {
                            owner.needsUpdate = changed;
                        });
                    }
                    _uniforms[i] = val;
                    //defineProperty(_uniforms, i, val, function (changed) {
                    //    that.needsUpdate = changed;
                    //});
                }
            }
            return _uniforms;
        }
        this._defaultColor = defaultValue(options.defaultColor, Cesium.Color.WHITE);
        if (typeof this._defaultColor == 'string') {
            this._defaultColor = Cesium.Color.fromCssColorString(this._defaultColor);
        }

        this._pickedColor = defaultValue(options.pickedColor, Cesium.Color.YELLOW);
        if (typeof this._pickedColor == 'string') {
            this._pickedColor = Cesium.Color.fromCssColorString(this._pickedColor);
        }
        this._picked = defaultValue(options.picked, 0);
        options.uniforms.pickedColor = this._pickedColor;
        options.uniforms.defaultColor = this._defaultColor;
        options.uniforms.picked = this._picked;

        this._uniforms = initUniform(options.uniforms);

        function onPropertyChanged(changed) {
            that.needsUpdate = changed;
        }

        defineProperty(this, "translucent", defaultValue(options.translucent, false), onPropertyChanged);
        defineProperty(this, "wireframe", defaultValue(options.wireframe, false), onPropertyChanged);
        defineProperty(this, "side", defaultValue(options.side, MeshMaterial.Sides.DOUBLE), onPropertyChanged);

        defineProperty(this, "uniformStateUsed", defaultValue(options.uniformStateUsed, [{
            uniformStateName: "model",
            glslVarName: "modelMatrix"
        }]), onPropertyChanged);
        defineProperty(this, "uniforms", this._uniforms, function () {
            that._uniforms = initUniform(that._uniforms);
        });


        this._vertexShader = '//#inner\n void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n}';
        this._fragmentShader = '//#inner' + this._uuid + '\n uniform float picked;\n uniform vec4  pickedColor;\n uniform vec4  defaultColor;\n void main() {\ngl_FragColor = defaultColor;\n if(picked!=0.0){\ngl_FragColor = pickedColor;}}';// vec4( ' + this._defaultColor.red + ',' + this._defaultColor.green + ',' + this._defaultColor.blue + ',' + this._defaultColor.alpha + ');\n}';

        defineProperty(this, "vertexShader", defaultValue(options.vertexShader, this._vertexShader), onPropertyChanged);
        defineProperty(this, "fragmentShader", defaultValue(options.fragmentShader, this._fragmentShader), onPropertyChanged);

        this.depthTest = true;
        this.depthMask = true;
        this.blending = true;

        this.needsUpdate = true;
    }


    Cesium.defineProperties(MeshMaterial.prototype, {
        uuid: {
            get: function () {
                return this._uuid;
            }
        },
        defaultColor: {
            set: function (val) {
                if (typeof val == 'string') {
                    val = Cesium.Color.fromCssColorString(val);
                }
                Cesium.Color.clone(val, this._defaultColor);
            },
            get: function () {
                return this._defaultColor;
            }
        }
    });

    /**
   *
   *@memberof Cesium.MeshMaterial
   *@property {Enum}FRONT
   *@property {Enum}BACK
   *@property {Enum}DOUBLE
   */
    MeshMaterial.Sides = {
        FRONT: 3,
        BACK: 1,
        DOUBLE: 2
    }
    return MeshMaterial;
})