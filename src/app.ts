import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './main/app';
import { createElement } from 'react';

createRoot(document.getElementById('root')!).render(createElement(App));
