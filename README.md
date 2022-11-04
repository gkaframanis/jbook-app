# JBOOK Application

## esbuild-wasm npm module
- Small amount of JS that we are gonna use to interact with in our React App.
- ***WASM***(Web assembly binary) is a Go Lang bundler compiled to work in the browser.
- The ***esbuild.wasm*** file inside the esbuild-wasm node_module is the compiled Go code that correctly work inside the browser. We copy & paste it in the public folder.

***npm view react dist.tarball*** in command line to get a link with all the source code of react.