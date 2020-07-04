
/**
*定义属性，并监听属性变化事件,属性值的数据类型可以实现equals接口用于进行更进一步的比较
*@param {Object}owner
*@param {String}name
*@param {Any}defaultVal
*@param {(
        changed: string, owner: object, newVal: *, oldVal: *
        ) => void}onChanged
*@memberof Cesium
*/
function defineProperty(owner, name, defaultVal, onChanged) {
    owner["_" + name] = defaultVal;
    var value = {
        get: function () {
            return this["_" + name];
        },
        set: function (val) {
            var changed = val != this["_" + name];
            if (this["_" + name] && this["_" + name].equals && val) {
                changed = this["_" + name].equals(val);
            }
            var oldVal = this["_" + name];
            this["_" + name] = val;
            if (typeof onChanged == 'function' && changed) {
                onChanged(changed, owner, val, oldVal);
            }
        }
    };
    var properties = {};
    properties[name] = value;
    Object.defineProperties(owner, properties)
}

export default defineProperty;