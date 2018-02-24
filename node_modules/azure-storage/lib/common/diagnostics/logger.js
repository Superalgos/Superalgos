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

/**
* Creates a new Logger object
* @class
* The Logger class is used to write log information.
* 
* @constructor
*
* @param {string} [level]           The log level. Refer to Logger.LogLevels.
* @param {object} [loggerFunction]  The function to write log information.
*/
function Logger(level, loggerFunction) {
  /**
   * The log level. Refer to the Logger.LogLevels for available log levels. 
   * @name  Logger#level
   * @type  {string}
   * @see Logger.LogLevels
   */
  this.level = level;
  
  this.loggerFunction = loggerFunction;

  if (!this.loggerFunction) {
    this.loggerFunction = this.defaultLoggerFunction;
  }
}

/**
* The available log levels.
*
* @const
* @enum {string}
*/
Logger.LogLevels = {
  /**
  * System is unusable.
  */
  EMERGENCY: 'emergency',

  /**
  * Action must be taken immediately.
  */
  ALERT : 'alert',

  /**
  * Critical condition.
  */
  CRITICAL : 'critical',

  /**
  * Error condition.
  */
  ERROR : 'error',

  /**
  * Warning condition.
  */
  WARNING : 'warning',

  /**
  * Normal but significant condition.
  */
  NOTICE : 'notice',

  /**
  * Purely informational message.
  */
  INFO : 'info',

  /**
  * Application debug messages.
  */
  DEBUG : 'debug'
};

Logger.logPriority = [
  Logger.LogLevels.EMERGENCY,
  Logger.LogLevels.ALERT,
  Logger.LogLevels.CRITICAL,
  Logger.LogLevels.ERROR,
  Logger.LogLevels.WARNING,
  Logger.LogLevels.NOTICE,
  Logger.LogLevels.INFO,
  Logger.LogLevels.DEBUG
];

Logger.prototype.log = function (level, msg) {
  this.loggerFunction(level, msg);
};

Logger.prototype.emergency = function(msg) {
  this.log(Logger.LogLevels.EMERGENCY, msg);
};

Logger.prototype.critical = function(msg) {
  this.log(Logger.LogLevels.CRITICAL, msg);
};

Logger.prototype.alert = function(msg) {
  this.log(Logger.LogLevels.ALERT, msg);
};

Logger.prototype.error = function(msg) {
  this.log(Logger.LogLevels.ERROR, msg);
};

Logger.prototype.warn = function(msg) {
  this.log(Logger.LogLevels.WARNING, msg);
};

Logger.prototype.notice = function(msg) {
  this.log(Logger.LogLevels.NOTICE, msg);
};

Logger.prototype.info = function(msg) {
  this.log(Logger.LogLevels.INFO, msg);
};

Logger.prototype.debug = function(msg) {
  this.log(Logger.LogLevels.DEBUG, msg);
};

Logger.prototype.defaultLoggerFunction = function(logLevel , msg) {
  var currentLevelIndex = Logger.logPriority.indexOf(this.level);
  var logLevelIndex = Logger.logPriority.indexOf(logLevel);
  var time = new Date();
  var timeStamp = time.toISOString();
  if (logLevelIndex <= currentLevelIndex) {
    console.log('[' + timeStamp + ']' + this.level + ' : ' + msg);
  }
};

module.exports = Logger;
