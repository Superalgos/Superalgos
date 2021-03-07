import { assert } from '../util';
import { op } from './operation';
import { pad } from './pad';
/**
 * Pads a `tf.Tensor4D` with a given value and paddings. See `pad` for details.
 */
function pad4d_(x, paddings, constantValue = 0) {
    assert(paddings.length === 4 && paddings[0].length === 2 &&
        paddings[1].length === 2 && paddings[2].length === 2 &&
        paddings[3].length === 2, () => 'Invalid number of paddings. Must be length of 2 each.');
    return pad(x, paddings, constantValue);
}
export const pad4d = op({ pad4d_ });
//# sourceMappingURL=pad4d.js.map