import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import parse from './parser.js';

const renderFeedback = (state) => {
  const feedback = document.querySelector('.feedback');
  feedback.classList.remove('text-success', 'text-danger');
  //  success, invalid, error, duplicate
  switch (state.ui.feedback) {
    case 'success':
      feedback.classList.add('text-success');
      feedback.textContent = 'RSS успешно загружен';
      break;
    case 'invalid':
      feedback.classList.add('text-danger');
      feedback.textContent = 'Ссылка должна быть валидным URL';
      break;
    case 'error':
      feedback.classList.add('text-danger');
      feedback.textContent = 'Ресурс не содержит валидный RSS';
      break;
    case 'dublicate':
      feedback.classList.add('text-danger');
      feedback.textContent = 'RSS уже существует';
      break;
    default:
      feedback.textContent = '';
  }
};

const renderRSSForm = (state) => {
  const form = document.querySelector('.rss-form');
  const input = form.querySelector('input');
  input.classList.remove('is-invalid');
  input.focus();
  switch (state.ui.feedback) {
    case 'success':
      form.reset();
      break;
    default:
      input.classList.add('is-invalid');
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

const render = (state) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'ui.feedback':
        renderFeedback(state);
        renderRSSForm(state);
        break;
      case 'feeds':
        renderFeeds(state);
        break;
      case 'posts':
        renderPosts(state);
        break;
      default:
        break;
    }
  });
  const schema = yup.string().url();
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    if (!schema.isValidSync(url)) {
      watchedState.ui.feedback = 'invalid';
      return;
    }
    axios.get(url, {
      method: 'GET',
    })
      .then((response) => {
        const feed = parse(response.data);
        if (state.feeds.find((item) => item.guid === feed.guid) !== undefined) {
          watchedState.ui.feedback = 'dublicate';
          return;
        }
        watchedState.feeds = [feed].concat(state.feeds);
        watchedState.posts = feed.posts.concat(state.posts);
        watchedState.ui.feedback = 'success';
      })
      .catch(() => {
        watchedState.ui.feedback = 'error';
      });
  });
  renderFeedback(state);
  renderRSSForm(state);
  renderPosts(state);
};

export default render;
