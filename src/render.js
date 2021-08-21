import onChange from 'on-change';
import i18n from 'i18next';

export const renderModal = (elements, watchedState) => {
  if (watchedState.modal.selectedPostId === '') {
    return;
  }
  const { modal } = elements;
  //  Оформление модального диалога
  const isSelectedPost = (item) => item.guid === watchedState.modal.selectedPostId;
  const selectedPost = watchedState.posts.find(isSelectedPost);
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const buttonFullArticle = modal.querySelector('.btn-primary');
  modalTitle.textContent = selectedPost.title;
  modalBody.innerHTML = selectedPost.description;
  buttonFullArticle.setAttribute('href', selectedPost.link);
};

export const renderNetworkProcess = (elements, watchedState) => {
  const { input, button, feedback } = elements;
  feedback.classList.remove('text-success', 'text-danger');
  input.classList.remove('is-invalid');
  input.removeAttribute('readonly');
  button.removeAttribute('disabled');
  switch (watchedState.network.process) {
    case 'progress':
      input.setAttribute('readonly', null);
      button.setAttribute('disabled', null);
      break;
    case 'idle':
      if (watchedState.network.error !== '') {
        feedback.classList.add('text-danger');
        feedback.textContent = i18n.t(watchedState.network.error);
      } else {
        feedback.classList.add('text-success');
        feedback.textContent = i18n.t('success');
      }
      break;
    default:
  }
};

export const renderForm = (elements, watchedState) => {
  const { input, feedback } = elements;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  if (watchedState.form.error !== '') {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = i18n.t(watchedState.form.error);
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
  const list = document.createElement('ul');
  head.textContent = 'Посты';
  list.classList.add('list-group');
  watchedState.posts.forEach((item) => {
    const listItem = document.createElement('li');
    const href = document.createElement('a');
    const button = document.createElement('button');
    href.setAttribute('href', item.link);
    href.setAttribute('data-id', item.guid);
    if (watchedState.ui.readedPosts.includes(item.guid)) {
      href.classList.add('font-weight-normal');
    } else {
      href.classList.add('fw-bold');
    }
    href.textContent = item.title;
    button.classList.add('btn', 'btn-primary', 'btn-sm');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18n.t('viewing');
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const a = e.target.parentElement.querySelector('a');
      watchedState.modal.selectedPostId = a.getAttribute('data-id');
      if (!watchedState.ui.readedPosts.includes(watchedState.modal.selectedPostId)) {
        watchedState.ui.readedPosts.push(watchedState.modal.selectedPostId);
      }
    });
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    listItem.appendChild(href);
    listItem.appendChild(button);
    list.appendChild(listItem);
  });
  posts.appendChild(head);
  posts.appendChild(list);
};
/* eslint no-param-reassign: ["error", { "props": false }] */
export const render = (elements, watchedState) => {
  renderNetworkProcess(elements, watchedState);
  renderForm(elements, watchedState);
  renderPosts(elements, watchedState);
  renderModal(elements, watchedState);
};

export const getWatchedState = (elements, state) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'feeds':
        renderFeeds(elements, watchedState);
        break;
      case 'posts':
        renderPosts(elements, watchedState);
        break;
      case 'form.valid':
        renderForm(elements, watchedState);
        break;
      case 'form.error':
        renderForm(elements, watchedState);
        break;
      case 'modal.selectedPostId':
        renderModal(elements, watchedState);
        break;
      case 'network.process':
        renderNetworkProcess(elements, watchedState);
        break;
      case 'network.error':
        renderNetworkProcess(elements, watchedState);
        break;
      case 'ui.readedPosts':
        renderPosts(elements, watchedState);
        break;
      default:
        break;
    }
  });
  return watchedState;
};
