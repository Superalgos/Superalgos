/**
 * Validate sparseToDense inputs.
 *
 * @param sparseIndices A 0-D, 1-D, or 2-D Tensor of type int32.
 * sparseIndices[i] contains the complete index where sparseValues[i] will be
 * placed.
 * @param sparseValues A 0-D or 1-D Tensor. Values
 * corresponding to each row of sparseIndices, or a scalar value to be used for
 * all sparse indices.
 * @param outputShape number[]. Shape of the dense output tensor.
 * @param validateIndices boolean. indice validation is not supported, error
 * will be thrown if it is set.
 */
export function validateInput(sparseIndices, sparseValues, outputShape, defaultValues) {
    if (sparseIndices.dtype !== 'int32') {
        throw new Error('tf.sparseToDense() expects the indices to be int32 type,' +
            ` but the dtype was ${sparseIndices.dtype}.`);
    }
    if (sparseIndices.rank > 2) {
        throw new Error('sparseIndices should be a scalar, vector, or matrix,' +
            ` but got shape ${sparseIndices.shape}.`);
    }
    const numElems = sparseIndices.rank > 0 ? sparseIndices.shape[0] : 1;
    const numDims = sparseIndices.rank > 1 ? sparseIndices.shape[1] : 1;
    if (outputShape.length !== numDims) {
        throw new Error('outputShape has incorrect number of elements:,' +
            ` ${outputShape.length}, should be: ${numDims}.`);
    }
    const numValues = sparseValues.size;
    if (!(sparseValues.rank === 0 ||
        sparseValues.rank === 1 && numValues === numElems)) {
        throw new Error('sparseValues has incorrect shape ' +
            `${sparseValues.shape}, should be [] or [${numElems}]`);
    }
    if (sparseValues.dtype !== defaultValues.dtype) {
        throw new Error('sparseValues.dtype must match defaultValues.dtype');
    }
}
//# sourceMappingURL=sparse_to_dense_util.js.map