const fs = require('fs')
const path = require('path')

const srcFolder = './node_modules/@tensorflow/tfjs-node/deps/lib/'
const destFolder = './node_modules/@tensorflow/tfjs-node/lib/'

const dest = fs.readdirSync(destFolder, { withFileTypes: true })
.filter(dirent => dirent.isDirectory())
.map(dirent => dirent.name)

if(process.platform === 'win32') {
    fs.copyFile(path.join(srcFolder, "tensorflow.dll"), path.join(destFolder, dest[0], "tensorflow.dll"), (err) => {
        if (err) throw err
        console.log("tensorflow dll copied")
    })
}
