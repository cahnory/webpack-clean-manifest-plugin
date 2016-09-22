import polyfill from 'babel-polyfill'

import fs from 'fs'
import {resolve} from 'path'
import WebpackOnBuildPlugin from 'on-build-webpack'

export function WebpackCleanManifestPlugin (directory, manifest) {
  manifest = resolve(process.cwd(), manifest)
  directory = resolve(process.cwd(), directory)

  return new WebpackOnBuildPlugin(function () {
    // get last build files to keep them
    const ignore = Object.values(JSON.parse(fs.readFileSync(manifest, 'utf8')))
      // get resolved files
      .map(file => resolve(directory, file))
      // add manifest to keep it too
      .concat(manifest)

    cleanDirectory(directory, ignore)
  })
}

export default WebpackCleanManifestPlugin

export function clean(directory, manifest) {
  manifest = resolve(process.cwd(), manifest)
  directory = resolve(process.cwd(), directory)

  // get last build files to keep them
  const ignore = Object.values(require(manifest))
    // get resolved files
    .map(file => resolve(directory, file))
    // add manifest to keep it too
    .concat(manifest)

  cleanDirectory(directory, ignore)
}

function cleanDirectory(directory, ignore) {
  let nbIgnored = 0
  let removed = fs.readdirSync(directory)
    // make paths absolute
    .map(path => resolve(directory, path))
    // remove last build files and count them
    .filter(path => -1 === ignore.indexOf(path) ? true : !(++nbIgnored))
    // remove cleaned paths
    .filter(path => !cleanPath(path, ignore))
    // and count ignored
  nbIgnored += removed.length

  // remove directory if no ignored path
  console.log(directory, nbIgnored, fs.readdirSync(directory).length)
  if (!nbIgnored) {
    fs.unlinkSync(directory)
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

function cleanPath(path, ignore) {
  return fs.statSync(path).isDirectory()
    ? cleanDirectory(path, ignore)
    : cleanFile(path, ignore)
}