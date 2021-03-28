import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';

const renderFeedback = (state) => {
  const feedback = document.querySelector('.feedback');
  feedback.classList.remove('text-success', 'text-danger');
  //  success, invalid_url, invalid_rss, duplicate
  switch (state.ui.feedback) {
    case 'invalid_url':
      feedback.classList.add('text-danger');
      feedback.textContent = 'Ссылка должна быть валидным URL';
      break;
    case 'invalid_rss':
      feedback.classList.add('text-danger');
      feedback.textContent = 'Ресурс не содержит валидный RSS';
      break;
    case 'dublicate':
      feedback.classList.add('text-danger');
      feedback.textContent = 'RSS уже существует';
      break;
    default:
      feedback.classList.add('text-success');
      feedback.textContent = 'RSS успешно загружен';
  }
};

const renderFeeds = (state) => {
  const feeds = document.querySelector('.feeds');
  feeds.innerHTML = '';
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

export default () => {
  const state = {
    feeds: [],
    posts: [],
    ui: {
      feedback: '', // success, invalid_url, invalid_rss, duplicate
    },
  };
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'ui.feedback':
        renderFeedback(state);
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
  const parser = new DOMParser();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    if (!schema.isValidSync(url)) {
      watchedState.ui.feedback = 'invalid_url';
      return;
    }
    axios.get(url, {
      method: 'GET',
    })
      .then((response) => {
        const rss = parser.parseFromString(response.data, 'application/xml');
        const channel = rss.querySelector('channel');
        const feed = {
          title: channel.querySelector('title').textContent,
          description: channel.querySelector('description').textContent,
          link: channel.querySelector('link').textContent,
          guid: channel.querySelector('guid').textContent,
        };
        if (state.feeds.find((item) => item.guid === feed.guid) !== undefined) {
          watchedState.ui.feedback = 'dublicate';
          return;
        }
        const postsElements = Array.from(channel.querySelectorAll('item'));
        const posts = postsElements.map((item) => ({
          title: item.querySelector('title').textContent,
          link: item.querySelector('link').textContent,
          guid: item.querySelector('guid').textContent,
          pubDate: new Date(item.querySelector('pubDate').textContent),
        }));
        watchedState.feeds = [feed].concat(state.feeds);
        watchedState.posts = posts.concat(state.posts);
        watchedState.ui.feedback = 'success';
      })
      .catch(() => {
        watchedState.ui.feedback = 'invalid_rss';
      });
  });
};
