import { Rank, TensorLike, TensorLike4D } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        separableConv2d<T extends Tensor3D | Tensor4D>(depthwiseFilter: Tensor4D | TensorLike4D, pointwiseFilter: Tensor4D | TensorLike, strides: [number, number] | number, pad: 'valid' | 'same', dilation?: [number, number] | number, dataFormat?: 'NHWC' | 'NCHW'): T;
    }
}
