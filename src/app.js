import { createStore } from './state/store.js';
import { mountApp } from './ui/app-shell.js';

const root = typeof document === 'undefined' ? null : document.getElementById('app');
if (root) {
  const store = createStore();
  const app = mountApp(root, store);
  store.subscribe(() => app.render());
}
