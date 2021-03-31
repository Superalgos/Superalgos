import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        pool<T extends Tensor3D | Tensor4D>(windowShape: [number, number] | number, poolingType: 'avg' | 'max', padding: 'valid' | 'same' | number, diationRate?: [number, number] | number, strides?: [number, number] | number): T;
    }
}
