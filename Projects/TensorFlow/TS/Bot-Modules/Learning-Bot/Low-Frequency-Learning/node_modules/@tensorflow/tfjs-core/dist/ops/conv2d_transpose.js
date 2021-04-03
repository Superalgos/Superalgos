import { convertToTensor } from '../tensor_util_env';
import { conv2DBackpropInput } from './conv2d_backprop_input';
import { op } from './operation';
/**
 * Computes the transposed 2D convolution of an image, also known as a
 * deconvolution.
 *
 * @param x The input image, of rank 4 or rank 3, of shape
 *   `[batch, height, width, inDepth]`. If rank 3, batch of 1 is assumed.
 * @param filter The filter, rank 4, of shape
 *     `[filterHeight, filterWidth, outDepth, inDepth]`.
 *     `inDepth` must match `inDepth` in `x`.
 * @param outputShape Output shape, of rank 4 or rank 3:
 *     `[batch, height, width, outDepth]`. If rank 3, batch of 1 is assumed.
 * @param strides The strides of the original convolution:
 *     `[strideHeight, strideWidth]`.
 * @param pad  The type of padding algorithm used in the non-transpose version
 *    of the op.
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
function conv2dTranspose_(x, filter, outputShape, strides, pad, dimRoundingMode) {
    const $x = convertToTensor(x, 'x', 'conv2dTranspose');
    const $filter = convertToTensor(filter, 'filter', 'conv2dTranspose');
    return conv2DBackpropInput(outputShape, $x, $filter, strides, pad, 'NHWC', dimRoundingMode);
}
export const conv2dTranspose = op({ conv2dTranspose_ });
//# sourceMappingURL=conv2d_transpose.js.map