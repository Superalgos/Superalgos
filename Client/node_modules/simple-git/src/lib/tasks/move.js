"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveTask = void 0;
const parse_move_1 = require("../parsers/parse-move");
const utils_1 = require("../utils");
function moveTask(from, to) {
    return {
        commands: ['mv', '-v', ...utils_1.asArray(from), to],
        format: 'utf-8',
        parser: parse_move_1.parseMoveResult,
    };
}
exports.moveTask = moveTask;
//# sourceMappingURL=move.js.map