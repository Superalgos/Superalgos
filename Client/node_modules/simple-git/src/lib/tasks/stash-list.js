"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stashListTask = void 0;
const parse_list_log_summary_1 = require("../parsers/parse-list-log-summary");
const log_1 = require("./log");
function stashListTask(opt = {}, customArgs) {
    const options = log_1.parseLogOptions(opt);
    const parser = parse_list_log_summary_1.createListLogSummaryParser(options.splitter, options.fields);
    return {
        commands: ['stash', 'list', ...options.commands, ...customArgs],
        format: 'utf-8',
        parser,
    };
}
exports.stashListTask = stashListTask;
//# sourceMappingURL=stash-list.js.map