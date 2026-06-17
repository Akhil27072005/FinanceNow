import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import './styles/theme-surfaces.css';
import './styles/theme-dark-glass.css';
import './styles/theme-dark-datepicker.css';
import './styles/theme-accent.css';
import './styles/datepicker.css';
import './styles/button.css';
import './styles/select.css';
import './index.css';
import './styles/sidebar.css';
import App from './App';
import { applyAppTheme } from './utils/appTheme';

applyAppTheme({});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

