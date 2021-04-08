import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import parse from './parser.js';

const renderFeedback = (state, i18n) => {
  const feedback = document.querySelector('.feedback');
  feedback.classList.remove('text-success', 'text-danger');
  //  success, invalid, error, duplicate
  if (state.ui.error === 'success') {
    feedback.classList.add('text-success');
    feedback.textContent = i18n.t('success');
    return;
  }
  if (state.ui.error !== '') {
    feedback.classList.add('text-danger');
    feedback.textContent = i18n.t(`error.${state.ui.error}`);
    return;
  }
  feedback.textContent = '';
};

const renderRSSForm = (state) => {
  const form = document.querySelector('.rss-form');
  const input = form.querySelector('input');
  input.classList.remove('is-invalid');
  if (state.ui.error === 'success') {
    form.reset();
    return;
  }
  if (state.ui.error !== '') {
    input.classList.add('is-invalid');
    input.focus();
  }
};

const renderFeeds = (state) => {
  const feeds = document.querySelector('.feeds');
  feeds.innerHTML = '';
  if (state.feeds.length === 0) {
    return;
  }
  const head = document.createElement('h2');
  head.textContent = 'Фиды';
  const list = document.createElement('ul');
  list.classList.add('list-group', 'mb-5');
  feeds.appendChild(head);
  feeds.appendChild(list);
  state.feeds.forEach((item) => {
    const listItem = document.createElement('li');
    list.appendChild(listItem);
    listItem.innerHTML = `<h3>${item.title}</h3><p>${item.description}</p>`;
    listItem.classList.add('list-group-item');
  });
};

const renderPosts = (state) => {
  const posts = document.querySelector('.posts');
  posts.innerHTML = '';
  if (state.posts.length === 0) {
    return;
  }
  const head = document.createElement('h2');
  head.textContent = 'Посты';
  const list = document.createElement('ul');
  list.classList.add('list-group');
  posts.appendChild(head);
  posts.appendChild(list);
  state.posts.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const href = document.createElement('a');
    href.setAttribute('href', item.link);
    href.classList.add('font-weight-bold');
    href.textContent = item.title;
    listItem.appendChild(href);
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'btn-sm');
    button.textContent = 'Просмотр';
    listItem.appendChild(button);
    list.appendChild(listItem);
  });
};

const render = (state, i18n) => {
  i18n.changeLanguage(state.ui.lng);
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'ui.error':
        renderFeedback(state, i18n);
        renderRSSForm(state);
        break;
      case 'feeds':
        renderFeeds(state);
        break;
      case 'posts':
        renderPosts(state);
        break;
      case 'ui.lng':
        render(state, i18n);
        break;
      default:
        break;
    }
  });
  const form = document.querySelector('.rss-form');
  yup.setLocale({
    string: {
      url: 'invalid_url',
    },
  });
  const schema = yup.string().url();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    let hasError = false;
    schema.validate(url)
      .catch((err) => {
        [watchedState.ui.error] = err.errors;
        hasError = true;
      })
      .then(() => {
        if (hasError === true) {
          return undefined;
        }
        return axios.get('https://hexlet-allorigins.herokuapp.com/get', {
          params: { url },
        });
      })
      .then((response) => {
        if (hasError === true) {
          return;
        }
        if (response.status !== 200) {
          watchedState.ui.error = 'invalid_rss';
          return;
        }
        const { feed, posts } = parse(response.data.contents);
        if (state.feeds.find((item) => item.guid === feed.guid) !== undefined) {
          watchedState.ui.error = 'dublicate';
          return;
        }
        watchedState.feeds = [feed].concat(state.feeds);
        watchedState.posts = posts.concat(state.posts);
        watchedState.ui.error = 'success';
      })
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
        watchedState.ui.error = 'invalid_rss';
      });
  });
  renderFeedback(state, i18n);
  renderRSSForm(state);
  renderPosts(state);
};

export default render;
