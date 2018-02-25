const hasArrayBuffer = typeof ArrayBuffer === 'function';
const toString = Object.prototype.toString;

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
export default function isArrayBuffer(value) {
  return hasArrayBuffer && (value instanceof ArrayBuffer || toString.call(value) === '[object ArrayBuffer]');
}
