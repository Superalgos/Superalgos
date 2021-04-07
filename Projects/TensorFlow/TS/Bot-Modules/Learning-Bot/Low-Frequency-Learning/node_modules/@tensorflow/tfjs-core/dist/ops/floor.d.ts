import { Tensor } from '../tensor';
import { TensorLike } from '../types';
/**
 * Computes floor of input `tf.Tensor` element-wise: `floor(x)`.
 *
 * ```js
 * const x = tf.tensor1d([.6, 1.1, -3.3]);
 *
 * x.floor().print();  // or tf.floor(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function floor_<T extends Tensor>(x: T | TensorLike): T;
export declare const floor: typeof floor_;
export {};
