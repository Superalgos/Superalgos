import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        maxPool<T extends Tensor3D | Tensor4D>(filterSize: [number, number] | number, strides: [number, number] | number, pad: 'valid' | 'same' | number, dimRoundingMode?: 'floor' | 'round' | 'ceil'): T;
    }
}
