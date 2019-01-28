import logger from '../config/logger'
import { toPlatformDatetime } from '../config/utils'

const downloadBlob = async (containerName, blobName) => {
  logger.debug('downloadBlob -> About to get a file: %s%s', containerName, blobName)
  return new Promise((resolve, reject) => {
      blobService.getBlobToText(containerName, blobName, (err, data) => {
          if (err) {
              reject(err);
          } else {
              resolve(data);
          }
      });
  });
};

export default downloadBlob
