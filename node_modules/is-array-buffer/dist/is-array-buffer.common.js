/*!
 * isArrayBuffer v1.0.0
 * https://github.com/fengyuanchen/is-array-buffer
 *
 * Copyright (c) 2015-2017 Chen Fengyuan
 * Released under the MIT license
 *
 * Date: 2017-07-26T11:00:44.931Z
 */

'use strict';

var hasArrayBuffer = typeof ArrayBuffer === 'function';
var toString = Object.prototype.toString;

/**
 * Check if the given value is an ArrayBuffer.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given is an ArrayBuffer, else `false`.
 * @example
 * isArrayBuffer(new ArrayBuffer())
 * // => true
 * isArrayBuffer(new Array())
 * // => false
 */
function isArrayBuffer(value) {
  return hasArrayBuffer && (value instanceof ArrayBuffer || toString.call(value) === '[object ArrayBuffer]');
}

module.exports = isArrayBuffer;
