import { convertToTensor } from '../../tensor_util_env';
import { cast } from '../cast';
import { div } from '../div';
import { Reduction } from '../loss_ops_utils';
import { mean } from '../mean';
import { mul } from '../mul';
import { notEqual } from '../not_equal';
import { ones } from '../ones';
import { op } from '../operation';
import { scalar } from '../scalar';
import { sum } from '../sum';
/**
 * Computes the weighted loss between two tensors.
 *
 * @param losses Tensor of shape `[batch_size, d1, ... dN]`.
 * @param weights Tensor whose rank is either 0, or the same rank as
 *    `losses`, and must be broadcastable to `losses` (i.e., all
 *    dimensions must be either `1`, or the same as the corresponding
 *    `losses` dimension).
 *
 * @doc {heading: 'Training', subheading: 'Losses', namespace: 'losses'}
 */
function computeWeightedLoss_(losses, weights, reduction = Reduction.SUM_BY_NONZERO_WEIGHTS) {
    const $losses = convertToTensor(losses, 'losses', 'computeWeightedLoss');
    let $weights = null;
    if (weights != null) {
        $weights = convertToTensor(weights, 'weights', 'computeWeightedLoss');
    }
    const weightedLoss = ($weights == null) ? $losses : mul($losses, $weights);
    if (reduction === Reduction.NONE) {
        return weightedLoss;
    }
    if (reduction === Reduction.SUM) {
        return sum(weightedLoss);
    }
    if (reduction === Reduction.MEAN) {
        if ($weights == null) {
            return mean(weightedLoss);
        }
        else {
            const broadcastFactor = $losses.size / $weights.size;
            const result = div(sum(weightedLoss), sum($weights));
            return broadcastFactor > 1 ? div(result, scalar(broadcastFactor)) :
                result;
        }
    }
    if (reduction === Reduction.SUM_BY_NONZERO_WEIGHTS) {
        if ($weights == null) {
            return div(sum(weightedLoss), scalar($losses.size));
        }
        else {
            const broadcastedWeights = mul($weights, ones($losses.shape));
            const numNonZeros = cast(sum(notEqual(broadcastedWeights, scalar(0))), 'float32');
            return div(sum(weightedLoss), numNonZeros);
        }
    }
    throw Error(`Unknown reduction: ${reduction}`);
}
export const computeWeightedLoss = op({ computeWeightedLoss_ });
//# sourceMappingURL=compute_weighted_loss.js.map