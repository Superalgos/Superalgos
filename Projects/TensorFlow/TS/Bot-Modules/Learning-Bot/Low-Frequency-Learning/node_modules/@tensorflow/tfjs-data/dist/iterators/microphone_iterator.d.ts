/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * =============================================================================
 */
import { Tensor, Tensor2D, Tensor3D, TensorContainer } from '@tensorflow/tfjs-core';
import { MicrophoneConfig } from '../types';
import { LazyIterator } from './lazy_iterator';
/**
 * Provide a stream of tensors from microphone audio stream. The tensors are
 * representing audio data as frequency-domain spectrogram generated with
 * browser's native FFT. Tensors representing time-domain waveform is available
 * based on configuration. Only works in browser environment.
 */
export declare class MicrophoneIterator extends LazyIterator<TensorContainer> {
    protected readonly microphoneConfig: MicrophoneConfig;
    private isClosed;
    private stream;
    private readonly fftSize;
    private readonly columnTruncateLength;
    private freqData;
    private timeData;
    private readonly numFrames;
    private analyser;
    private audioContext;
    private sampleRateHz;
    private readonly audioTrackConstraints;
    private readonly smoothingTimeConstant;
    private readonly includeSpectrogram;
    private readonly includeWaveform;
    private constructor();
    summary(): string;
    static create(microphoneConfig?: MicrophoneConfig): Promise<MicrophoneIterator>;
    start(): Promise<void>;
    next(): Promise<IteratorResult<TensorContainer>>;
    capture(): Promise<{
        spectrogram: Tensor3D;
        waveform: Tensor2D;
    }>;
    private getAudioData;
    stop(): void;
    toArray(): Promise<Tensor[]>;
    getSampleRate(): number;
    private flattenQueue;
    private getTensorFromAudioDataArray;
}
