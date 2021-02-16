import { Rank, TensorLike4D } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        conv2d<T extends Tensor3D | Tensor4D>(filter: Tensor4D | TensorLike4D, strides: [number, number] | number, pad: 'valid' | 'same' | number, dataFormat?: 'NHWC' | 'NCHW', dilations?: [number, number] | number, dimRoundingMode?: 'floor' | 'round' | 'ceil'): T;
    }
}
