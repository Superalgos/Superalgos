import { convertToTensor } from '../tensor_util_env';
import * as util from '../util';
import { matMul } from './mat_mul';
import { op } from './operation';
import { reshape } from './reshape';
/**
 * Computes the outer product of two vectors, `v1` and `v2`.
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3]);
 * const b = tf.tensor1d([3, 4, 5]);
 *
 * tf.outerProduct(a, b).print();
 * ```
 * @param v1 The first vector in the outer product operation.
 * @param v2 The second vector in the outer product operation.
 *
 * @doc {heading: 'Operations', subheading: 'Matrices'}
 */
function outerProduct_(v1, v2) {
    const $v1 = convertToTensor(v1, 'v1', 'outerProduct');
    const $v2 = convertToTensor(v2, 'v2', 'outerProduct');
    util.assert($v1.rank === 1 && $v2.rank === 1, () => `Error in outerProduct: inputs must be rank 1, but got ranks ` +
        `${$v1.rank} and ${$v2.rank}.`);
    const v12D = reshape($v1, [-1, 1]);
    const v22D = reshape($v2, [1, -1]);
    return matMul(v12D, v22D);
}
export const outerProduct = op({ outerProduct_ });
//# sourceMappingURL=outer_product.js.map