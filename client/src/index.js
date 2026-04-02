import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    // If running outside typical CRA index.html, we inject a root
    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);
    const root = createRoot(div);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
