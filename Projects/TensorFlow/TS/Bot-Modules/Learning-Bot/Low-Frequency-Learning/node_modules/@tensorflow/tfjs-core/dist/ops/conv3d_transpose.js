import { convertToTensor } from '../tensor_util_env';
import { conv3DBackpropInput } from './conv3d_backprop_input';
import { op } from './operation';
/**
 * Computes the transposed 3D convolution of a volume, also known as a
 * deconvolution.
 *
 * @param x The input image, of rank 5 or rank 4, of shape
 *   `[batch, depth, height, width, inDepth]`. If rank 4, batch of 1 is assumed.
 * @param filter The filter, rank 4, of shape
 *     `[depth, filterHeight, filterWidth, outDepth, inDepth]`.
 *     `inDepth` must match `inDepth` in `x`.
 * @param outputShape Output shape, of rank 5 or rank 4:
 *     `[batch, depth, height, width, outDepth]`. If rank 3, batch of 1 is
 *    assumed.
 * @param strides The strides of the original convolution:
 *     `[strideDepth, strideHeight, strideWidth]`.
 * @param pad  The type of padding algorithm used in the non-transpose version
 *    of the op.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
function conv3dTranspose_(x, filter, outputShape, strides, pad) {
    const $x = convertToTensor(x, 'x', 'conv3dTranspose');
    const $filter = convertToTensor(filter, 'filter', 'conv3dTranspose');
    return conv3DBackpropInput(outputShape, $x, $filter, strides, pad);
}
export const conv3dTranspose = op({ conv3dTranspose_ });
//# sourceMappingURL=conv3d_transpose.js.map