import onChange from 'on-change';
import i18n from 'i18next';

export const renderModal = (elements, watchedState) => {
  const { modal } = elements;
  if (watchedState.ui.selectedPostId === '') {
    //  Выключения эффекта затемнения основного окна
    document.body.classList.remove('modal-open');
    const fadeModal = document.body.querySelector('.modal-backdrop');
    if (fadeModal !== null) {
      document.body.removeChild(fadeModal);
    }
    //  Скрытие модального диалога
    modal.removeAttribute('aria-modal');
    modal.setAttribute('style', 'display: none;');
    modal.setAttribute('aria-hidden', true);
    modal.classList.remove('show');
    return;
  }
  //  Снятие выделения с ссылки поста
  const posts = document.querySelector('.posts');
  const href = posts.querySelector(`[data-id='${watchedState.ui.selectedPostId}']`);
  href.classList.remove('fw-bold');
  href.classList.add('font-weight-normal');
  //  Настройка эффекта затемнения основного окна
  const modalFade = document.createElement('div');
  modalFade.classList.add('modal-backdrop', 'fade', 'show');
  document.body.appendChild(modalFade);
  document.body.classList.add('modal-open');
  //  Оформление модального диалога
  const isSelectedPost = (item) => item.guid === watchedState.ui.selectedPostId;
  const selectedPost = watchedState.posts.find(isSelectedPost);
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const buttonFullArticle = modal.querySelector('.btn-primary');
  modalTitle.textContent = selectedPost.title;
  modalBody.innerHTML = selectedPost.description;
  buttonFullArticle.setAttribute('href', selectedPost.link);
  modal.removeAttribute('aria-hidden');
  modal.setAttribute('style', 'display: block;');
  modal.setAttribute('aria-modal', true);
  modal.classList.add('show');
  modal.focus();
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
  const { input, button } = elements;
  input.classList.remove('is-invalid');
  input.removeAttribute('readonly');
  button.removeAttribute('disabled');
  if (watchedState.ui.readonly) {
    input.setAttribute('readonly', null);
    button.setAttribute('disabled', null);
  }
  if (watchedState.ui.message === 'success') {
    return;
  }
  if (watchedState.ui.message !== '') {
    input.classList.add('is-invalid');
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
    button.textContent = i18n.t('viewing');
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const a = e.target.parentElement.querySelector('a');
      watchedState.ui.selectedPostId = a.getAttribute('data-id');
      if (!watchedState.ui.readedPosts.includes(watchedState.ui.selectedPostId)) {
        watchedState.ui.readedPosts.push(watchedState.ui.selectedPostId);
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
  renderFeedback(elements, watchedState);
  renderInputForm(elements, watchedState);
  renderPosts(elements, watchedState);
  renderModal(elements, watchedState);
};

export const getWatchedState = (elements, state) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'ui.readonly':
        renderInputForm(elements, watchedState);
        break;
      case 'ui.selectedPostId':
        renderModal(elements, watchedState);
        break;
      case 'ui.message':
        renderFeedback(elements, watchedState);
        break;
      case 'ui.url':
        renderInputForm(elements, watchedState);
        break;
      case 'feeds':
        renderFeeds(elements, watchedState);
        break;
      case 'ui.readedPosts':
        renderPosts(elements, watchedState);
        break;
      case 'posts':
        renderPosts(elements, watchedState);
        break;
      case 'ui.lng':
        render(elements, watchedState);
        break;
      default:
        break;
    }
  });
  return watchedState;
};
