import logger from '../utils/logger'
const {
  Aborter,
  BlobURL,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  StorageURL,
  SharedKeyCredential
} = require("@azure/storage-blob")

const AzureServiceURL = () => {
  // Enter your storage account name and shared key
  const account = process.env.STORAGE_BASE_URL;
  const accountKey = process.env.STORAGE_CONNECTION_STRING;

  // Use SharedKeyCredential with storage account and account key
  const sharedKeyCredential = new SharedKeyCredential(account, accountKey);

  // Use sharedKeyCredential, tokenCredential or anonymousCredential to create a pipeline
  const pipeline = StorageURL.newPipeline(sharedKeyCredential);

  // List containers
  const serviceURL = new ServiceURL(
    // When using AnonymousCredential, following url should include a valid SAS or support public access
    `https://${account}.blob.core.windows.net`,
    pipeline
  );
  logger.info("Connected to te file Storage.")
  return serviceURL
}

const serviceURL = AzureServiceURL()

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
    readableStream.on("data", data => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject)
  });
}
