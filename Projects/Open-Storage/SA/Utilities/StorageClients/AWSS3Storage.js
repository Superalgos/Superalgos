exports.newOpenStorageUtilitiesAWSS3Storage = function newOpenStorageUtilitiesAWSS3Storage() {

    let thisObject = {
        saveFile: saveFile,
        loadFile: loadFile,
        removeFile: removeFile
    }

    /** 
     * @type {import { S3Client } from "@aws-sdk/client-s3";} 
     */
    let _client = undefined;

    return thisObject

    async function saveFile(fileName, filePath, fileContent, storageContainer) {
        /**@type {ApiSecret} */
        const secret = SA.secrets.apisSecrets.map.get(storageContainer.config.codeName)
        const s3Client = getClient(secret, storageContainer)
        const { PutObjectCommand } = SA.nodeModules.awsS3
        let key = filePath + '/' + fileName + '.json'
        if(storageContainer.config.pathPrefix !== undefined && storageContainer.config.pathPrefix.length > 0) {
            let prefix = storageContainer.config.pathPrefix
            if(prefix.endsWith('/')) {
                key = prefix + key
            }
            else {
                key = prefix + '/' + key
            }
        } 
        await s3Client.send(new PutObjectCommand({
            bucket: storageContainer.config.bucketName,
            key,
            body: new Buffer.from(fileContent, 'utf-8').toString('base64'),
        })).then(() => {
            SA.logger.info('File just created on AWS S3. completePath = ' + key)
        })
    }

    async function loadFile(fileName, filePath, storageContainer) {

        const completePath = filePath + '/' + fileName + '.json'
        let endpoint = storageContainer.config.endpointUrl
        if(!endpoint.endsWith('/')) {
            endpoint += '/'
        }
        const URL = endpoint + completePath
        const axios = SA.nodeModules.axios
        return axios.get(URL)
            .then(res => {
                //SA.logger.info(`statusCode: ${res.status}`)
                return res.data
            })
            .catch(error => {
                SA.logger.error('AWS S3 Storage -> Load File -> Error = ' + error)
                SA.logger.error('AWS S3 Storage -> Load File -> completePath = ' + completePath)
                SA.logger.error('AWS S3 Storage -> Load File -> URL = ' + URL)
            })
    }

    async function removeFile(fileName, filePath, storageContainer) {       
        /** @type {ApiSecret} */
        const secret = SA.secrets.apisSecrets.map.get(storageContainer.config.codeName);
        const s3Client = getClient(secret, storageContainer)
        const { DeleteObjectCommand } = SA.nodeModules.awsS3
        let key = filePath + '/' + fileName + '.json'
        if(storageContainer.config.pathPrefix !== undefined && storageContainer.config.pathPrefix.length > 0) {
            let prefix = storageContainer.config.pathPrefix
            if(prefix.endsWith('/')) {
                key = prefix + key
            }
            else {
                key = prefix + '/' + key
            }
        }
        try {
            await s3Client.send(new DeleteObjectCommand({
                bucket: storageContainer.config.bucketName,
                key
            })).then(() => {
                SA.logger.info('File deleted on AWS S3. completePath = ' + key)
            })
        } catch (error) {
            SA.logger.error('Error:', error);
            SA.logger.error(`File could not be deleted from AWS S3 -> err.stack = ${error.stack}`);
        }
    }

    /**
     * This will try and use credentials supplied by the user in the UI otherwise it will
     * fallback to using AWS credentials lookup by the SDK
     * @param {ApiSecret} secret 
     * @param {StorageContainer} storageContainer 
     * @returns {import {S3Client} from "@aws-sdk/client-s3";}
     */
    function getClient(secret, storageContainer) {
        if(_client === undefined) {
            const options = {};
            if(secret.access_key_id && secret.secret_access_key) {
                options.accessKeyId = secret.access_key_id
                options.secretAccessKey = secret.secret_access_key
            }
            if(secret.region) {
                options.region = secret.region
            }
            if(storageContainer.config.bucketRegion !== undefined && storageContainer.config.bucketRegion.length > 0) {
                options.region = storageContainer.config.bucketRegion
            }
            const { S3Client } = SA.nodeModules.awsS3
            _client = new S3Client(options)
        }
        return _client
    }
}

/**
 * @typedef StorageContainer
 * @property {StorageContainerConfig} config
 */

/**
 * @typedef StorageContainerConfig
 * @property {string} codeName
 * @property {string|undefined} bucketRegion
 * @property {string|undefined} pathPrefix
 */

/**
 * @typedef ApiSecret
 * @property {string|undefined} access_key_id
 * @property {string|undefined} secret_access_key
 * @property {string|undefined} region
 */