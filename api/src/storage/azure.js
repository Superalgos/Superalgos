const Azure = require('@azure/storage-blob')

/* Create Azure Storage pipeline
* @accountName: Azure Blob Storage account name (required) - Environment variable
* @accountKey: Azure Blob Storage storage key (required) - Environment variable
*/
const createStoragePipline = async (accountNAme, accountKey) => {
  return Azure.StorageURL.newPipeline(
    new Azure.SharedKeyCredential(accountName, accountKey)
  )
}

/* Create Azure Storage Service URL
* @storageURL: URL for Azure Storage endpoint (required) - Environment variable
* @pipeline: Azure Storage Pipline (required) - created using createStoragePipeline()
*/
const createServiceURL = async (storageURL, pipeline) => {
  return new Azure.ServiceURL(
    storageURL,
    pipeline
  )
}

/* List containers
* @pipeline: Azure Storage Pipline (required) - created using createServiceURL
* @service_url: URL for Azure Storage endpoint (required) - Environment variable
*/
const listContainers = async (serviceURL) => {
  let marker;
  do {
    const listContainersResponse = await serviceURL.listContainersSegment(
      Azure.Aborter.None,
      marker,
    );

    marker = listContainersResponse.marker;
    for (const container of listContainersResponse.containerItems) {
      console.log(`Container: ${container.name}`);
    }
  } while (marker);
}


/* Create containers
* @serviceURL: URL for Azure Storage endpoint (required) - created using createServiceURL
* @containerName: Container Name
* Returns: containerURL
*/
const createContainer = async (serviceURL, containerName) => {
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName)

  const createContainerResponse = await containerURL.create(Aborter.None)

  console.log(
    `Created container ${containerName} successfully`,
    await createContainerResponse.requestId
  )
  return containerURL
}

/* Create containers
* @containerURL: continer URL (required) - created using createContainer
* @blobName: Blob Name
* Returns: blobURL
*/
const createBlob = async (containerURL, blobName) => {
  const blobURL = Azure.BlobURL.fromContainerURL(containerURL, blobName)
  console.log(`created blob successfully`, await blobURL)
  return blobURL
}

/* Upload Blob
* @blobURL: blobURL (required) - created using createBlob
* @blobContent: Blob Content
* Returns: uploadBlobResponse
*/
const uploadBlob = async (blobURL, blobContent) => {
  const blockBlobURL = Azure.BlockBlobURL.fromBlobURL(blobURL)
  const uploadBlobResponse = await blockBlobURL.upload(
    Azure.Aborter.None,
    blobContent,
    blobContent.length
  );
  console.log(`Upload block blob ${blobName} successfully`, await uploadBlobResponse)
  return uploadBlobResponse
}

/* Download Blob
* @blobURL: blobURL (required) - created using createBlob
* @blobContent: Blob Content
* Returns: downloadBlockBlobResponse
*/
const downloadBlob = async (blobURL, blobContent) => {
  const downloadBlockBlobResponse = await blobURL.download(Azure.Aborter.None, 0)
  console.log(
    "Downloaded blob content",
    downloadBlockBlobResponse.readableStreamBody.read(content.length).toString()
  )
  console.log(`BlockBlobResponse: ${downloadBlockBlobResponse}`)
  return downloadBlockBlobResponse
}

/* Delete Blob
* @blobURL: blobURL (required) - created using createBlob
* Returns: bool
*/
const deleteBlob = async (blobrURL) => {
  await blobrURL.delete(Azure.Aborter.None);
  console.log("deleted blob", blobrURL);
  return true
}

/* Delete Container
* @containerURL: continer URL (required) - created using createContainer
* Returns: bool
*/
const deleteContainer = async (containerURL) => {
  await containerURL.delete(Azure.Aborter.None);
  console.log("deleted container", containerURL);
  return true
}

module.exports = {
  createStoragePipline,
  createServiceURL,
  listContainers,
  createContainer,
  createBlob,
  uploadBlob,
  downloadBlob,
  deleteBlob,
  deleteContainer
}
