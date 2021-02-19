import { convertToTensor } from '../../tensor_util_env';
import { assertShapesMatch } from '../../util';
import { Reduction } from '../loss_ops_utils';
import { mul } from '../mul';
import { op } from '../operation';
import { relu } from '../relu';
import { scalar } from '../scalar';
import { sub } from '../sub';
import { computeWeightedLoss } from './compute_weighted_loss';
/**
 * Computes the Hinge loss between two tensors.
 *
 * @param labels The ground truth output tensor, same dimensions as
 *    'predictions'.
 * @param predictions The predicted outputs.
 * @param weights Tensor whose rank is either 0, or the same rank as
 *    `labels`, and must be broadcastable to `labels` (i.e., all dimensions
 *    must be either `1`, or the same as the corresponding `losses`
 *    dimension).
 * @param reduction Type of reduction to apply to loss. Should be of type
 *    `Reduction`
 *
 * @doc {heading: 'Training', subheading: 'Losses', namespace: 'losses'}
 */
function hingeLoss_(labels, predictions, weights, reduction = Reduction.SUM_BY_NONZERO_WEIGHTS) {
    let $labels = convertToTensor(labels, 'labels', 'hingeLoss');
    const $predictions = convertToTensor(predictions, 'predictions', 'hingeLoss');
    let $weights = null;
    if (weights != null) {
        $weights = convertToTensor(weights, 'weights', 'hingeLoss');
    }
    assertShapesMatch($labels.shape, $predictions.shape, 'Error in hingeLoss: ');
    const one = scalar(1);
    // Convert binary labels to (-1, 1)
    $labels = sub(mul(scalar(2), $labels), one);
    const losses = relu(sub(one, mul($labels, $predictions)));
    return computeWeightedLoss(losses, $weights, reduction);
}
export const hingeLoss = op({ hingeLoss_ });
//# sourceMappingURL=hinge_loss.js.map