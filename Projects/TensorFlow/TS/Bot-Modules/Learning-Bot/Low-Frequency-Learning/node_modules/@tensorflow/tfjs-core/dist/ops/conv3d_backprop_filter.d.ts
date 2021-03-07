import { Tensor4D, Tensor5D } from '../tensor';
/**
 * Computes the derivative of the filter of a 3D convolution.
 *
 * @param x The input tensor, of rank 5 or rank 4 of shape
 *     [batch, depth, height, width, inChannels]. If rank 4, batch of 1 is
 *     assumed.
 * @param dy The dy image, of rank 5 or rank 4, of shape
 *     [batch, depth, height, width, outDepth]. If rank 4, batch of 1 is
 *     assumed.
 * @param filterShape The shape of the filter, length 5,
 *     [filterDepth, filterHeight, filterWidth, inDepth, outDepth].
 * @param strides The strides of the convolution: [strideDepth, strideHeight,
 * strideWidth].
 * @param pad A string from: 'same', 'valid'. The type of padding algorithm
 *     used in the forward prop of the op.
 */
declare function conv3DBackpropFilter_<T extends Tensor4D | Tensor5D>(x: T, dy: T, filterShape: [number, number, number, number, number], strides: [number, number, number] | number, pad: 'valid' | 'same'): Tensor5D;
export declare const conv3DBackpropFilter: typeof conv3DBackpropFilter_;
export {};
