import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import i18n from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parse from './parser.js';
import * as view from './render.js';
import { ru, en } from './locales/index.js';

const addProxy = (url) => `https://hexlet-allorigins.herokuapp.com/get?url=${url}&disableCache=true`;

const validateURL = (url, exceptionURLs) => {
  const schema = yup.string()
    .url('invalid_url')
    .notOneOf(exceptionURLs, 'dublicate');
  return schema.validate(url);
};

export default async () => {
  const state = {
    feeds: [], //  { title, description, link, url, guid }
    posts: [], //  { title, description, link, guid, pubDate }
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
      readedPosts: new Set(),
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

  const loadRSS = async (feedURL) => {
    watchedState.network.process = 'progress';
    return axios.get(addProxy(feedURL))
      .then((response) => {
        const feed = parse(response);
        feed.url = feedURL;
        watchedState.feeds = [feed].concat(watchedState.feeds);
        watchedState.posts = [...state.posts, ...feed.posts];
        form.reset();
        watchedState.network.process = 'idle';
        watchedState.network.error = '';
      })
      .catch((e) => {
        if (e.message === 'Network Error') {
          watchedState.network.error = 'connection_error';
        } else {
          watchedState.network.error = e.message;
        }
        watchedState.network.process = 'idle';
        input.focus();
      });
  };

  modal.addEventListener('hide.bs.modal', () => {
    watchedState.modal.selectedPostId = '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const feedURL = formData.get('url');
    return validateURL(feedURL, state.feeds.map((feed) => feed.url))
      .then(() => {
        watchedState.form.error = '';
        watchedState.form.valid = true;
        loadRSS(feedURL);
      })
      .catch((e) => {
        [watchedState.form.error] = e.errors;
        watchedState.form.valid = false;
        input.focus();
      });
  });

  const loadNewPosts = () => {
    const promises = state.feeds.map((feed) => axios.get(addProxy(feed.url)));
    Promise.all(promises)
      .then((responses) => {
        const receivedPosts = responses
          .reduce((posts, response) => {
            const feed = parse(response);
            return [...posts, ...feed.posts];
          }, []);
        const compare = (receivedPost, oldPost) => receivedPost.guid === oldPost.guid;
        const newPosts = _.differenceWith(receivedPosts, state.posts, compare);
        watchedState.posts = [...state.posts, ...newPosts];
        setTimeout(loadNewPosts, 5000);
      });
  };
  watchedState.network.process = 'progress';
  i18n.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
      en,
    },
  }).then(() => {
    watchedState.network.process = 'idle';
    loadNewPosts();
  });
};
