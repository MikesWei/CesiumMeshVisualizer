define(function () {

    /**
    *
    *@param {Cesium.Cartesian3}axis 旋转轴
    *@param {Number}angle 旋转角度
    *
    *@property {Cesium.Cartesian3}axis 旋转轴
    *@property {Number}angle 旋转角度
    *@property {Cesium.Event}paramChanged  
    *@constructor
    *@memberof Cesium
    */
    function Rotation(axis, angle) {
        this._axis = axis;
        this._angle = angle;
        this.paramChanged = new Cesium.Event();
    }
    Cesium.defineProperties(Rotation.prototype, {
        axis: {
            set: function (val) {
                if (val.x != this._axis.x
                    || val.y != this._axis.y
                    || val.z != this._axis.z) {
                    this._axis = val;
                    this.paramChanged.raiseEvent();
                }
                this._axis = val;
            },
            get: function () {
                return this._axis;
            }
        },
        angle: {
            set: function (val) {
                if (val != this._angle) {
                    this._angle = val;
                    this.paramChanged.raiseEvent();
                }
                this._angle = val;
            },
            get: function () {
                return this._angle;
            }
        }
    })

    return Rotation;
})