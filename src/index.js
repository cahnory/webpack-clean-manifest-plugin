import polyfill from 'babel-polyfill'

import fs from 'fs'
import {resolve} from 'path'
import WebpackOnBuildPlugin from 'on-build-webpack'

export function WebpackCleanManifestPlugin (directory, {manifest, exclude}) {
  manifest  = manifest ? resolve(process.cwd(), manifest) : {}
  directory = resolve(process.cwd(), directory)
  exclude   = exclude ? [].concat(exclude) : []

  return new WebpackOnBuildPlugin(function () {
    // ignore if manifest does not exist (yet)
    let manifestExists
    try {
      manifestExists = fs.statSync(manifest).isFile()
    } catch(e) {
      manifestExists = false
    }

    if (manifestExists) {
      // get last build files to keep them
      const ignore = Object.values(JSON.parse(fs.readFileSync(manifest, 'utf8')))
        // get resolved files
        .map(file => resolve(directory, file))
        // add manifest to keep it too
        .concat(manifest)

      cleanDirectory(directory, ignore, exclude)
    }
  })
}

export default WebpackCleanManifestPlugin

function cleanDirectory(directory, ignore, exclude) {
  let nbIgnored = 0
  let removed = fs.readdirSync(directory)
    // make paths absolute
    .map(path => resolve(directory, path))
    // remove last build files and count them
    .filter(path => -1 === ignore.indexOf(path) ? true : !++nbIgnored)
    .filter(path => exclude.find(pattern => pattern.test(path)) ? !++nbIgnored : true)
    // remove cleaned paths
    .filter(path => !cleanPath(path, ignore, exclude))
    // and count ignored
  nbIgnored += removed.length

  // remove directory if no ignored path
  if (!nbIgnored) {
    fs.rmdirSync(directory)
    return true
  }

  return false
}

function cleanFile(file, ignore) {
  // file is not from last build
  if (-1 === ignore.indexOf(file)) {
    fs.unlinkSync(file)
    return true
  }

  return false
}

function cleanPath(path, ignore, exclude) {
  return fs.statSync(path).isDirectory()
    ? cleanDirectory(path, ignore, exclude)
    : cleanFile(path, ignore)
}
