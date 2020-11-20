const Azure = require("@azure/storage-blob")
const azureAccount = process.env.AZURE_STORAGE_ACCOUNT
const azureKey = process.env.AZURE_STORAGE_ACCESS_KEY
const azureStorageUrl = process.env.AZURE_STORAGE_URL

/* Create Azure Storage pipeline
* @accountName: Azure Blob Storage account name (required) - Environment variable
* @accountKey: Azure Blob Storage storage key (required) - Environment variable
*/
const createStoragePipline = async (accountName, accountKey) => {
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

const createSASQueryURL = async (containerName) => {
  let today = new Date()
  let week = new Date()
  week.setDate(today.getDate() + 7)
  // Create SharedKeyCredential and attach to pipline
  const SKC = new Azure.SharedKeyCredential(azureAccount, azureKey)
  const pipeline = Azure.StorageURL.newPipeline(SKC)
  // Create container URL
  const serviceURL = new Azure.ServiceURL(azureStorageUrl, pipeline)
  const containerURL = Azure.ContainerURL.fromServiceURL(serviceURL, containerName)

  //list container and check if already exists.
  let marker
  let containerCheck = null
  do {
    const listContainersResponse = await serviceURL.listContainersSegment(
      Azure.Aborter.None,
      marker,
    )
    // console.log(`ContainerCheck marker: `, listContainersResponse)
    marker = listContainersResponse.marker;
    for (const container of listContainersResponse.containerItems) {
      console.log(`ContainerCheck: ${container.name} | ${containerName} | ${marker}`)
      if(container.name === containerName){
        containerCheck = container.name
      }
    }
  } while (marker)

  // if container doesn't exist, create one
  let newContainer
  if(containerCheck === null){
    newContainer = await containerURL.create(Azure.Aborter.None, { access: 'blob' })
  }
  console.log('createSASQueryURL container: ', containerURL, containerCheck, newContainer)

  // Set permissions for service, resource types and containers
  const SASContainerPerms = await Azure.AccountSASPermissions.parse('rwlacu')
  const SASServicePerms = await Azure.AccountSASServices.parse('b')
  const SASResourceTypes = await Azure.AccountSASResourceTypes.parse('co')
  console.log('createSASQueryURL permissions: ', SASServicePerms, SASResourceTypes, SASContainerPerms)
  // Generate SAS url
  const SASQueryParameters = await Azure.generateBlobSASQueryParameters(
    {
      version: '2017-11-09',
      protocol: 'https,http',
      expiryTime: week,
      permissions: 'rwlac',
      containerName: containerName
    }, SKC )
    console.log('createSASQueryURL SASQueryParameters: ', containerURL.url, SASQueryParameters)
  return SASQueryParameters
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
  deleteContainer,
  createSASQueryURL
}
