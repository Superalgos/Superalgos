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

// Expose 'FileUtilities'.
exports = module.exports;

/**
* Defines constants, enums, and utility functions for use with the File service.
* @namespace FileUtilities
*/
var FileUtilities = {
  /**
  * Permission types
  *
  * @const
  * @enum {string}
  */
  SharedAccessPermissions: {
    READ: 'r',
    CREATE: 'c',
    WRITE: 'w',
    DELETE: 'd',
    LIST: 'l'
  },

  /**
  * Listing details.
  *
  * @const
  * @enum {string}
  */
  ListingDetails: {
    METADATA: 'metadata'
  },

  /**
  * File and share public access types.
  *
  * @const
  * @enum {string}
  */
  SharePublicAccessType: {
    OFF: null,
    SHARE: 'share',
    FILE: 'file'
  },

  /**
  * Deletion options for share snapshots
  *
  * @const
  * @enum {string}
  */
  ShareSnapshotDeleteOptions: {
    SHARE_AND_SNAPSHOTS: 'include'
  },
};

module.exports = FileUtilities;