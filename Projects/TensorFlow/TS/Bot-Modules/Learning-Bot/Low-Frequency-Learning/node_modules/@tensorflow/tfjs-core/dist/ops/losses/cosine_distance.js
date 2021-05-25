import { convertToTensor } from '../../tensor_util_env';
import { assertShapesMatch } from '../../util';
import { Reduction } from '../loss_ops_utils';
import { mul } from '../mul';
import { op } from '../operation';
import { scalar } from '../scalar';
import { sub } from '../sub';
import { sum } from '../sum';
import { computeWeightedLoss } from './compute_weighted_loss';
/**
 * Computes the cosine distance loss between two tensors.
 *
 * @param labels The ground truth output tensor, same dimensions as
 *    'predictions'.
 * @param predictions The predicted outputs.
 * @param axis The dimension along which the cosine distance is computed.
 * @param weights Tensor whose rank is either 0, or the same rank as
 *    `labels`, and must be broadcastable to `labels` (i.e., all dimensions
 *    must be either `1`, or the same as the corresponding `losses`
 *    dimension).
 * @param reduction Type of reduction to apply to loss. Should be of type
 *    `Reduction`
 *
 * @doc {heading: 'Training', subheading: 'Losses', namespace: 'losses'}
 */
function cosineDistance_(labels, predictions, axis, weights, reduction = Reduction.SUM_BY_NONZERO_WEIGHTS) {
    const $labels = convertToTensor(labels, 'labels', 'cosineDistance');
    const $predictions = convertToTensor(predictions, 'predictions', 'cosineDistance');
    let $weights = null;
    if (weights != null) {
        $weights = convertToTensor(weights, 'weights', 'cosineDistance');
    }
    assertShapesMatch($labels.shape, $predictions.shape, 'Error in cosineDistance: ');
    const one = scalar(1);
    const losses = sub(one, sum(mul($labels, $predictions), axis, true));
    return computeWeightedLoss(losses, $weights, reduction);
}
export const cosineDistance = op({ cosineDistance_ });
//# sourceMappingURL=cosine_distance.js.map