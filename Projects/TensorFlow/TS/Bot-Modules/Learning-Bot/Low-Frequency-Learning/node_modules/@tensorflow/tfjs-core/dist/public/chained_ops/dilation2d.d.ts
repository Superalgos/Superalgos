import { Rank, TensorLike3D } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        dilation2d<T extends Tensor3D | Tensor4D>(filter: Tensor3D | TensorLike3D, strides: [number, number] | number, pad: 'valid' | 'same', dilations?: [number, number] | number, dataFormat?: 'NHWC'): T;
    }
}
