Note: This is the change log file for Azure Storage JavaScript Client Library.

2018.02 Version 0.2.8-preview.14

* Generated browser compatible JavaScript files based on Microsoft Azure Storage SDK for Node.js 2.8.0.

2017.12 Version 0.2.7-preview.13

* Generated browser compatible JavaScript files based on Microsoft Azure Storage SDK for Node.js 2.7.0.

2017.10 Version 0.2.6-preview.12

* Generated browser compatible JavaScript files based on Microsoft Azure Storage SDK for Node.js 2.6.0.

2017.09 Version 0.2.5-preview.11

* Generated browser compatible JavaScript files based on Microsoft Azure Storage SDK for Node.js 2.5.0.

2017.08 Version 0.2.4-preview.10

* Generated browser compatible JavaScript files based on Microsoft Azure Storage SDK for Node.js 2.4.0.

2017.08 Version 0.2.3-preview.9

* Generated browser compatible JavaScript files based on Microsoft Azure Storage SDK for Node.js 2.3.0.

2017.08 Version 0.2.2-preview.8

* Generated browser compatible JavaScript files based on Microsoft Azure Storage SDK for Node.js 2.2.2.

2017.07 Version 0.2.2-preview.7

* Added browser specific APIs for blobs and files uploading.
    * `BlobService.createBlockBlobFromBrowserFile`
    * `BlobService.createPageBlobFromBrowserFile`
    * `BlobService.createAppendBlobFromBrowserFile`
    * `BlobService.appendFromBrowserFile`
    * `FileService.createFileFromBrowserFile`
* Updated samples with above new added APIs.
* Dropped dependency to browserify-fs.

2017.07 Version 0.2.2-preview.6

* Generated browser compatible JavaScript files based on Microsoft Azure Storage SDK for Node.js 2.2.1.

2017.06 Version 0.2.2-preview.5

* Generated browser compatible JavaScript files based on Microsoft Azure Storage SDK for Node.js 2.2.0.

2017.05 Version 0.2.1-preview.4

* Reduced footprint of the generated JavaScript files.
* Removed 7 local-file related APIs which are limited by browser's sandbox.

2017.03 Version 0.2.1-preview.3

* Fixed missing 100% upload progress issue in blob sample for uploading blobs smaller than 32MB.
* Added speedSummary code example in the blob & file samples.

2017.03 Version 0.2.1-preview.2

* Generated browser compatible JavaScript files based on Microsoft Azure Storage SDK for Node.js 2.1.0.

2017.03 Version 0.2.0-preview.1

* Generated browser compatible JavaScript files based on Microsoft Azure Storage SDK for Node.js 2.0.0.
* Added bundle scripts to generate Azure Storage JavaScript Client Library.
* Added npm command `npm run genjs` to generate JavaScript Client Library.
* Added samples for Azure Storage JavaScript Client Library.