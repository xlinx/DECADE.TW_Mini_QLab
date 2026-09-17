import React from 'react';
import { createRoot } from 'react-dom/client';
import MiniQLab from './PAGEXQ.jsx';
import './styles.css';

const { StrictMode } = React;
createRoot(document.getElementById('root')).render(
  React.createElement(StrictMode, null, React.createElement(MiniQLab))
);
