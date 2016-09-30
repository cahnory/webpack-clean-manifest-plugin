# Webpack Clean Manifest

Webpack plugin for clearing a destination folder keeping files listed in a manifest.


## Install

```
npm install --save-dev webpack-clean-manifest-plugin
```

## Usage

```
import CleanManifestPlugin from 'webpack-clean-manifest-plugin'

export default {
  // ...
  plugins: [
    CleanManifestPlugin('./path/to/clean', {
      manifest  : './path/to/manifest.json',
    })
  ]
}
```