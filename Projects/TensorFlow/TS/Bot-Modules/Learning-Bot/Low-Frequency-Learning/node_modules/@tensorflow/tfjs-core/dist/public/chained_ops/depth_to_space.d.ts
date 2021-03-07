import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        depthToSpace<T extends Tensor4D>(blockSize: number, dataFormat: 'NHWC' | 'NCHW'): T;
    }
}
