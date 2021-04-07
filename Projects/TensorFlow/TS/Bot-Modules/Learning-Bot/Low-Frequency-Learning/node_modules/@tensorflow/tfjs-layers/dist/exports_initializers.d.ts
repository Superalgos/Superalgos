/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { ConstantArgs, IdentityArgs, Initializer, OrthogonalArgs, RandomNormalArgs, RandomUniformArgs, SeedOnlyInitializerArgs, TruncatedNormalArgs, VarianceScalingArgs, Zeros } from './initializers';
/**
 * Initializer that generates tensors initialized to 0.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
export declare function zeros(): Zeros;
/**
 * Initializer that generates tensors initialized to 1.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
export declare function ones(): Initializer;
/**
 * Initializer that generates values initialized to some constant.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
export declare function constant(args: ConstantArgs): Initializer;
/**
 * Initializer that generates random values initialized to a uniform
 * distribution.
 *
 * Values will be distributed uniformly between the configured minval and
 * maxval.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
export declare function randomUniform(args: RandomUniformArgs): Initializer;
/**
 * Initializer that generates random values initialized to a normal
 * distribution.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
export declare function randomNormal(args: RandomNormalArgs): Initializer;
/**
 * Initializer that generates random values initialized to a truncated normal.
 * distribution.
 *
 * These values are similar to values from a `RandomNormal` except that values
 * more than two standard deviations from the mean are discarded and re-drawn.
 * This is the recommended initializer for neural network weights and filters.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
export declare function truncatedNormal(args: TruncatedNormalArgs): Initializer;
/**
 * Initializer that generates the identity matrix.
 * Only use for square 2D matrices.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
export declare function identity(args: IdentityArgs): Initializer;
/**
 * Initializer capable of adapting its scale to the shape of weights.
 * With distribution=NORMAL, samples are drawn from a truncated normal
 * distribution centered on zero, with `stddev = sqrt(scale / n)` where n is:
 *   - number of input units in the weight tensor, if mode = FAN_IN.
 *   - number of output units, if mode = FAN_OUT.
 *   - average of the numbers of input and output units, if mode = FAN_AVG.
 * With distribution=UNIFORM,
 * samples are drawn from a uniform distribution
 * within [-limit, limit], with `limit = sqrt(3 * scale / n)`.
 *
 * @doc {heading: 'Initializers',namespace: 'initializers'}
 */
export declare function varianceScaling(config: VarianceScalingArgs): Initializer;
/**
 * Glorot uniform initializer, also called Xavier uniform initializer.
 * It draws samples from a uniform distribution within [-limit, limit]
 * where `limit` is `sqrt(6 / (fan_in + fan_out))`
 * where `fan_in` is the number of input units in the weight tensor
 * and `fan_out` is the number of output units in the weight tensor
 *
 * Reference:
 *   Glorot & Bengio, AISTATS 2010
 *       http://jmlr.org/proceedings/papers/v9/glorot10a/glorot10a.pdf.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
export declare function glorotUniform(args: SeedOnlyInitializerArgs): Initializer;
/**
 * Glorot normal initializer, also called Xavier normal initializer.
 * It draws samples from a truncated normal distribution centered on 0
 * with `stddev = sqrt(2 / (fan_in + fan_out))`
 * where `fan_in` is the number of input units in the weight tensor
 * and `fan_out` is the number of output units in the weight tensor.
 *
 * Reference:
 *   Glorot & Bengio, AISTATS 2010
 *       http://jmlr.org/proceedings/papers/v9/glorot10a/glorot10a.pdf
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
export declare function glorotNormal(args: SeedOnlyInitializerArgs): Initializer;
/**
 * He normal initializer.
 *
 * It draws samples from a truncated normal distribution centered on 0
 * with `stddev = sqrt(2 / fanIn)`
 * where `fanIn` is the number of input units in the weight tensor.
 *
 * Reference:
 *     He et al., http://arxiv.org/abs/1502.01852
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
export declare function heNormal(args: SeedOnlyInitializerArgs): Initializer;
/**
 * He uniform initializer.
 *
 * It draws samples from a uniform distribution within [-limit, limit]
 * where `limit` is `sqrt(6 / fan_in)`
 * where `fanIn` is the number of input units in the weight tensor.
 *
 * Reference:
 *     He et al., http://arxiv.org/abs/1502.01852
 *
 * @doc {heading: 'Initializers',namespace: 'initializers'}
 */
export declare function heUniform(args: SeedOnlyInitializerArgs): Initializer;
/**
 * LeCun normal initializer.
 *
 * It draws samples from a truncated normal distribution centered on 0
 * with `stddev = sqrt(1 / fanIn)`
 * where `fanIn` is the number of input units in the weight tensor.
 *
 * References:
 *   [Self-Normalizing Neural Networks](https://arxiv.org/abs/1706.02515)
 *   [Efficient Backprop](http://yann.lecun.com/exdb/publis/pdf/lecun-98b.pdf)
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
export declare function leCunNormal(args: SeedOnlyInitializerArgs): Initializer;
/**
 * LeCun uniform initializer.
 *
 * It draws samples from a uniform distribution in the interval
 * `[-limit, limit]` with `limit = sqrt(3 / fanIn)`,
 * where `fanIn` is the number of input units in the weight tensor.
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
export declare function leCunUniform(args: SeedOnlyInitializerArgs): Initializer;
/**
 * Initializer that generates a random orthogonal matrix.
 *
 * Reference:
 * [Saxe et al., http://arxiv.org/abs/1312.6120](http://arxiv.org/abs/1312.6120)
 *
 * @doc {heading: 'Initializers', namespace: 'initializers'}
 */
export declare function orthogonal(args: OrthogonalArgs): Initializer;
