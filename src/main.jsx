import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './i18n';
import App from './App';
import './styles/common.css';

// bitcore-node-pirate/index.js's filterIndexHTML() rewrites the <base>
// tag's href when the InsightUI service is mounted under a routePrefix -
// read it at runtime rather than hardcoding '/'.
const baseHref = document.querySelector('base')?.getAttribute('href') || '/';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={baseHref}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
