import { Client } from 'minio'

const getService = () => {
  let service = new Client({
    endPoint: process.env.MINIO_END_POINT,
    port: JSON.parse(process.env.MINIO_PORT),
    useSSL: JSON.parse(process.env.MINIO_USE_SSL),
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
  })
  return service
}

export const getFileContent = async (containerName, blobName) => {
  let service = getService()
  let chunks = []
  let fileContent = await new Promise(function (resolve, reject) {
    service.getObject(containerName, blobName, function (error, dataStream) {
      if (error) {
        reject(error)
      }
      if (dataStream != undefined) {
        dataStream.on('data', function (chunk) {
          chunks.push(chunk.toString())
        })
        dataStream.on('end', function () {
          resolve(chunks.join(''))
        })
        dataStream.on('error', function (e) {
          reject(e)
        })
      } else {
        resolve('')
      }
    })
  })
  return fileContent
}

export const writeFileContent = async (containerName, blobName, content) => {
  let service = getService()
  await new Promise(function (resolve, reject) {
    service.putObject(containerName, blobName, content, 'text/plain', function (error) {
      if (error) {
        reject(error)
      }
      resolve()
    })
  })
}

export const createContainer = async (containerName) => {
  let service = getService()
  await new Promise(function (resolve, reject) {
    service.makeBucket(containerName, '', function (error) {
      if (error) {
        reject(error)
      }
      resolve()
    })
  })
}

export const deleteContainer = async (containerName) => {
  let service = getService()
  let objectsStream = service.listObjects(containerName, '', true)
  let totalObjects = 0
  let removed = 0
  objectsStream.on('data', async function (obj) {
    totalObjects++
    await new Promise(function (resolve, reject) {
      service.removeObject(containerName, obj.name, function (e) {
        if (e) reject(e)
        removed++
        resolve()
      })
    })
  })
  objectsStream.on('error', function (e) {
    throw e
  })
  objectsStream.on('end', async function (e) {
    await removeBucket()
  })

  function removeBucket() {
    if (totalObjects === removed) {
      new Promise(function (resolve, reject) {
        service.removeBucket(containerName, function (e) {
          if (e) reject(e)
          resolve()
        })
      })
    } else {
      setTimeout(removeBucket, 2000)
    }
  }
}

