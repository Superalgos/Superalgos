import { Rank, TensorLike4D } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        conv2dTranspose<T extends Tensor3D | Tensor4D>(filter: Tensor4D | TensorLike4D, outputShape: [number, number, number, number] | [number, number, number], strides: [number, number] | number, pad: 'valid' | 'same' | number, dimRoundingMode?: 'floor' | 'round' | 'ceil'): T;
    }
}
