export function createNumberAttr(value) {
    return { value, type: 'number' };
}
export function createNumberAttrFromIndex(inputIndex) {
    return { inputIndexStart: inputIndex, type: 'number' };
}
export function createStrAttr(str) {
    return { value: str, type: 'string' };
}
export function createStrArrayAttr(strs) {
    return { value: strs, type: 'string[]' };
}
export function createBoolAttr(value) {
    return { value, type: 'bool' };
}
export function createTensorShapeAttr(value) {
    return { value, type: 'shape' };
}
export function createShapeAttrFromIndex(inputIndex) {
    return { inputIndexStart: inputIndex, type: 'shape' };
}
export function createNumericArrayAttr(value) {
    return { value, type: 'number[]' };
}
export function createNumericArrayAttrFromIndex(inputIndex) {
    return { inputIndexStart: inputIndex, type: 'number[]' };
}
export function createBooleanArrayAttrFromIndex(inputIndex) {
    return { inputIndexStart: inputIndex, type: 'bool[]' };
}
export function createTensorAttr(index) {
    return { inputIndexStart: index, type: 'tensor' };
}
export function createTensorsAttr(index, paramLength) {
    return { inputIndexStart: index, inputIndexEnd: paramLength, type: 'tensors' };
}
export function createDtypeAttr(dtype) {
    return { value: dtype, type: 'dtype' };
}
export function validateParam(node, opMappers, tfOpName) {
    const opMapper = tfOpName != null ?
        opMappers.find(mapper => mapper.tfOpName === tfOpName) :
        opMappers.find(mapper => mapper.tfOpName === node.op);
    const matched = Object.keys(node.inputParams).every(key => {
        const value = node.inputParams[key];
        const def = opMapper.inputs.find(param => param.name === key);
        return def && def.type === value.type &&
            def.start === value.inputIndexStart && def.end === value.inputIndexEnd;
    }) &&
        Object.keys(node.attrParams).every(key => {
            const value = node.attrParams[key];
            const def = opMapper.attrs.find(param => param.name === key);
            return def && def.type === value.type;
        });
    if (!matched) {
        console.log('node = ', node);
        console.log('opMapper = ', opMapper);
    }
    return matched;
}
//# sourceMappingURL=test_helper.js.map