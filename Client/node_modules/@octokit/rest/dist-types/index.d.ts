import { Octokit as Core } from "@octokit/core";
export { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";
export declare const Octokit: (new (...args: any[]) => {
    [x: string]: any;
}) & {
    new (...args: any[]): {
        [x: string]: any;
    };
    plugins: any[];
} & typeof Core & import("@octokit/core/dist-types/types").Constructor<void & {
    paginate: import("@octokit/plugin-paginate-rest").PaginateInterface;
} & import("@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types").RestEndpointMethods>;
export declare type Octokit = InstanceType<typeof Octokit>;
