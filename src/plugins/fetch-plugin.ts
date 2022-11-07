import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';


const fileCache = localForage.createInstance({
    name: "fileCache"
});

export const fetchPlugin = (inputCode: string) => {
    return {
        name: 'fetch-plugin',
        setup(build: esbuild.PluginBuild ) {
            // event.listener | Attempt to load up the index.js file
			build.onLoad({ filter: /.*/ }, async (args: any) => {
				if (args.path === 'index.js') {
                    // Use of nested-test-pkg from unpkg.
					return {
						loader: 'jsx',
						contents: inputCode,
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

        }
    }
}