import { Tensor2D, Tensor4D } from '../../tensor';
import { TensorLike } from '../../types';
/**
 * Applies the given transform(s) to the image(s).
 *
 * @param image 4d tensor of shape `[batch, imageHeight, imageWidth, depth]`.
 * @param transforms Projective transform matrix/matrices. A tensor1d of length
 *     8 or tensor of size N x 8. If one row of transforms is [a0, a1, a2, b0
 *     b1, b2, c0, c1], then it maps the output point (x, y) to a transformed
 *     input point (x', y') = ((a0 x + a1 y + a2) / k, (b0 x + b1 y + b2) / k),
 *     where k = c0 x + c1 y + 1. The transforms are inverted compared to the
 *     transform mapping input points to output points.
 * @param interpolation Interpolation mode.
 *     Supported values: 'nearest', 'bilinear'. Default to 'nearest'.
 * @param fillMode Points outside the boundaries of the input are filled
 *     according to the given mode, one of 'constant', 'reflect', 'wrap',
 *     'nearest'. Default to 'constant'.
 *     'reflect': (d c b a | a b c d | d c b a ) The input is extended by
 *     reflecting about the edge of the last pixel.
 *     'constant': (k k k k | a b c d | k k k k) The input is extended by
 *     filling all values beyond the edge with the same constant value k.
 *     'wrap': (a b c d | a b c d | a b c d) The input is extended by
 *     wrapping around to the opposite edge.
 *     'nearest': (a a a a | a b c d | d d d d) The input is extended by
 *     the nearest pixel.
 * @param fillValue A float represents the value to be filled outside the
 *     boundaries when fillMode is 'constant'.
 * @param Output dimension after the transform, [height, width]. If undefined,
 *     output is the same size as input image.
 *
 * @doc {heading: 'Operations', subheading: 'Images', namespace: 'image'}
 */
declare function transform_(image: Tensor4D | TensorLike, transforms: Tensor2D | TensorLike, interpolation?: 'nearest' | 'bilinear', fillMode?: 'constant' | 'reflect' | 'wrap' | 'nearest', fillValue?: number, outputShape?: [number, number]): Tensor4D;
export declare const transform: typeof transform_;
export {};
