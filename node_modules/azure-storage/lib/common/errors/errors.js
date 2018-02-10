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

// Module dependencies.
var util = require('util');
var _ = require('underscore');

function captureStackTrace(targetObject, constructorOpt) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(targetObject, constructorOpt);
  }
}

function ArgumentError(argumentName, message) {
  captureStackTrace(this, this.constructor); 
  this.name = this.constructor.name;
  this.argumentName = argumentName;
  this.message = message || util.format('Invalid or missing argument supplied: %s', argumentName);
}
util.inherits(ArgumentError, Error);

function ArgumentNullError(argumentName, message) {
  captureStackTrace(this, this.constructor); 
  this.name = this.constructor.name;
  this.argumentName = argumentName;
  this.message = message || util.format('Missing argument: %s', argumentName);
}

util.inherits(ArgumentNullError, Error);

function StorageError(message, properties) {
  captureStackTrace(this, this.constructor); 
  this.name = this.constructor.name;
  this.message = message;
  
  if(properties){
    _.extend(this, properties);
  }
}

util.inherits(StorageError, Error);

function TimeoutError(message) {
  captureStackTrace(this, this.constructor); 
  this.name = this.constructor.name;
  this.message = message;
}

util.inherits(TimeoutError, Error);

module.exports.ArgumentError = ArgumentError;
module.exports.ArgumentNullError = ArgumentNullError;
module.exports.StorageError = StorageError;
module.exports.TimeoutError = TimeoutError;
module.exports.captureStackTrace = captureStackTrace;