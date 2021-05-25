import { computeStrides, sizeFromShape } from '../util';
/**
 * Validate gather nd inputs.
 *
 * @param tensor The tensor contains the source values.
 * @param indices The tensor contains the indices to slice the source.
 *
 * @returns [resultShape, numUpdates, sliceSize, strides]
 */
export function prepareAndValidate(tensor, indices) {
    const tensorRank = tensor.shape.length;
    const indicesRank = indices.shape.length;
    if (tensorRank < 1) {
        throw new Error('tf.gatherND() expects the input to be rank 1 or higher,' +
            ` but the rank was ${tensorRank}.`);
    }
    if (indicesRank < 1) {
        throw new Error('tf.gatherND() expects the indices to be rank 1 or higher,' +
            ` but the rank was ${indicesRank}.`);
    }
    if (indices.dtype !== 'int32') {
        throw new Error('tf.gatherND() expects the indices to be int32 type,' +
            ` but the dtype was ${indices.dtype}.`);
    }
    if (indices.shape[indicesRank - 1] > tensorRank) {
        throw new Error('index innermost dimension length must be <= tensor rank; saw: ' +
            `${indices.shape[indicesRank - 1]} vs. ${tensorRank}`);
    }
    if (sizeFromShape(tensor.shape) === 0) {
        throw new Error('Requested more than 0 entries, but input is empty.' +
            ` Input shape: ${tensor.shape}.`);
    }
    const indicesShape = indices.shape;
    const sliceRank = indicesShape[indicesShape.length - 1];
    // The result shape is
    //   indices.shape[:-1] + params.shape[indices.shape[-1]:]
    let nResult = 1;
    for (let i = 0; i < indicesShape.length - 1; ++i) {
        nResult *= indicesShape[i];
    }
    const inputShape = tensor.shape;
    const resultShape = indicesShape.slice();
    resultShape.pop();
    let sliceSize = 1;
    for (let i = sliceRank; i < tensorRank; ++i) {
        sliceSize *= inputShape[i];
        resultShape.push(inputShape[i]);
    }
    const strides = [...computeStrides(tensor.shape).map(stride => stride / sliceSize),
        1].slice(0, sliceRank);
    return [resultShape, nResult, sliceSize, strides];
}
//# sourceMappingURL=gather_nd_util.js.map