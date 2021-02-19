import { ExplicitPadding } from '../../ops/conv_util';
import { Rank, TensorLike3D } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        conv1d<T extends Tensor2D | Tensor3D>(filter: Tensor3D | TensorLike3D, stride: number, pad: 'valid' | 'same' | number | ExplicitPadding, dataFormat?: 'NWC' | 'NCW', dilation?: number, dimRoundingMode?: 'floor' | 'round' | 'ceil'): T;
    }
}
