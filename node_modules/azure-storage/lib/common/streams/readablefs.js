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

var rs = require('readable-stream').Readable;
var fs = require('fs');

/*
* As far as streams support goes, we can get the node 0.10 stream API in node 0.8. 
* Use the readable-stream module (https://www.npmjs.org/package/readable-stream) which is 
* essentially a copy of the stream modules from core node 0.10 and it just works on both 0.8 and 0.10. 
*/

exports.createReadStream = function(path, options) {
  var stream = fs.createReadStream(path, options);
  if (/^v0\.8\./.test(process.version)) {
    stream = rs().wrap(stream);
  }
  return stream;
};