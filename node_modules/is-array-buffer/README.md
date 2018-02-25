# is-array-buffer

> Check if the given value is an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

## Main

```txt
dist/
├── is-array-buffer.js        (UMD)
├── is-array-buffer.min.js    (UMD, compressed)
├── is-array-buffer.common.js (CommonJS, default)
└── is-array-buffer.esm.js    (ES Module)
```

## Install

```sh
npm install --save is-array-buffer
```

## Usage

```js
import isArrayBuffer from 'is-array-buffer';

isArrayBuffer(new ArrayBuffer());
// => true

isArrayBuffer(new Array());
// => false
```

## License

[MIT](http://opensource.org/licenses/MIT) © [Chen Fengyuan](http://chenfengyuan.com)
