import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
// Pirate Chain brand fonts, bundled and served from this site rather than
// a third-party font CDN, so loading the explorer contacts no one else.
import '@fontsource/bai-jamjuree/500.css';
import '@fontsource/bai-jamjuree/600.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/ibm-plex-mono/400.css';
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
