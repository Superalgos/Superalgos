// The MIT License (MIT)
//
// Copyright (c) 2016 Yang Xia
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'use strict';

var util = require('util');
var JsonParser = require('jsonparse');

exports = module.exports;
util.inherits(Parser, JsonParser);

/**
* Parser Instructor
*/
function Parser() {
  this.internalParser = new JsonParser();
  this.originalOnToken = this.internalParser.onToken;
  this.internalParser.onToken = onToken.bind(this);
  return this.internalParser;
}

/**
* Handles the EDM types in the JSON object
*   1. Number will be treated as Edm.Int32 by default
*   2. Literal value 1.0 will be treated as Edm.Double
*   3. Others will be handled according to the literal value
*/
var onToken = function (token, value) {
  var self = this;
  var emitString = false;
  function additionalEmit(additionalKey, additionalValue) {
    var oldKey = self.internalParser.key;
    self.internalParser.key = additionalKey;
    self.internalParser.onValue(additionalValue);
    self.internalParser.key = oldKey;
  }

  if (token === JsonParser.C.STRING ||
  token === JsonParser.C.NUMBER ||
  token === JsonParser.C.TRUE ||
  token === JsonParser.C.FALSE ||
  token === JsonParser.C.NULL) {
    // Parser will emit value in these cases
    if (typeof value === 'number' && 
    this.internalParser.string.indexOf('.') != -1 && 
    parseInt(this.internalParser.string) === value &&
    this.internalParser.mode !== JsonParser.C.ARRAY) {
      var typeKey = this.internalParser.key + '@odata.type';
      if (this.internalParser.value) {
        this.internalParser.value[typeKey] = 'Edm.Double';
      }
      additionalEmit(typeKey, 'Edm.Double');
      
      // Determine whether return raw string to avoid losing precision
      emitString = this.internalParser.string !== value.toString();
    }
  }
  if (emitString) {
    this.originalOnToken.call(this.internalParser, token, this.internalParser.string);
  } else {
    this.originalOnToken.call(this.internalParser, token, value);
  }
};

Parser.C = JsonParser.C;
module.exports = Parser;