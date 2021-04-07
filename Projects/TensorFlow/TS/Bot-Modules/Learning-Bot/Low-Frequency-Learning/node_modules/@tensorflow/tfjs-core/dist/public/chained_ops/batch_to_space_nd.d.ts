import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        batchToSpaceND<R extends Rank>(blockShape: number[], crops: number[][]): Tensor<R>;
    }
}
