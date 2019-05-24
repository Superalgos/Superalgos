import logger from '../../utils/logger'
import {
  Aborter,
  BlobURL,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  StorageURL,
  SharedKeyCredential,
  AnonymousCredential
} from '@azure/storage-blob'

const AzureServiceURL = () => {
  // Use SharedKeyCredential with storage account and account key
  const sharedKeyCredential = new SharedKeyCredential(process.env.STORAGE_BASE_URL, process.env.STORAGE_CONNECTION_STRING);

  // Use sharedKeyCredential, tokenCredential or anonymousCredential to create a pipeline
  const pipeline = StorageURL.newPipeline(sharedKeyCredential, {
    retryOptions: { maxTries: 10 }
  });

  // List containers
  const serviceURL = new ServiceURL(
    // When using AnonymousCredential, following url should include a valid SAS or support public access
    `https://${process.env.STORAGE_BASE_URL}.blob.core.windows.net`,
    pipeline
  )
  return serviceURL
}

const serviceURL = AzureServiceURL()

export const getFileContentRemote = async (containerName, blobName, storage, accessKey) => {
  const pipeline = StorageURL.newPipeline(new AnonymousCredential(), {
    retryOptions: { maxTries: 10 }
  });
  const serviceURLWithAccessKey = new ServiceURL(
    `${storage}${accessKey}`,
    pipeline
  );
  const containerURL = ContainerURL.fromServiceURL(serviceURLWithAccessKey, containerName)
  const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, blobName)
  let downloadResponse = await blockBlobURL.download(Aborter.none, 0)
  return await streamToString(downloadResponse.readableStreamBody)
}

export const getFileContent = async (containerName, blobName) => {
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName)
  const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, blobName)
  let downloadResponse = await blockBlobURL.download(Aborter.none, 0)
  return await streamToString(downloadResponse.readableStreamBody)
}

export const writeFileContent = async (containerName, blobName, content) => {
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName)
  const blobURL = BlobURL.fromContainerURL(containerURL, blobName)
  const blockBlobURL = BlockBlobURL.fromBlobURL(blobURL)
  await blockBlobURL.upload(
    Aborter.none,
    content,
    content.length
  )
}

export const deleteBlob = async (containerName, blobName) => {
  try {
    const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName)
    const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, blobName)
    await blockBlobURL.delete(Aborter.none)
  } catch (err) {
    logger.warn('Error deleting the file: %s%s', containerName, blobName)
  }
}

export const deleteContainer = async (containerName) => {
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName)
  await containerURL.delete(Aborter.none)
  logger.debug('deleteContainer -> Successful.')
}

export const createContainer = async (containerName) => {
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName)
  await containerURL.create(Aborter.none)
  logger.debug('createContainer -> Successful.')
}

// A helper method used to read a Node.js readable stream into string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', data => {
      chunks.push(data.toString());
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject)
  });
}

export const createPrivateAccessKey = (container, type, days) => {
  let azure = require('azure-storage');
  let blobService = azure.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);

  let startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);

  let expiryDate = new Date(startDate);
  expiryDate.setDate(startDate.getDate() + days);

  let azurePermissions;

  switch (type) {
    case 'READ': {
      azurePermissions = azure.BlobUtilities.SharedAccessPermissions.READ;
      break;
    }
    case 'WRITE': {
      azurePermissions = azure.BlobUtilities.SharedAccessPermissions.WRITE;
      break;
    }
    case 'DELETE': {
      azurePermissions = azure.BlobUtilities.SharedAccessPermissions.DELETE;
      break;
    }
  }

  let blobName = undefined;

  let sharedAccessPolicy = {
    AccessPolicy: {
      Permissions: azurePermissions,
      Start: startDate,
      Expiry: expiryDate
    }
  };

  return blobService.generateSharedAccessSignature(container, blobName, sharedAccessPolicy);
}
