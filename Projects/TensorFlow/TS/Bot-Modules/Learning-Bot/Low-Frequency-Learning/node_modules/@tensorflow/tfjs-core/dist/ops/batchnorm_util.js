import { reshape } from './reshape';
export function xAs4D(x) {
    let x4D;
    if (x.rank === 0 || x.rank === 1) {
        x4D = reshape(x, [1, 1, 1, x.size]);
    }
    else if (x.rank === 2) {
        x4D = reshape(x, [1, 1, x.shape[0], x.shape[1]]);
    }
    else if (x.rank === 3) {
        x4D = reshape(x, [1, x.shape[0], x.shape[1], x.shape[2]]);
    }
    else {
        x4D = x;
    }
    return x4D;
}
//# sourceMappingURL=batchnorm_util.js.map