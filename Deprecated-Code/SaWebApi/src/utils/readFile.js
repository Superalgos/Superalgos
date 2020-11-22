import fs from 'fs'

export default function readFile(fileName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, 'utf8', (err, file) => {
            if (err) {
                reject(err)
            } else {
                resolve(file)
            }
        })

    })
}
