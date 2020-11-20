import fs from 'fs'
import path from 'path'

export const mergeDirectoryModules = dirpath =>
  fs
    .readdirSync(dirpath, 'utf8')
    .filter(filename => !/^[_|index.]/.test(filename))
    .reduce(
      (acc, filename) => ({
        ...acc,
        ...require(path.resolve(dirpath, filename)).default,
      }),
      {}
    )

export const capitalize = (string) => {
  return (string).charAt(0).toUpperCase() + (string).slice(1)
}

export default capitalize
