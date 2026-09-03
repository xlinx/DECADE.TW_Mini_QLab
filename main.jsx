import './src/styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import StaticHTML from './PAGEXQ.jsx';
import { ToastProvider } from './src/components/ui/ToastProvider.jsx';

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ToastProvider><StaticHTML /></ToastProvider>
    </React.StrictMode>
);
