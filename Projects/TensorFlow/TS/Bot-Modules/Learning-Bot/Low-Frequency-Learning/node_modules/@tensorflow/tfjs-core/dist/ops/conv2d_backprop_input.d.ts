import { Tensor3D, Tensor4D } from '../tensor';
import * as conv_util from './conv_util';
/**
 * Computes the derivative of the input of a 2D convolution.
 *
 * @param xShape The shape of the input: [batch, height, width, inDepth].
 * If length of 3, batch of 1 is assumed.
 * @param dy The derivative of the output, of rank 4 or rank 3 of shape
 *   `[batch, outHeight, outWidth, outDepth]`. If rank 3, batch of 1 is
 * assumed.
 * @param filter The filter, rank 4, of shape
 *     `[filterHeight, filterWidth, inDepth, outDepth]`.
 * @param strides The strides of the convolution: `[strideHeight,
 * strideWidth]`.
 * @param pad The type of padding algorithm used:
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 * @param dataFormat: An optional string from: "NHWC", "NCHW". Defaults to
 *     "NHWC". Specify the data format of the input and output data. With the
 *     default format "NHWC", the data is stored in the order of: [batch,
 *     height, width, channels].
 * @param dimRoundingMode A string from: 'ceil', 'round', 'floor'. If none is
 *     provided, it will default to truncate.
 */
declare function conv2DBackpropInput_<T extends Tensor3D | Tensor4D>(xShape: [number, number, number, number] | [number, number, number], dy: T, filter: Tensor4D, strides: [number, number] | number, pad: 'valid' | 'same' | number | conv_util.ExplicitPadding, dataFormat?: 'NHWC' | 'NCHW', dimRoundingMode?: 'floor' | 'round' | 'ceil'): T;
export declare const conv2DBackpropInput: typeof conv2DBackpropInput_;
export {};
