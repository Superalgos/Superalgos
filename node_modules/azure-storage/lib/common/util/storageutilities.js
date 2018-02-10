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

// Expose 'StorageUtilities'.

/**
* Defines constants, enums, and utility functions for use with storage.
* @namespace
*/
var StorageUtilities = {
	/**
  * Specifies the location mode used to decide which location the request should be sent to.
  *
  * @const
  * @enum {number}
  */
  LocationMode: {
    /** The primary location only */
    PRIMARY_ONLY: 0,
    /** The primary location first, then the secondary */
    PRIMARY_THEN_SECONDARY: 1,
    /** The secondary location only */
    SECONDARY_ONLY: 2,
    /** The secondary location first, then the primary */
    SECONDARY_THEN_PRIMARY: 3
  }
};

module.exports = StorageUtilities;