import { Tensor } from '../tensor';
import { TensorLike } from '../types';
/**
 * Returns the truth value of (a >= b) element-wise. Supports broadcasting.
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3]);
 * const b = tf.tensor1d([2, 2, 2]);
 *
 * a.greaterEqual(b).print();
 * ```
 *
 * @param a The first input tensor.
 * @param b The second input tensor. Must have the same dtype as `a`.
 *
 * @doc {heading: 'Operations', subheading: 'Logical'}
 */
declare function greaterEqual_<T extends Tensor>(a: Tensor | TensorLike, b: Tensor | TensorLike): T;
export declare const greaterEqual: typeof greaterEqual_;
export {};
