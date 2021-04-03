import { concat } from './concat';
import { op } from './operation';
/**
 * Concatenates a list of `tf.Tensor4D`s along an axis.
 * See `concat` for details.
 *
 * @param tensors A list of `tf.Tensor`s to concatenate.
 * @param axis The axis to concate along.
 * @return The concatenated array.
 */
function concat4d_(tensors, axis) {
    return concat(tensors, axis);
}
export const concat4d = op({ concat4d_ });
//# sourceMappingURL=concat_4d.js.map