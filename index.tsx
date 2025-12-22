// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { MarketProvider } from './contexts/MarketContext'; // <--- Import corrigé

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MarketProvider> {/* On enveloppe l'application ici */}
      <HashRouter>
        <App />
      </HashRouter>
    </MarketProvider>
  </React.StrictMode>
);