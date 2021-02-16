import { assert } from '../util';
import { op } from './operation';
import { pad } from './pad';
/**
 * Pads a `tf.Tensor2D` with a given value and paddings. See `pad` for details.
 */
function pad2d_(x, paddings, constantValue = 0) {
    assert(paddings.length === 2 && paddings[0].length === 2 &&
        paddings[1].length === 2, () => 'Invalid number of paddings. Must be length of 2 each.');
    return pad(x, paddings, constantValue);
}
export const pad2d = op({ pad2d_ });
//# sourceMappingURL=pad2d.js.map