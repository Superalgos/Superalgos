/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
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
import { Tensor3D } from '@tensorflow/tfjs-core';
import { WebcamConfig } from '../types';
import { LazyIterator } from './lazy_iterator';
/**
 * Provide a stream of image tensors from webcam video stream. Only works in
 * browser environment.
 */
export declare class WebcamIterator extends LazyIterator<Tensor3D> {
    protected readonly webcamVideoElement: HTMLVideoElement;
    protected readonly webcamConfig: WebcamConfig;
    private isClosed;
    private stream;
    private resize;
    private cropSize;
    private cropBox;
    private cropBoxInd;
    private constructor();
    summary(): string;
    static create(webcamVideoElement?: HTMLVideoElement, webcamConfig?: WebcamConfig): Promise<WebcamIterator>;
    start(): Promise<void>;
    next(): Promise<IteratorResult<Tensor3D>>;
    private needToResize;
    cropAndResizeFrame(img: Tensor3D): Tensor3D;
    capture(): Promise<Tensor3D>;
    stop(): void;
    toArray(): Promise<Tensor3D[]>;
}
