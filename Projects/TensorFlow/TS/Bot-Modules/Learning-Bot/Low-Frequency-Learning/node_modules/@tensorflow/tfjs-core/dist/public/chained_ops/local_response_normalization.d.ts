import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        localResponseNormalization<T extends Tensor>(depthRadius?: number, bias?: number, alpha?: number, beta?: number): T;
    }
}
