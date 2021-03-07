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
export declare function setupFakeVideoStream(): void;
export declare function replaceHTMLVideoElementSource(videoElement: HTMLVideoElement): Promise<void>;
export declare function describeAllEnvs(testName: string, tests: () => void): void;
export declare function describeBrowserEnvs(testName: string, tests: () => void): void;
export declare function describeNodeEnvs(testName: string, tests: () => void): void;
/**
 * Testing Utilities for browser audeo stream.
 */
export declare function setupFakeAudeoStream(): void;
export declare class FakeAudioContext {
    readonly sampleRate = 44100;
    static createInstance(): FakeAudioContext;
    createMediaStreamSource(): FakeMediaStreamAudioSourceNode;
    createAnalyser(): FakeAnalyser;
    close(): void;
}
export declare class FakeAudioMediaStream {
    constructor();
    getTracks(): Array<{}>;
}
declare class FakeMediaStreamAudioSourceNode {
    constructor();
    connect(node: {}): void;
}
declare class FakeAnalyser {
    fftSize: number;
    smoothingTimeConstant: number;
    private x;
    constructor();
    getFloatFrequencyData(data: Float32Array): void;
    getFloatTimeDomainData(data: Float32Array): void;
    disconnect(): void;
}
export {};
