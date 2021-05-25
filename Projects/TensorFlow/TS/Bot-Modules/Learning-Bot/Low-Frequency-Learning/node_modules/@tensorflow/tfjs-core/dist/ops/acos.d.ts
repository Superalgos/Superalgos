import { Tensor } from '../tensor';
import { TensorLike } from '../types';
/**
 * Computes acos of the input `tf.Tensor` element-wise: `acos(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, 1, -1, .7]);
 *
 * x.acos().print();  // or tf.acos(x)
 * ```
 * @param x The input tensor.
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
declare function acos_<T extends Tensor>(x: T | TensorLike): T;
export declare const acos: typeof acos_;
export {};
