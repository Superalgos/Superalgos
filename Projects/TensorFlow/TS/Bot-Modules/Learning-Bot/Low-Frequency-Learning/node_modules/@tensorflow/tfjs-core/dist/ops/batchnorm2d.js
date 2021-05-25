import { convertToTensor } from '../tensor_util_env';
import * as util from '../util';
import { batchNorm } from './batchnorm';
import { op } from './operation';
/**
 * Batch normalization, strictly for 2D. For the more relaxed version, see
 * `tf.batchNorm`.
 *
 * @param x The input Tensor.
 * @param mean A mean Tensor.
 * @param variance A variance Tensor.
 * @param offset An offset Tensor.
 * @param scale A scale Tensor.
 * @param varianceEpsilon A small float number to avoid dividing by 0.
 */
function batchNorm2d_(x, mean, variance, offset, scale, varianceEpsilon) {
    const $x = convertToTensor(x, 'x', 'batchNorm');
    const $mean = convertToTensor(mean, 'mean', 'batchNorm');
    const $variance = convertToTensor(variance, 'variance', 'batchNorm');
    let $scale;
    if (scale != null) {
        $scale = convertToTensor(scale, 'scale', 'batchNorm');
    }
    let $offset;
    if (offset != null) {
        $offset = convertToTensor(offset, 'offset', 'batchNorm');
    }
    util.assert($x.rank === 2, () => `Error in batchNorm2D: x must be rank 2 but got rank ` +
        `${$x.rank}.`);
    util.assert($mean.rank === 2 || $mean.rank === 1, () => `Error in batchNorm2D: mean must be rank 2 or rank 1 but ` +
        `got rank ${$mean.rank}.`);
    util.assert($variance.rank === 2 || $variance.rank === 1, () => `Error in batchNorm2D: variance must be rank 2 or rank 1 ` +
        `but got rank ${$variance.rank}.`);
    if ($scale != null) {
        util.assert($scale.rank === 2 || $scale.rank === 1, () => `Error in batchNorm2D: scale must be rank 2 or rank 1 ` +
            `but got rank ${$scale.rank}.`);
    }
    if ($offset != null) {
        util.assert($offset.rank === 2 || $offset.rank === 1, () => `Error in batchNorm2D: offset must be rank 2 or rank 1 ` +
            `but got rank ${$offset.rank}.`);
    }
    return batchNorm($x, $mean, $variance, $offset, $scale, varianceEpsilon);
}
export const batchNorm2d = op({ batchNorm2d_ });
//# sourceMappingURL=batchnorm2d.js.map