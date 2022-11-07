import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';

const fileCache = localForage.createInstance({
	name: 'fileCache',
});

export const fetchPlugin = (inputCode: string) => {
	return {
		name: 'fetch-plugin',
		setup(build: esbuild.PluginBuild) {
			build.onLoad({filter: /(^index\.js$)/}, () => {
				// If we don't return anything no problem at all, moves to the next one, until we get an object.
				return {
					loader: 'jsx',
					contents: inputCode,
				}
			});

		build.onLoad({filter: /.*/}, async (args: any) => {
			// Check to see if we have already fetched this file and if it is in the cache.
			const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
				args.path
			);

			// If it is, return it immediately.
			if (cachedResult) {
				return cachedResult;
			}
		})

			build.onLoad({filter: /.css$/}, async (args: any) => {
				const { data, request } = await axios.get(args.path);
				// In request there is the responseURL property which tells us where we got redirected to.
				// From the URL we will get the pathname (1st arg './')

				const contents =
				 	`
                        const style = document.createElement('style');
                        style.innerText = \`${data}\`;
                        document.head.appendChild(style);
                    `

				const result: esbuild.OnLoadResult = {
					loader: 'jsx',
					contents,
					// Where we found the last file we were looking for passed to onResolve
					resolveDir: new URL('./', request.responseURL).pathname,
				};
				//store response in cache
				await fileCache.setItem(args.path, result);

				return result;

			});
			// event.listener | Attempt to load up the index.js file
			build.onLoad({ filter: /.*/ }, async (args: any) => {
				const { data, request } = await axios.get(args.path);
				// In request there is the responseURL property which tells us where we got redirected to.
				// From the URL we will get the pathname (1st arg './')

				const result: esbuild.OnLoadResult = {
					loader: 'jsx',
					contents: data,
					// Where we found the last file we were looking for passed to onResolve
					resolveDir: new URL('./', request.responseURL).pathname,
				};
				//store response in cache
				await fileCache.setItem(args.path, result);

				return result;
			});
		},
	};
};
