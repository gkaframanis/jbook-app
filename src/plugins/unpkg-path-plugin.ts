import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';


const fileCache = localForage.createInstance({
    name: "fileCache"
});

export const unpkgPathPlugin = () => {
	return {
		// for debugging purposes
		name: 'unpkg-path-plugin',
		// it's being called automatically by esbuild.
		setup(build: esbuild.PluginBuild) {
			// We the event listeners we overwrite the natural behavior of esbuild.
			// event listener | figuring out where the index.js file is stored
			// filter: a regex against the filename 
            // namespace allows to apply something to a set of files.
			build.onResolve({ filter: /.*/ }, async (args: any) => {
				console.log('onResolve', args);
                if(args.path === 'index.js') {
                    return { path: args.path, namespace: 'a' };
                }

                if(args.path.includes('./') || args.path.includes('../')) {
                    return {
                        namespace: 'a',
                        path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`).href
                    }
                }

                return {
                    namespace: 'a',
                    path: `https://unpkg.com/${args.path}`
                }
			});

			// event.listener | Attempt to load up the index.js file
			build.onLoad({ filter: /.*/ }, async (args: any) => {
				console.log('onLoad', args);

				if (args.path === 'index.js') {
                    // Use of nested-test-pkg from unpkg.
					return {
						loader: 'jsx',
						contents: `
                            import React, {useState} from 'react';
                            console.log(React, useState);
                            `,
					};
				}

                // Check to see if we have already fetched this file and if it is in the cache.
                const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);

                // If it is, return it immediately.
                if (cachedResult) {
                    return cachedResult;
                }

                const { data, request } = await axios.get(args.path);
                // In request there is the responseURL property which tells us where we got redirected to.
                // From the URL we will get the pathname (1st arg './')
                const result: esbuild.OnLoadResult = {
                    loader: 'jsx',
                    contents: data,
                    // Where we found the last file we were looking for passed to onResolve
                    resolveDir: new URL('./', request.responseURL).pathname
                }
                //store response in cache
                await fileCache.setItem(args.path, result);

                return result;
			});
		},
	};
};
