import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        split<T extends Tensor>(numOrSizeSplits: number[] | number, axis?: number): T[];
    }
}
