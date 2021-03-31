import { Tensor } from '../tensor';
import { DataType, TensorLike } from '../types';
/**
 * Casts a `tf.Tensor` to a new dtype.
 *
 * ```js
 * const x = tf.tensor1d([1.5, 2.5, 3]);
 * tf.cast(x, 'int32').print();
 * ```
 * @param x The input tensor to be casted.
 * @param dtype The dtype to cast the input tensor to.
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
declare function cast_<T extends Tensor>(x: T | TensorLike, dtype: DataType): T;
export declare const cast: typeof cast_;
export {};
