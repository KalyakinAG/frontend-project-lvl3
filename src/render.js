import axios from 'axios';
import * as yup from 'yup';
import i18n from 'i18next';
import parse from './parser.js';

export const renderModal = (elements, watchedState) => {
  const { modal } = elements;
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const buttonFullArticle = modal.querySelector('.btn-primary');
  const buttonClose = modal.querySelector('.close');
  const buttonCloseSecondary = modal.querySelector('.btn-secondary');
  modal.classList.remove('show');
  if (watchedState.ui.selectedPostId === '') {
    modal.setAttribute('style', 'display: none;');
    return;
  }
  const isSelectedPost = (item) => item.guid === watchedState.ui.selectedPostId;
  const selectedPost = watchedState.posts.find(isSelectedPost);
  modalTitle.textContent = selectedPost.title;
  modalBody.innerHTML = selectedPost.description;
  buttonFullArticle.setAttribute('href', selectedPost.link);
  modal.classList.add('show');
  modal.setAttribute('style', 'display: block;');
  const posts = document.querySelector('.posts');
  const href = posts.querySelector(`[data-id='${watchedState.ui.selectedPostId}']`);
  href.classList.remove('font-weight-bold');
  href.classList.add('font-weight-normal');
  buttonClose.addEventListener('click', (e) => {
    e.preventDefault();
    watchedState.ui.selectedPostId = '';
  });
  buttonCloseSecondary.addEventListener('click', (e) => {
    e.preventDefault();
    watchedState.ui.selectedPostId = '';
  });
};

export const renderFeedback = (elements, watchedState) => {
  const { feedback } = elements;
  feedback.classList.remove('text-success', 'text-danger');
  if (watchedState.ui.message === 'success') {
    feedback.classList.add('text-success');
    feedback.textContent = i18n.t('success');
    return;
  }
  if (watchedState.ui.message !== '') {
    feedback.classList.add('text-danger');
    feedback.textContent = i18n.t(watchedState.ui.message);
    return;
  }
  feedback.textContent = '';
};

export const renderInputForm = (elements, watchedState) => {
  const { input } = elements;
  input.classList.remove('is-invalid');
  if (watchedState.ui.message === 'success') {
    return;
  }
  if (watchedState.ui.message !== '') {
    input.classList.add('is-invalid');
    input.focus();
  }
};

export const renderFeeds = (elements, watchedState) => {
  const { feeds } = elements;
  feeds.innerHTML = '';
  if (watchedState.feeds.length === 0) {
    return;
  }
  const head = document.createElement('h2');
  head.textContent = 'Фиды';
  const list = document.createElement('ul');
  list.classList.add('list-group', 'mb-5');
  feeds.appendChild(head);
  feeds.appendChild(list);
  watchedState.feeds.forEach((item) => {
    const listItem = document.createElement('li');
    list.appendChild(listItem);
    listItem.innerHTML = `<h3>${item.title}</h3><p>${item.description}</p>`;
    listItem.classList.add('list-group-item');
  });
};

export const renderPosts = (elements, watchedState) => {
  const { posts } = elements;
  posts.innerHTML = '';
  if (watchedState.posts.length === 0) {
    return;
  }
  const head = document.createElement('h2');
  head.textContent = 'Посты';
  const list = document.createElement('ul');
  list.classList.add('list-group');
  posts.appendChild(head);
  posts.appendChild(list);
  watchedState.posts.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const href = document.createElement('a');
    href.setAttribute('href', item.link);
    href.setAttribute('data-id', item.guid);
    if (watchedState.ui.readedPosts.includes(item.guid)) {
      href.classList.add('font-weight-normal');
    } else {
      href.classList.add('font-weight-bold');
    }
    href.textContent = item.title;
    listItem.appendChild(href);
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'btn-sm');
    button.textContent = 'Просмотр';
    listItem.appendChild(button);
    list.appendChild(listItem);
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const a = e.target.parentElement.querySelector('a');
      watchedState.ui.selectedPostId = a.getAttribute('data-id');
      if (!watchedState.ui.readedPosts.includes(watchedState.ui.selectedPostId)) {
        watchedState.ui.readedPosts.push(watchedState.ui.selectedPostId);
      }
    });
  });
};
/* eslint no-param-reassign: ["error", { "props": false }] */
export const render = (elements, watchedState) => {
  i18n.changeLanguage(watchedState.ui.lng);
  const schema = yup.string().url();
  const { form } = elements;
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
        if (watchedState.feeds.find((itemFeed) => itemFeed.guid === feed.guid) !== undefined) {
          watchedState.ui.message = 'dublicate';
          return;
        }
        watchedState.feeds = [feed].concat(watchedState.feeds);
        watchedState.posts = posts.concat(watchedState.posts)
          .sort((post1, post2) => post2.pubDate - post1.pubDate)
          .slice(0, 30);
        watchedState.ui.message = 'success';
        form.reset();
      });
  });
  renderFeedback(elements, watchedState);
  renderInputForm(elements, watchedState);
  renderPosts(elements, watchedState);
  renderModal(elements, watchedState);
};