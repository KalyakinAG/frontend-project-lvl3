import 'bootstrap';
import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parse from './parser.js';
import getWatchedState from './render.js';
import { ru, en } from './locales/index.js';

const addProxy = (url) => {
  const URLObject = new URL('/get', 'https://hexlet-allorigins.herokuapp.com/');
  URLObject.searchParams.set('url', url);
  URLObject.searchParams.set('disableCache', true);
  return URLObject.href;
};

const validateURL = async (url, exceptionURLs) => {
  const schema = yup.string()
    .url()
    .notOneOf(exceptionURLs);
  return schema.validate(url);
};

export default async () => {
  const state = {
    feeds: [], //  { title, description, link, url }
    posts: [], //  { feedLink, title, description, link, pubDate, guid }
    modal: {
      selectedPostId: null,
    },
    form: {
      valid: false,
      error: null,
    },
    network: {
      process: 'idle',
      error: null,
    },
    ui: {
      readedPosts: new Set(),
    },
  };
  const form = document.querySelector('.rss-form');
  const input = form.querySelector('input');
  const elements = {
    form,
    modal: document.querySelector('.modal'),
    input,
    button: form.querySelector('button'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    feedback: document.querySelector('.feedback'),
  };
  const i18n = i18next.createInstance();
  yup.setLocale({
    mixed: {
      notOneOf: 'dublicate',
    },
    string: {
      url: 'invalid_url',
    },
  });
  const watchedState = getWatchedState(elements, state, i18n);

  const loadRSS = async (feedURL) => {
    watchedState.network.process = 'progress';
    return axios.get(addProxy(feedURL))
      .then((response) => {
        const rss = parse(response.data.contents);
        const feed = {
          title: rss.title,
          description: rss.description,
          link: rss.link,
          url: feedURL,
        };
        const mapItemToPost = (item) => ({ ...item, feedLink: feed.link, guid: _.uniqueId() });
        const posts = rss.items.map(mapItemToPost);
        watchedState.feeds = [...state.feeds, feed];
        watchedState.posts = [...state.posts, ...posts];
        watchedState.network.process = 'idle';
        watchedState.network.error = null;
      })
      .catch((e) => {
        if (e.isAxiosError) {
          watchedState.network.error = 'connection_error';
        } else if (e.isParseError) {
          watchedState.network.error = 'invalid_rss';
        } else {
          watchedState.network.error = 'invalid_rss';
        }
        watchedState.network.process = 'error';
      });
  };

  const postLoadingInterval = 5000;

  const loadNewPosts = async () => {
    const promises = state.feeds.map(
      (feed) => axios.get(addProxy(feed.url))
        .then((response) => {
          const rss = parse(response.data.contents);
          const mapItemToPost = (item) => ({ ...item, feedLink: feed.link, guid: _.uniqueId() });
          const posts = rss.items.map(mapItemToPost);
          const newPosts = _.differenceBy(posts, state.posts, 'feedLink', 'title');
          watchedState.posts = [...state.posts, ...newPosts];
        })
        .catch(),
    );
    return Promise.all(promises)
      .then(() => {
        setTimeout(loadNewPosts, postLoadingInterval);
      });
  };

  return i18n.init({
    lng: 'ru',
    resources: {
      ru,
      en,
    },
  })
    .then(() => {
      elements.posts.addEventListener('click', (e) => {
        if (!e.target.hasAttribute('data-id')) {
          return;
        }
        e.preventDefault();
        watchedState.modal.selectedPostId = e.target.getAttribute('data-id');
        watchedState.ui.readedPosts.add(watchedState.modal.selectedPostId);
      });
      elements.modal.addEventListener('hide.bs.modal', () => {
        watchedState.modal.selectedPostId = null;
      });
      elements.form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const feedURL = formData.get('url');
        return validateURL(feedURL, state.feeds.map((feed) => feed.url))
          .then(() => {
            watchedState.form.error = null;
            watchedState.form.valid = true;
            return loadRSS(feedURL);
          })
          .catch((e) => {
            [watchedState.form.error] = e.errors;
            watchedState.form.valid = false;
          });
      });
      setTimeout(loadNewPosts, postLoadingInterval);
    });
};
