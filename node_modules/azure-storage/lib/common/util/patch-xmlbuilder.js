// 
// Copyright (c) Microsoft and contributors.  All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// 
// See the License for the specific language governing permissions and
// limitations under the License.
// 

'use strict';

var XMLBuilder = require('xmlbuilder/lib/XMLBuilder');

// Patch xmlbuilder to allow Unicode surrogate pair code
// points in XML bodies

XMLBuilder.prototype.assertLegalChar = function(str) {
  var chars, chr;
  chars = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uFFFE-\uFFFF]/;
  chr = str.match(chars);
  if (chr) {
    throw new Error('Invalid character (' + chr + ') in string: ' + str);
  }
};