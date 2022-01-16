exports.newFoundationsUtilitiesFilesAndDirectories = function () {

    let thisObject = {
        getDirectories: getDirectories,
        getAllFilesInDirectoryAndSubdirectories: getAllFilesInDirectoryAndSubdirectories,
        pathFromDate: pathFromDate,
        pathFromDatetime: pathFromDatetime, 
        mkDirByPathSync: mkDirByPathSync
    }

    return thisObject

    function getDirectories(path) {
        try {
            const fs = SA.nodeModules.fs
            return fs.readdirSync(path).filter(function (file) {
                return fs.statSync(path + '/' + file).isDirectory();
            });
        } catch (err) {
            return []
        }
    }

    function getAllFilesInDirectoryAndSubdirectories(dir, callback) {
        const { promisify } = SA.nodeModules.util
        const { resolve } = SA.nodeModules.path;
        const fs = SA.nodeModules.fs;
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

    function pathFromDate(timestamp) {
        
        let file = { date: new Date(timestamp) }
        
        file.year = file.date.getUTCFullYear()
        file.month = file.date.getUTCMonth() + 1
        file.day = file.date.getUTCDate()
        
        return file.year + '/' +
            SA.projects.foundations.utilities.miscellaneousFunctions.pad(file.month, 2) + '/' +
            SA.projects.foundations.utilities.miscellaneousFunctions.pad(file.day, 2)
    }

    function pathFromDatetime(timestamp) {
        
        let file = { date: new Date(timestamp) }
        
        file.year = file.date.getUTCFullYear()
        file.month = file.date.getUTCMonth() + 1
        file.day = file.date.getUTCDate()
        file.hour = file.date.getUTCHours()
        file.minute = file.date.getMinutes()

        return file.year + '/' +
            SA.projects.foundations.utilities.miscellaneousFunctions.pad(file.month, 2) + '/' +
            SA.projects.foundations.utilities.miscellaneousFunctions.pad(file.day, 2) + '/' +
            SA.projects.foundations.utilities.miscellaneousFunctions.pad(file.hour, 2) + '/' +
            SA.projects.foundations.utilities.miscellaneousFunctions.pad(file.minute, 2)
    }

    /* Function to create folders of missing folders at any path. */
    function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
        const path = SA.nodeModules.path

        targetDir = targetDir.substring(0, targetDir.lastIndexOf('/') + 1);

        const sep = '/';
        const initDir = path.isAbsolute(targetDir) ? sep : '';
        const baseDir = isRelativeToScript ? __dirname : '.';

        return targetDir.split(sep).reduce((parentDir, childDir) => {
            const curDir = path.resolve(baseDir, parentDir, childDir);
            try {
                const fs = SA.nodeModules.fs
                fs.mkdirSync(curDir);
            } catch (err) {
                if (err.code === 'EEXIST') { // curDir already exists!
                    return curDir;
                }

                // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
                if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
                    throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
                }

                const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
                if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
                    throw err; // Throw if it's just the last created dir.
                }
            }

            return curDir;
        }, initDir);
    }
}