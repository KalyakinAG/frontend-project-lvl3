import i18n from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parse from './parser.js';
import * as view from './render.js';
import { ru, en } from './locales/index.js';

const addProxy = (url) => `https://hexlet-allorigins.herokuapp.com/get?url=${url}&disableCache=true`;

const validateURL = (URL, exceptionURLs) => {
  const schema = yup.string()
    .url('invalid_url')
    .notOneOf(exceptionURLs, 'dublicate');
  schema.validateSync(URL);
};

export default () => {
  const defaultLanguage = 'ru';
  const state = {
    feeds: [], //  { title, description, link, url, guid }
    posts: [], //  { title, description, link, guid, feedGuid, pubDate }
    lng: defaultLanguage,
    modal: {
      selectedPostId: '',
    },
    form: {
      valid: false,
      error: '',
    },
    network: {
      process: '',
      error: '',
    },
    ui: {
      readedPosts: [],
    },
  };
  const form = document.querySelector('.rss-form');
  const modal = document.querySelector('.modal');
  const input = form.querySelector('input');
  const elements = {
    form,
    modal,
    input,
    button: form.querySelector('button'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    feedback: document.querySelector('.feedback'),
  };
  const watchedState = view.getWatchedState(elements, state);

  const loadRSS = (feedURL) => {
    watchedState.network.process = 'progress';
    axios.get(addProxy(feedURL))
      .then((response) => {
        const [feed, receivedPosts] = parse(response);
        feed.url = feedURL;
        watchedState.feeds = [feed].concat(watchedState.feeds);
        const compare = (receivedPost, oldPost) => receivedPost.guid === oldPost.guid;
        const newPosts = _.differenceWith(receivedPosts, state.posts, compare);
        watchedState.posts = [...state.posts, ...newPosts];
        form.reset();
        watchedState.network.process = 'idle';
        watchedState.network.error = '';
        watchedState.form.valid = true;
        watchedState.form.error = '';
      })
      .catch((e) => {
        document.e = e;
        if (e.message === 'Network Error') {
          watchedState.network.error = 'connection_error';
          watchedState.network.process = 'idle';
          watchedState.form.error = '';
          watchedState.form.valid = true;
          input.focus();
          return;
        }
        watchedState.network.error = '';
        watchedState.network.process = 'idle';
        watchedState.form.error = e.message;
        watchedState.form.valid = false;
        input.focus();
      });
  };

  modal.addEventListener('hide.bs.modal', () => {
    watchedState.modal.selectedPostId = '';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const feedURL = formData.get('url');
    try {
      validateURL(feedURL, state.feeds.map((feed) => feed.url));
    } catch (e) {
      [watchedState.form.error] = e.errors;
      watchedState.form.valid = false;
      input.focus();
      return;
    }
    loadRSS(feedURL);
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
    const promises = state.feeds.map((feed) => axios.get(addProxy(feed.url)));
    Promise.all(promises)
      .then((responses) => {
        const receivedPosts = responses
          .reduce((posts, response) => {
            const [, currentPosts] = parse(response);
            return [...posts, ...currentPosts];
          }, []);
        const compare = (receivedPost, oldPost) => receivedPost.guid === oldPost.guid;
        const newPosts = _.differenceWith(receivedPosts, state.posts, compare);
        watchedState.posts = [...state.posts, ...newPosts];
        setTimeout(loadNewPosts, 5000);
      });
  };
  setTimeout(loadNewPosts, 5000);
};
