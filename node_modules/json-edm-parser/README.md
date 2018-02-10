# json-edm-parser
[![Build Status](https://travis-ci.org/yaxia/json-edm-parser.svg?branch=master)](https://travis-ci.org/yaxia/json-edm-parser)

This is a JSON streaming parser for node.js. It will handle the Entity Data Model (EDM) types to be compatitable with odata.

When you use JSON to represent an odata entity, a number without a decimal point in the JSON will have Edm.Int32 by default and 
will have Edm.Double if there are non-zero digits after the decimal point. However, if the value is set to *.0, 
Most JSON parsers will take it as an integer. To keep the type information, this parser will add an additional member "<property>@odata.type": "Edm.Double" 
to the object.

## Install

```shell
npm install json-edm-parser
```

## Usage

```Javascript
var Parser = require('json-edm-parser');

var p = new Parser();
p.write('{ "doubleIntNumber": 12.00,');
p.write('"doubleNormalNumber": 1.2,');
p.write('"doubleLargeNumber": 12345678901234546789.0000000000000000000000000001,');
p.write('"int64LargeNumber": 12345678901234567890123456789}');

/*
* You will get 
*  { 'doubleIntNumber@odata.type': 'Edm.Double',
*    doubleIntNumber: '12.00',
*    doubleNormalNumber: 1.2,
*    'doubleLargeNumber@odata.type': 'Edm.Double',
*    doubleLargeNumber: '12345678901234546789.0000000000000000000000000001',
*    int64LargeNumber: '12345678901234567890123456789' }
*/
p.onValue = function (value) {
  // Deal with the value
};
```