import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import { createStore } from './store/index.js';
import { installMockApi } from './mocks/browserAdapter.js';
import './styles.css';

installMockApi();
registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={createStore()}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
