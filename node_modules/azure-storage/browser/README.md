# Azure Storage JavaScript Client Library for Browsers

* Join the community discussion on Slack! [![Slack](https://azurestorageslack.azurewebsites.net/badge.svg)]( https://azurestorageslack.azurewebsites.net) 

There are 5 generated JavaScript files for Azure Storage JavaScript Client Library:
- `azure-storage.common.js` contains the common part for other 4 JavaScript files.
- `azure-storage.table.js` contains the Azure Storage table service operation logic, which depends on azure-storage.common.js
- `azure-storage.blob.js` contains the Azure Storage blob service operation logic, which depends on azure-storage.common.js
- `azure-storage.queue.js` contains the Azure Storage queue service operation logic, which depends on azure-storage.common.js
- `azure-storage.file.js` contains the Azure Storage file service operation logic, which depends on azure-storage.common.js

We also provide samples to guide you quickly start with the Azure Storage JavaScript Client Library. In the [JavaScript Client Library zip file](https://aka.ms/downloadazurestoragejs) or [azure-storage-node/browser/samples](samples), you will find 4 HTML samples:
- `sample-table.html` demonstrates how to operate with Azure Storage table service in the browser
- `sample-blob.html` demonstrates how to operate with Azure Storage blob service in the browser
- `sample-queue.html` demonstrates how to operate with Azure Storage queue service in the browser
- `sample-file.html` demonstrates how to operate with Azure Storage file service in the browser

After generating the JavaScript Client Library, you can try the samples in browsers such as Chrome/Edge/Firefox directly.

**Note**: An HTTP server should be set to host the samples for IE browser.

## Limitations

The Azure Storage JavaScript Client Library is currently in preview stage, there are some known issues or limitations as follows.

### Compatibility

Compatibility with mobile browsers have not been fully validated, please open issues when you get errors. Current validated browsers are as below:

| Chrome     | Firefox  | Internet Explorer  | Microsoft Edge  |
|------------|----------|--------------------|-----------------|
| v64        | v58      | v11                | v41             |

## Generating a Custom Azure Storage JavaScript Client Library

If you wish to customize the library and generate the Azure Storage JavaScript Client Library, you can follow the following steps.

We provide browserify bundle scripts which generate Azure Storage JavaScript Client Library. The bundle script reduces the size of the Storage Client Library by splitting into smaller files, one per storage service and a common shared file. 

The generated JavaScript Client Library includes 5 separated JavaScript files:
- `azure-storage.common.js`
- `azure-storage.table.js`
- `azure-storage.blob.js`
- `azure-storage.queue.js`
- `azure-storage.file.js`

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
npm run genjs
```

### Step 4: Finding the Generated JavaScript Files

If everything goes well, the generated JavaScript files should be saved to `azure-storage-node/browser/bundle`. There will be 5 generated JavaScript files totally:
- `azure-storage.common.js`
- `azure-storage.table.js`
- `azure-storage.blob.js`
- `azure-storage.queue.js`
- `azure-storage.file.js`

### Step 5: JavaScript Files Minify

You are able to minify the generated JavaScript files with your favorite minify tools. Here we show the minify process with Node.js minify tool [uglifyJS](https://github.com/mishoo/UglifyJS2).

Install uglifyJS:

```Batchfile
npm install -g uglify-js
``` 

Minify the JavaScript files:

```Batchfile
uglifyjs --compress --mangle -- azure-storage.common.js > azure-storage.common.min.js
uglifyjs --compress --mangle -- azure-storage.table.js > azure-storage.table.min.js
uglifyjs --compress --mangle -- azure-storage.blob.js > azure-storage.blob.min.js
uglifyjs --compress --mangle -- azure-storage.queue.js > azure-storage.queue.min.js
uglifyjs --compress --mangle -- azure-storage.file.js > azure-storage.file.min.js
```