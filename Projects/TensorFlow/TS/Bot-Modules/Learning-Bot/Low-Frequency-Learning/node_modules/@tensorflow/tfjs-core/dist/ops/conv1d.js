import { convertToTensor } from '../tensor_util_env';
import * as util from '../util';
import { conv2d } from './conv2d';
import * as conv_util from './conv_util';
import { op } from './operation';
import { reshape } from './reshape';
/**
 * Computes a 1D convolution over the input x.
 *
 * @param x The input tensor, of rank 3 or rank 2, of shape
 *     `[batch, width, inChannels]`. If rank 2, batch of 1 is assumed.
 * @param filter The filter, rank 3, of shape
 *     `[filterWidth, inDepth, outDepth]`.
 * @param stride The number of entries by which the filter is moved right at
 *     each step.
 * @param pad The type of padding algorithm.
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 *   - For more info, see this guide:
 *     [https://www.tensorflow.org/api_guides/python/nn#Convolution](
 *          https://www.tensorflow.org/api_guides/python/nn#Convolution)
 * @param dataFormat An optional string from "NWC", "NCW". Defaults to "NWC",
 *     the data is stored in the order of [batch, in_width, in_channels]. Only
 *     "NWC" is currently supported.
 * @param dilation The dilation rate in which we sample input values in
 *     atrous convolution. Defaults to `1`. If it is greater than 1, then
 *     stride must be `1`.
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 *
 * @doc {heading: 'Operations', subheading: 'Convolution'}
 */
function conv1d_(x, filter, stride, pad, dataFormat = 'NWC', dilation = 1, dimRoundingMode) {
    const $x = convertToTensor(x, 'x', 'conv1d');
    const $filter = convertToTensor(filter, 'filter', 'conv1d');
    let x3D = $x;
    let reshapedTo3D = false;
    if ($x.rank === 2) {
        reshapedTo3D = true;
        x3D = reshape($x, [1, $x.shape[0], $x.shape[1]]);
    }
    util.assert(x3D.rank === 3, () => `Error in conv1d: input must be rank 3, but got rank ${x3D.rank}.`);
    util.assert($filter.rank === 3, () => `Error in conv1d: filter must be rank 3, but got rank ` +
        `${$filter.rank}.`);
    if (dimRoundingMode != null) {
        util.assert(util.isInt(pad), () => `Error in conv1d: pad must be an integer when using, ` +
            `dimRoundingMode ${dimRoundingMode} but got pad ${pad}.`);
    }
    util.assert(x3D.shape[2] === $filter.shape[1], () => `Error in conv1d: depth of input (${x3D.shape[2]}) must match ` +
        `input depth for filter ${$filter.shape[1]}.`);
    util.assert(conv_util.eitherStridesOrDilationsAreOne(stride, dilation), () => 'Error in conv1D: Either stride or dilation must be 1. ' +
        `Got stride ${stride} and dilation '${dilation}'`);
    util.assert(dataFormat === 'NWC', () => `Error in conv1d: got dataFormat of ${dataFormat} but only NWC is currently supported.`);
    const filter4D = reshape($filter, [1, $filter.shape[0], $filter.shape[1], $filter.shape[2]]);
    const input4D = reshape(x3D, [x3D.shape[0], 1, x3D.shape[1], x3D.shape[2]]);
    const strides = [1, stride];
    const dilations = [1, dilation];
    const conv2dDataFormat = 'NHWC';
    const res = conv2d(input4D, filter4D, strides, pad, conv2dDataFormat, dilations, dimRoundingMode);
    if (reshapedTo3D) {
        return reshape(res, [res.shape[2], res.shape[3]]);
    }
    return reshape(res, [res.shape[0], res.shape[2], res.shape[3]]);
}
export const conv1d = op({ conv1d_ });
//# sourceMappingURL=conv1d.js.map