import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        spaceToBatchND<R extends Rank>(blockShape: number[], paddings: number[][]): Tensor<R>;
    }
}
