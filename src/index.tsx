import * as esbuild from 'esbuild-wasm';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';


const App = () => {
    const ref = useRef<any>();
    const [input, setInput] = useState('');
    // The output of ESBuild tool
    const [code, setCode] = useState('');

    const startService = async () => {
        // reference to the service we create using the esbuild
        ref.current = await esbuild.startService({
            worker: true,
            // Go to the public and find the binary
            wasmURL: '/esbuild.wasm'
        });
        // We are gonna use the build (bundle) and transform (transpile) functions of the service.
    };

    useEffect(() => {
        startService();
    }, []);

    const onClick = async () => {
        if (!ref.current) {
            return;
        }
       
        // To get esbuild to do bundling inside the browser.
       const result = await ref.current.build({
        entryPoints: ['index.js'],
        bundle: true,
        write: false,
        plugins: [unpkgPathPlugin()],
        define: {
            'process.env.NODE_ENV': '"production"',
            global: 'window'
        }
       });

        setCode(result.outputFiles[0].text);
    }

    return <div>
        <textarea value={input} onChange={e => setInput(e.target.value)}></textarea>
        <div>
            <button onClick={onClick}>Submit</button>
        </div>
        <pre>{code}</pre>
    </div>
};

const root = ReactDOM.createRoot(document.getElementById("root") as Element);

root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );