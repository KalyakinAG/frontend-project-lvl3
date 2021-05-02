import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import parse from './parser.js';

const renderFeedback = (state, i18n) => {
  const feedback = document.querySelector('.feedback');
  feedback.classList.remove('text-success', 'text-danger');
  if (state.ui.message === 'success') {
    feedback.classList.add('text-success');
    feedback.textContent = i18n.t('success');
    return;
  }
  if (state.ui.message !== '') {
    feedback.classList.add('text-danger');
    feedback.textContent = i18n.t(state.ui.message);
    return;
  }
  feedback.textContent = '';
};

const renderInputForm = (state) => {
  const form = document.querySelector('.rss-form');
  const input = form.querySelector('input');
  input.classList.remove('is-invalid');
  if (state.ui.message === 'success') {
    return;
  }
  if (state.ui.message !== '') {
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
      case 'ui.message':
        renderFeedback(state, i18n);
        break;
      case 'ui.url':
        renderInputForm(state);
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
  const refresh = () => {
    //  создание массива промисов на чтение данных
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
        setTimeout(refresh, 5000);
      });
  };
  setTimeout(refresh, 5000);

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
    const urlFeed = formData.get('url');
    let isPassURL = true;
    let isPassConnection = true;
    schema.validate(urlFeed)
      .catch((error) => {
        [watchedState.ui.message] = error.errors;
        isPassURL = false;
      })
      .then(() => {
        if (!isPassURL) return null;
        return axios.get('https://hexlet-allorigins.herokuapp.com/get', {
          params: {
            url: urlFeed,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Expires: 0,
            timestamp: new Date().getTime(),
          },
        });
      })
      .catch(() => {
        watchedState.ui.message = 'connection_error';
        isPassConnection = false;
      })
      .then((response) => {
        if (!isPassConnection) return null;
        if (response.data.status.http_code !== 200) {
          watchedState.ui.message = 'invalid_rss';
          return null;
        }
        return response;
      })
      .then((response) => {
        if (response === null) return;
        const [feed, posts] = parse(response.data.contents);
        feed.url = urlFeed;
        if (state.feeds.find((itemFeed) => itemFeed.guid === feed.guid) !== undefined) {
          watchedState.ui.message = 'dublicate';
          return;
        }
        watchedState.feeds = [feed].concat(state.feeds);
        watchedState.posts = posts.concat(state.posts)
          .sort((post1, post2) => post2.pubDate - post1.pubDate)
          .slice(0, 30);
        watchedState.ui.message = 'success';
        form.reset();
      });
  });
  renderFeedback(state, i18n);
  renderInputForm(state);
  renderPosts(state);
};

export default render;
