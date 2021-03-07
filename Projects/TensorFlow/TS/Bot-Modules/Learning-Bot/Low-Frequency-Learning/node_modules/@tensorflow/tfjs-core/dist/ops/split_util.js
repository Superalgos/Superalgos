import { assert } from '../util';
/**
 * Prepare the split size array. When the input is a number, the axis is evenly
 * divided among the split size. When the input contains the negative value, the
 * rest of the axis is allocated toward that.
 */
export function prepareSplitSize(x, numOrSizeSplits, axis = 0) {
    let splitSizes = [];
    if (typeof (numOrSizeSplits) === 'number') {
        assert(x.shape[axis] % numOrSizeSplits === 0, () => 'Number of splits must evenly divide the axis.');
        splitSizes =
            new Array(numOrSizeSplits).fill(x.shape[axis] / numOrSizeSplits);
    }
    else {
        const numOfNegs = numOrSizeSplits.reduce((count, value) => {
            if (value === -1) {
                count += 1;
            }
            return count;
        }, 0);
        assert(numOfNegs <= 1, () => 'There should be only one negative value in split array.');
        const negIndex = numOrSizeSplits.indexOf(-1);
        // Allow the number of split array to be -1, which indicates the rest
        // of dimension is allocated to that split.
        if (negIndex !== -1) {
            const total = numOrSizeSplits.reduce((a, b) => b > 0 ? a + b : a);
            numOrSizeSplits[negIndex] = x.shape[axis] - total;
        }
        assert(x.shape[axis] === numOrSizeSplits.reduce((a, b) => a + b), () => 'The sum of sizes must match the size of the axis dimension.');
        splitSizes = numOrSizeSplits;
    }
    return splitSizes;
}
//# sourceMappingURL=split_util.js.map