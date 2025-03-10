# companion-module-file-download

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)

## Getting started

### Running

There is one action added by this module that allows a file to be downloaded from a URL to a file path. The module has the following features:

- Specify any `http`, `https`, or `ftp` url
- Specify any path on the local filesystem (both relative or absolute), a network location, or a network mapped drive
- URL and file inputs have REGEX-based input validation
- There are two variables `downloading` and `downloaded` that can be used elsewhere in Companion to trigger other actions or for other things
- There are two feedback mechanisms that coorespond to the `downloading` and `downloaded` variables
  - The `downloading` feedback will turn the button red
  - The `downloaded` feedback will turn the button green
    - The first trigger of the action (i.e. button press) will start a repeating timer that will check if the downloaded file still exists and turn the button back to black if it is deleted

### Developing

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn dev` the compiler will be run in watch mode to recompile the files on change.
