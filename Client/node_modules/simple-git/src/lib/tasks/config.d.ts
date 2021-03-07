import { ConfigListSummary } from '../../../typings';
import { StringTask } from '../types';
export declare function addConfigTask(key: string, value: string, append?: boolean): StringTask<string>;
export declare function listConfigTask(): StringTask<ConfigListSummary>;
