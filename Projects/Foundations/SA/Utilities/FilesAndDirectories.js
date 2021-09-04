exports.newFoundationsUtilitiesFilesAndDirectories = function () {

    let thisObject = {
        getDirectories: getDirectories,
        getAllFilesInDirectoryAndSubdirectories: getAllFilesInDirectoryAndSubdirectories
    }

    return thisObject

    function getDirectories(path) {
        try {
            const fs = require('fs')
            return fs.readdirSync(path).filter(function (file) {
                return fs.statSync(path + '/' + file).isDirectory();
            });
        } catch (err) {
            return []
        }
    }

    function getAllFilesInDirectoryAndSubdirectories(dir, callback) {
        const { promisify } = require('util');
        const { resolve } = require('path');
        const fs = require('fs');
        const readdir = promisify(fs.readdir);
        const stat = promisify(fs.stat);

        getFiles(dir)
            .then(files => {
                let splittedDir = dir.split('/')
                let lastFolder = splittedDir[splittedDir.length - 2]
                let pathAndNames = []
                for (let i = 0; i < files.length; i++) {
                    let file = files[i]
                    let pathName = file.substring(file.indexOf(lastFolder) + lastFolder.length, file.length)
                    pathName = pathName.substring(1, pathName.length)
                    pathAndNames.push(pathName)
                }
                callback(pathAndNames)
            })
            .catch(e => {
                callback([])
            });

        async function getFiles(dir) {
            const subdirs = await readdir(dir);
            const files = await Promise.all(subdirs.map(async (subdir) => {
                const res = resolve(dir, subdir);
                return (await stat(res)).isDirectory() ? getFiles(res) : res;
            }));
            return files.reduce((a, f) => a.concat(f), []);
        }
    }
}