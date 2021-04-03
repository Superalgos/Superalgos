import { Tensor4D, Tensor5D } from '../tensor';
/**
 * Computes the derivative of the input of a 3D convolution.
 *
 * @param xShape The shape of the input: [batch, depth, height, width,
 * in_channels]. If length of 4, batch of 1 is assumed.
 * @param dy The derivative of the output, of rank 5 or rank 4 of shape
 *   `[batch, outDepth, outHeight, outWidth, in_channels]`.
 * If rank 4, batch of 1 is assumed.
 * @param filter The filter, rank 5, of shape
 *     `[filterDepth, filterHeight, filterWidth, inDepth, outDepth]`.
 * @param strides The strides of the convolution: `[strideDepth, strideHeight,
 * strideWidth]`.
 * @param pad The type of padding algorithm used:
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 */
declare function conv3DBackpropInput_<T extends Tensor4D | Tensor5D>(xShape: [number, number, number, number, number] | [number, number, number, number], dy: T, filter: Tensor5D, strides: [number, number, number] | number, pad: 'valid' | 'same'): T;
export declare const conv3DBackpropInput: typeof conv3DBackpropInput_;
export {};
