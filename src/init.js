import 'bootstrap/dist/css/bootstrap.min.css';
import onChange from 'on-change';
import i18n from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import parse from './parser.js';
import * as view from './render.js';
import ru from './locales/ru.js';
import en from './locales/en.js';

export default () => {
  const defaultLanguage = 'ru';
  const state = {
    feeds: [], //  { title, description, link, url, guid }
    posts: [], //  { title, description, link, guid, feedGuid, pubDate }
    ui: {
      lng: defaultLanguage,
      state: '',
      selectedPostId: '',
      readedPosts: [],
    },
  };
  const form = document.querySelector('.rss-form');
  const modal = document.querySelector('.modal');
  const elements = {
    modal,
    form,
    input: form.querySelector('input'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    feedback: document.querySelector('.feedback'),
  };
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'ui.selectedPostId':
        view.renderModal(elements, watchedState);
        break;
      case 'ui.message':
        view.renderFeedback(elements, watchedState);
        break;
      case 'ui.url':
        view.renderInputForm(elements, watchedState);
        break;
      case 'feeds':
        view.renderFeeds(elements, watchedState);
        break;
      case 'ui.readedPosts':
        view.renderPosts(elements, watchedState);
        break;
      case 'posts':
        view.renderPosts(elements, watchedState);
        break;
      case 'ui.lng':
        view.render(elements, watchedState);
        break;
      default:
        break;
    }
  });
  const buttonClose = modal.querySelector('.close');
  const buttonCloseSecondary = modal.querySelector('.btn-secondary');
  buttonClose.addEventListener('click', (e) => {
    e.preventDefault();
    watchedState.ui.selectedPostId = '';
  });
  buttonCloseSecondary.addEventListener('click', (e) => {
    e.preventDefault();
    watchedState.ui.selectedPostId = '';
  });
  modal.addEventListener('keydown', (e) => {
    if (e.keyCode === 27) {
      watchedState.ui.selectedPostId = '';
    }
  });
  yup.setLocale({
    string: {
      url: 'invalid_url',
    },
  });
  i18n.init({
    lng: defaultLanguage,
    debug: false,
    resources: {
      ru,
      en,
    },
  }).then(() => {
    view.render(elements, watchedState);
  });
  const loadNewPosts = () => {
    const promises = state.feeds.map((feed) => axios.get('https://hexlet-allorigins.herokuapp.com/get', {
      params: {
        url: feed.url,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Expires: 0,
        timestamp: new Date().getTime(),
      },
    }));
    Promise.all(promises)
      .then((responses) => {
        watchedState.posts = responses
          .reduce((posts, response) => {
            const [, currentPosts] = parse(response.data.contents);
            return [...posts, ...currentPosts];
          }, [])
          .filter((post) => !state.posts.find((itemPost) => itemPost.guid === post.guid))
          .concat(state.posts)
          .sort((post1, post2) => post2.pubDate - post1.pubDate)
          .slice(0, 30);
        setTimeout(loadNewPosts, 5000);
      });
  };
  setTimeout(loadNewPosts, 5000);
};
