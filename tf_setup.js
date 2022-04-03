const fs = require('fs')
const path = require('path')

const srcFolder = './node_modules/@tensorflow/tfjs-node/deps/lib/'
const destFolder = './node_modules/@tensorflow/tfjs-node/lib/'

if (process.platform === 'win32'
    && fs.existsSync(srcFolder) 
    && fs.existsSync(destFolder)) {
        const dest = fs.readdirSync(destFolder, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

        fs.copyFile(path.join(srcFolder, "tensorflow.dll"), path.join(destFolder, dest[0], "tensorflow.dll"), (err) => {
            if (err) throw err
            console.log("tensorflow dll copied")
        })
}
