"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffSummaryTask = void 0;
const parse_diff_summary_1 = require("../parsers/parse-diff-summary");
function diffSummaryTask(customArgs) {
    return {
        commands: ['diff', '--stat=4096', ...customArgs],
        format: 'utf-8',
        parser(stdOut) {
            return parse_diff_summary_1.parseDiffResult(stdOut);
        }
    };
}
exports.diffSummaryTask = diffSummaryTask;
//# sourceMappingURL=diff.js.map