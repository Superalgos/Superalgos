# Azure Storage JavaScript Client Library for Browsers

* Join the community discussion on Slack! [![Slack](https://azurestorageslack.azurewebsites.net/badge.svg)]( https://azurestorageslack.azurewebsites.net) 

## Downloading

It's recommended to use the Azure Storage JavaScript Client Library provided by us. Please [download the latest library](https://aka.ms/downloadazurestoragejs).

There are 8 generated JavaScript files for Azure Storage JavaScript Client Library:
- `azure-storage.blob.js` and `azure-storage.blob.min.js` contain the Azure Storage blob service operation logic
- `azure-storage.table.js` and `azure-storage.table.min.js` contain the Azure Storage table service operation logic
- `azure-storage.queue.js` and `azure-storage.queue.min.js` contain the Azure Storage queue service operation logic
- `azure-storage.file.js` and `azure-storage.file.min.js` contain the Azure Storage file service operation logic

We also provide samples to guide you quickly start with the Azure Storage JavaScript Client Library. In the [JavaScript Client Library zip file](https://aka.ms/downloadazurestoragejs) or following online links, you will find 4 HTML samples:
- [sample-blob.html](https://dmrelease.blob.core.windows.net/azurestoragejssample/samples/sample-blob.html) demonstrates how to operate with Azure Storage blob service in the browser
- [sample-table.html](https://dmrelease.blob.core.windows.net/azurestoragejssample/samples/sample-table.html) demonstrates how to operate with Azure Storage table service in the browser
- [sample-queue.html](https://dmrelease.blob.core.windows.net/azurestoragejssample/samples/sample-queue.html) demonstrates how to operate with Azure Storage queue service in the browser
- [sample-file.html](https://dmrelease.blob.core.windows.net/azurestoragejssample/samples/sample-file.html) demonstrates how to operate with Azure Storage file service in the browser

After generating the JavaScript Client Library, you can try the samples in browsers such as Chrome/Edge/Firefox directly.

**Note**: An HTTP server should be set to host the samples for IE11 and Chrome (56 or newer versions).

Or you can directly try with following online samples:
- [sample-blob](https://dmrelease.blob.core.windows.net/azurestoragejssample/samples/sample-blob.html)
- [sample-table](https://dmrelease.blob.core.windows.net/azurestoragejssample/samples/sample-table.html)
- [sample-queue](https://dmrelease.blob.core.windows.net/azurestoragejssample/samples/sample-queue.html)
- [sample-file](https://dmrelease.blob.core.windows.net/azurestoragejssample/samples/sample-file.html)

## Module Support

Above JavaScript files are all [UMD compatible](https://github.com/umdjs/umd). You can load them in a CommonJS or AMD environment by JavaScript module loaders. If no module system is found, following global variables will be set:
- `AzureStorage.Blob`
- `AzureStorage.Table`
- `AzureStorage.Queue`
- `AzureStorage.File`

## Compatibility

Compatibility with mobile browsers have not been fully validated, please open issues when you get errors.

# Running Tests against Browsers

Running tests against Chrome by default. The Storage Account should be configured with CORS support before running test. Please see above online samples about how to configure CORS rules for an account.

```
set AZURE_STORAGE_CONNECTION_STRING="valid storage connection string"
npm install
npm run jstest
```

## Generating a Custom Azure Storage JavaScript Client Library

If you wish to customize the library and generate the Azure Storage JavaScript Client Library, you can follow the following steps.

We provide browserify bundle scripts which generate Azure Storage JavaScript Client Library. The bundle script reduces the size of the Storage Client Library by splitting into smaller files, one per storage service. 

The generated JavaScript Client Library includes 8 separated JavaScript files:
- `azure-storage.blob.js`
- `azure-storage.table.js`
- `azure-storage.queue.js`
- `azure-storage.file.js`
- `azure-storage.blob.min.js`
- `azure-storage.table.min.js`
- `azure-storage.queue.min.js`
- `azure-storage.file.min.js`

Let's get started to generate the Azure Storage JavaScript Client Library!

### Step 1: Cloning Repo

Azure Storage JavaScript Client Library is generated from Azure Storage SDK for Node.js. Clone `azure-storage-node` repo with following command:

```Batchfile
git clone https://github.com/Azure/azure-storage-node.git
```

### Step 2: Installing Node.js Modules

Change to the root directory of the cloned repo:

```Batchfile
cd azure-storage-node
```

Install the dependent Node.js modules:

```Batchfile
npm install
```

### Step 3: Generating JavaScript Client Library with Bundle Scripts

We provide bundle scripts to help quickly generate the JavaScript Client Library. At the root directory of the cloned repo:

```Batchfile
npm run genjs [VERSION_NUMBER]
```

### Step 4: Finding the Generated JavaScript Files

If everything goes well, the generated JavaScript files should be saved to `azure-storage-node/browser/bundle`. There will be 8 generated JavaScript files totally:
- `azure-storage.blob.js`
- `azure-storage.table.js`
- `azure-storage.queue.js`
- `azure-storage.file.js`
- `azure-storage.blob.min.js`
- `azure-storage.table.min.js`
- `azure-storage.queue.min.js`
- `azure-storage.file.min.js`