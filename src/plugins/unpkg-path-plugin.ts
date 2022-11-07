import * as esbuild from 'esbuild-wasm';


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

            // Change the filter value to have different onResolve functions
            // Handle root entry
            build.onResolve({filter: /(^index\.js$)/}, () => {
                return {path: 'index.js', namespace: 'a'};
            });

            build.onResolve({filter: /^\.+\//}, (args: any) => {
                return {
                    namespace: 'a',
                    path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`).href
                };
            });

			build.onResolve({ filter: /.*/ }, async (args: any) => {
                return {
                        namespace: 'a',
                        path: `https://unpkg.com/${args.path}`
                    }
			});
		},
	};
};
