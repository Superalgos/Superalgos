import { assert } from '../util';
import { op } from './operation';
import { pad } from './pad';
/**
 * Pads a `tf.Tensor1D` with a given value and paddings. See `pad` for details.
 */
function pad1d_(x, paddings, constantValue = 0) {
    assert(paddings.length === 2, () => 'Invalid number of paddings. Must be length of 2.');
    return pad(x, [paddings], constantValue);
}
export const pad1d = op({ pad1d_ });
//# sourceMappingURL=pad1d.js.map