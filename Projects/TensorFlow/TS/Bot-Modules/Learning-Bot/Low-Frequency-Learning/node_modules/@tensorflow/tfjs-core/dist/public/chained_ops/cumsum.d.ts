import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        cumsum<R extends Rank>(axis?: number, exclusive?: boolean, reverse?: boolean): Tensor<R>;
    }
}
