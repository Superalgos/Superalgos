import { assert } from 'chai'
import {
    getFileContent,
    createContainer,
    deleteContainer,
    writeFileContent
} from '../src/storage/providers/MinioStorage'

import 'dotenv/config'

describe('Minio Storage Tests', function () {
    it('Create Container', async function () {
        let containerName = 'test-container'
        await createContainer(containerName)
        assert.isOk('everything', 'everything is ok')
    })
    it('Save File', async function () {
        let containerName = 'test-container'
        let blobName = 'test-folder/test_data_file.json'
        let content = '[0,0,0,0]'
        await writeFileContent(containerName, blobName, content)

        // for (let index = 0; index < 1000; index++) {
        //     let blobName = 'test-folder/test_data_file_' + index + '.json'
        //     await writeFileContent(containerName, blobName, content)
        // }

        assert.isOk('everything', 'everything is ok')
    })
    it('Retrieve File', async function () {
        let containerName = 'test-container'
        let blobName = 'test-folder/test_data_file_1.json'
        let fileContent = await getFileContent(containerName, blobName)

        let expected = '[0,0,0,0]'
        assert.equal(fileContent, expected)
    })
    it('Delete Container', async function () {
        let containerName = 'test-container'
        console.log('start: '+ new Date().toISOString())
        await deleteContainer(containerName)
        console.log('end: '+ new Date().toISOString())

        assert.isOk('everything', 'everything is ok')
    })
})
