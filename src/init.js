import i18n from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parse from './parser.js';
import * as view from './render.js';
import { ru, en } from './locales.js';

const fetch = (url) => axios.get('https://hexlet-allorigins.herokuapp.com/get', {
  params: {
    url,
    disableCache: true,
  },
});

export default () => {
  const defaultLanguage = 'ru';
  const state = {
    feeds: [], //  { title, description, link, url, guid }
    posts: [], //  { title, description, link, guid, feedGuid, pubDate }
    ui: {
      lng: defaultLanguage,
      state: '',
      readonly: false,
      selectedPostId: '',
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

  const schema = yup.string().url();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (watchedState.ui.readonly) return;
    const formData = new FormData(e.target);
    const feedURL = formData.get('url');
    watchedState.ui.readonly = true;
    const errorState = {
      isPassURL: true,
      isPassConnection: true,
    };
    try {
      schema.validateSync(feedURL);
    } catch (urlError) {
      [watchedState.ui.message] = urlError.errors;
      errorState.isPassURL = false;
      watchedState.ui.readonly = false;
      input.focus();
      return;
    }

    if (watchedState.feeds.find((itemFeed) => itemFeed.url === feedURL) !== undefined) {
      watchedState.ui.message = 'dublicate';
      watchedState.ui.readonly = false;
      input.focus();
      return;
    }

    fetch(feedURL)
      .catch(() => {
        watchedState.ui.message = 'connection_error';
        errorState.isPassConnection = false;
        watchedState.ui.readonly = false;
        input.focus();
      })
      .then((response) => {
        if (!errorState.isPassConnection) throw new Error();
        if (_.has(response, 'data.status.http_code') && response.data.status.http_code !== 200) {
          watchedState.ui.message = 'invalid_rss';
          throw new Error();
        }
        if (_.has(response, 'request.response.statusCode') && response.request.response.statusCode !== 200) {
          watchedState.ui.message = 'invalid_rss';
          throw new Error();
        }
        return response;
      })
      .then((response) => {
        if (response === null) throw new Error();
        const [feed, posts] = parse(response.data.contents);
        if (feed === undefined) {
          watchedState.ui.message = 'invalid_rss';
          errorState.isPassURL = false;
          throw new Error();
        }
        feed.url = feedURL;
        if (watchedState.feeds.find((itemFeed) => itemFeed.guid === feed.guid) !== undefined) {
          watchedState.ui.message = 'dublicate';
          throw new Error();
        }
        watchedState.feeds = [feed].concat(watchedState.feeds);
        watchedState.posts = posts.concat(watchedState.posts)
          .sort((post1, post2) => post2.pubDate - post1.pubDate)
          .slice(0, 30);
        watchedState.ui.message = 'success';
        form.reset();
        watchedState.ui.readonly = false;
      })
      .catch(() => {
        watchedState.ui.readonly = false;
        input.focus();
      });
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
        disableCache: true,
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
          .sort((post1, post2) => post2.pubDate - post1.pubDate);
        setTimeout(loadNewPosts, 5000);
      });
  };
  setTimeout(loadNewPosts, 5000);
};
