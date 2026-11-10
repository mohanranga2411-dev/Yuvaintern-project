import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createStore } from '../store/index.js';
import App from '../App.jsx';

export function renderWithProviders(ui, { route = '/', store = createStore() } = {}) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{ui}</MemoryRouter>
      </Provider>,
    ),
  };
}

export const renderApp = (route = '/') => renderWithProviders(<App />, { route });
