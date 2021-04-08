import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from 'i18next';
import render from './render.js';
import ru from './locales/ru.js';
import en from './locales/en.js';

export default () => {
  const state = {
    feeds: [],
    posts: [],
    ui: {
      lng: 'ru',
      error: '',
    },
  };
  const i18n = i18next.createInstance();
  document.i18n = i18n;
  i18n.init({
    lng: 'en',
    debug: false,
    resources: {
      ru,
      en,
    },
  }).then(() => {
    render(state, i18n);
  });
};
