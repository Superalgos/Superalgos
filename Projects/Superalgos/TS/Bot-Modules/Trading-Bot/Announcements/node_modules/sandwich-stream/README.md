# SandwichStream

[![npm](https://img.shields.io/npm/v/sandwich-stream.svg?style=flat-square)](https://www.npmjs.com/package/sandwich-stream)
[![npm](https://img.shields.io/npm/dt/sandwich-stream.svg?style=flat-square)](https://www.npmjs.com/package/sandwich-stream)
[![Travis CI](https://img.shields.io/travis/connrs/node-sandwich-stream.svg?style=flat-square)](https://travis-ci.org/connrs/node-sandwich-stream)
[![codecov](https://img.shields.io/codecov/c/github/connrs/node-sandwich-stream.svg?style=flat-square)](https://codecov.io/gh/connrs/node-sandwich-stream)
[![Codacy Badge](https://img.shields.io/codacy/grade/6d64b00364bf413980280bd4e55d6115.svg?style=flat-square)](https://www.codacy.com/project/connrs/node-sandwich-stream/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=connrs/node-sandwich-stream&amp;utm_campaign=Badge_Grade_Dashboard)
[![Dependencies](https://david-dm.org/connrs/node-sandwich-stream.svg?style=flat-square)](https://codeclimate.com/github/connrs/node-sandwich-stream/master/package.json)
[![Known Vulnerabilities](https://snyk.io/test/github/connrs/node-sandwich-stream/badge.svg?style=flat-square&targetFile=package.json)](https://snyk.io/test/github/connrs/node-sandwich-stream?targetFile=package.json)
[![Maintainability](https://api.codeclimate.com/v1/badges/a6a00d50601938edfdad/maintainability)](https://codeclimate.com/github/connrs/node-sandwich-stream/maintainability)

## About
While I'm not overjoyed about how performant the internals will operate, I wanted a readable stream that was ACTUALLY A READABLE STREAM. Not a streams1 stream masquerading as streams2. As soon as somebody writes a better concat stream as a readable stream with a nice simple API, this baby is going to develop some serious abandonment issues.

## Installation
```bash
npm install sandwich-stream --save
```

**note**: this code was made using it [TypeScript](https://www.typescriptlang.org/), and its typings are linked in [package.json](./package.json), so there's no need of installing _@types/sandwich-stream_ or anything related. 

## Usage
```typescript
import { SandwichStream } from 'sandwich-stream';
// OR EVEN:
// const SandwichStream = require('sandwich-stream');

const sandwich = SandwichStream({
    head: 'Thing at the top\n',
    tail: '\nThing at the bottom',
    separator: '\n ---- \n'
});

sandwich.add(aStreamIPreparedEarlier)
        .add(anotherStreamIPreparedEarlier)
        .add(aFurtherStreamIPreparedEarlier)
        .pipe(process.stdout);

// The thing at the top
//  ---- 
// Stream1
//  ---- 
// Stream2
//  ---- 
// Stream3
// The thing at the bottom
```
## Configuration Options
* `head` option takes a string/buffer and pushes the string before all other content
* `foot` option takes a string/buffer and pushes the string after all other data has been pushed
* `separator` option pushes a string/buffer between each stream
* [Readable Options](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/be662c475da091788139b486a55708f02e2880b6/types/node/index.d.ts#L6485) can also be passed through.

## API
Too add a stream use the **.add** method: `sandwich.add(streamVariable);`

## More
Wanna known more about Node Streams? Read [this](https://medium.freecodecamp.org/node-js-streams-everything-you-need-to-know-c9141306be93).
