import { Platform } from './platform';
export declare const getNodeFetch: {
    importFetch: () => any;
};
declare type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;
export declare function resetSystemFetch(): void;
export declare function setSystemFetch(fetchFn: FetchFn): void;
export declare function getSystemFetch(): FetchFn;
export declare class PlatformNode implements Platform {
    private textEncoder;
    util: any;
    constructor();
    fetch(path: string, requestInits?: RequestInit): Promise<Response>;
    now(): number;
    encode(text: string, encoding: string): Uint8Array;
    decode(bytes: Uint8Array, encoding: string): string;
}
export {};
