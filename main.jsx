import './src/styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import StaticHTML from './PAGEXQ.jsx';

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <StaticHTML />
    </React.StrictMode>
);
