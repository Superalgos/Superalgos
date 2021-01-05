"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTask = void 0;
const parse_fetch_1 = require("../parsers/parse-fetch");
function fetchTask(remote, branch, customArgs) {
    const commands = ['fetch', ...customArgs];
    if (remote && branch) {
        commands.push(remote, branch);
    }
    return {
        commands,
        format: 'utf-8',
        parser: parse_fetch_1.parseFetchResult,
    };
}
exports.fetchTask = fetchTask;
//# sourceMappingURL=fetch.js.map