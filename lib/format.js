module.exports = function format({ json, beautify }, value) {
    const isObject = Object.prototype.toString.call(value) === "[object Object]";
    const asJson = isObject || Array.isArray(value) || json;
    if (beautify) {
        return JSON.stringify(value, null, 2);
    }
    if (asJson) {
        return JSON.stringify(value);
    }
    return value;
};
