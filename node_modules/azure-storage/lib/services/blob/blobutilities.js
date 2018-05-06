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

// Expose 'BlobUtilities'.
exports = module.exports;

/**
* Defines constants, enums, and utility functions for use with the Blob service.
* @namespace BlobUtilities
*/
var BlobUtilities = {
  /**
  * Permission types
  *
  * @const
  * @enum {string}
  */
  SharedAccessPermissions: {
    READ: 'r',
    ADD: 'a',
    CREATE: 'c',
    WRITE: 'w',
    DELETE: 'd',
    LIST: 'l'
  },

  /**
  * Blob listing details.
  *
  * @const
  * @enum {string}
  */
  BlobListingDetails: {
    SNAPSHOTS: 'snapshots',
    METADATA: 'metadata',
    UNCOMMITTED_BLOBS: 'uncommittedblobs',
    COPY: 'copy',
    DELETED: 'deleted'
  },

  /**
  * Deletion options for blob snapshots
  *
  * @const
  * @enum {string}
  */
  SnapshotDeleteOptions: {
    SNAPSHOTS_ONLY: 'only',
    BLOB_AND_SNAPSHOTS: 'include'
  },

  /**
  * Type of block list to retrieve
  *
  * @const
  * @enum {string}
  */
  BlockListFilter: {
    ALL: 'all',
    COMMITTED: 'committed',
    UNCOMMITTED: 'uncommitted'
  },

  /**
  * Blobs and container public access types.
  *
  * @const
  * @enum {string}
  */
  BlobContainerPublicAccessType: {
    OFF: null,
    CONTAINER: 'container',
    BLOB: 'blob'
  },

  /**
  * Describes actions that can be performed on a page blob sequence number.
  * @const
  * @enum {string}
  */
  SequenceNumberAction: {
    MAX: 'max',
    UPDATE: 'update',
    INCREMENT: 'increment'
  },

  /**
  * Candidate values for blob tiers.
  *
  * @property {object} PremiumPageBlobTier      Candidate values for premium pageblob tiers.
  * @property {string} PremiumPageBlobTier.P4
  * @property {string} PremiumPageBlobTier.P6
  * @property {string} PremiumPageBlobTier.P10
  * @property {string} PremiumPageBlobTier.P20
  * @property {string} PremiumPageBlobTier.P30
  * @property {string} PremiumPageBlobTier.P40
  * @property {string} PremiumPageBlobTier.P50
  * @property {string} PremiumPageBlobTier.P60
  * @property {object} StandardBlobTier         Candidate values for standard blobs tiers.
  * @property {string} StandardBlobTier.HOT
  * @property {string} StandardBlobTier.COOL
  * @property {string} StandardBlobTier.ARCHIVE
  */
  BlobTier: {
    PremiumPageBlobTier: {
      P4: 'P4',
      P6: 'P6',
      P10: 'P10',
      P20: 'P20',
      P30: 'P30',
      P40: 'P40',
      P50: 'P50',
      P60: 'P60'
    },
    StandardBlobTier: {
      HOT: 'Hot',
      COOL: 'Cool',
      ARCHIVE: 'Archive'
    }
  }
};

module.exports = BlobUtilities;