import { convertToTensor, convertToTensorArray } from '../tensor_util_env';
import { op } from './operation';
/**
 * Computes the next states and outputs of a stack of LSTMCells.
 *
 * Each cell output is used as input to the next cell.
 *
 * Returns `[cellState, cellOutput]`.
 *
 * Derived from tf.contrib.rn.MultiRNNCell.
 *
 * @param lstmCells Array of LSTMCell functions.
 * @param data The input to the cell.
 * @param c Array of previous cell states.
 * @param h Array of previous cell outputs.
 *
 * @doc {heading: 'Operations', subheading: 'RNN'}
 */
function multiRNNCell_(lstmCells, data, c, h) {
    const $data = convertToTensor(data, 'data', 'multiRNNCell');
    const $c = convertToTensorArray(c, 'c', 'multiRNNCell');
    const $h = convertToTensorArray(h, 'h', 'multiRNNCell');
    let input = $data;
    const newStates = [];
    for (let i = 0; i < lstmCells.length; i++) {
        const output = lstmCells[i](input, $c[i], $h[i]);
        newStates.push(output[0]);
        newStates.push(output[1]);
        input = output[1];
    }
    const newC = [];
    const newH = [];
    for (let i = 0; i < newStates.length; i += 2) {
        newC.push(newStates[i]);
        newH.push(newStates[i + 1]);
    }
    return [newC, newH];
}
export const multiRNNCell = op({ multiRNNCell_ });
//# sourceMappingURL=multi_rnn_cell.js.map