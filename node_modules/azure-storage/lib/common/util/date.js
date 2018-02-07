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
* Date/time related helper functions
* @module date
* 
*/

/**
* Generates a Date object which is in the given days from now.
* 
* @param {int} days The days timespan.
* @return {Date}
*/
exports.daysFromNow = function (days) {
  var date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
* Generates a Date object which is in the given hours from now.
*
* @param {int} hours The hours timespan.
* @return {Date}
*/
exports.hoursFromNow = function (hours) {
  var date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
};

/**
* Generates a Date object which is in the given minutes from now.
*
* @param {int} minutes The minutes timespan.
* @return {Date}
*/
exports.minutesFromNow = function (minutes) {
  var date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date;
};

/**
* Generates a Date object which is in the given seconds from now.
*
* @param {int} seconds The seconds timespan.
* @return {Date}
*/
exports.secondsFromNow = function (seconds) {
  var date = new Date();
  date.setSeconds(date.getSeconds() + seconds);
  return date;
};