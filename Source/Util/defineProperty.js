define(function () {

    /**
    *定义属性，并监听属性变化事件,属性值的数据类型可以实现equals接口用于进行更进一步的比较
    *@param {Object}owner
    *@param {String}name
    *@param {Any}defaultVal
    *@param {Function}onChanged
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
                if (this["_" + name].equals) {
                    changed = this["_" + name].equals(val);
                }
                this["_" + name] = val;
                if (typeof onChanged == 'function' && changed) {
                    onChanged(changed, owner);
                }
            }
        };
        var properties = {};
        properties[name] = value;
        Cesium.defineProperties(owner, properties)
    }

    return defineProperty;
})