import onChange from 'on-change';
import * as bootstrap from 'bootstrap';

const htmlEscape = (str) => {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

export const renderModal = (elements, watchedState) => {
  const { modal } = elements;
  const bsModal = new bootstrap.Modal(modal, {});
  if (watchedState.modal.selectedPostId === null) {
    bsModal.hide();
    return;
  }
  //  Оформление модального диалога
  const isSelectedPost = (item) => item.link === watchedState.modal.selectedPostId;
  const selectedPost = watchedState.posts.find(isSelectedPost);
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const buttonFullArticle = modal.querySelector('.btn-primary');
  modalTitle.textContent = selectedPost.title;
  modalBody.innerHTML = selectedPost.description;
  buttonFullArticle.setAttribute('href', selectedPost.link);
  bsModal.show();
};

export const renderNetworkProcess = (elements, watchedState, i18n) => {
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
      if (watchedState.network.error !== null) {
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

export const renderForm = (elements, watchedState, i18n) => {
  const { input, feedback } = elements;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  if (watchedState.form.error !== null) {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = i18n.t(watchedState.form.error);
  }
};

export const renderFeeds = (elements, watchedState, i18n) => {
  const { feeds } = elements;
  feeds.innerHTML = '';
  if (watchedState.feeds.length === 0) {
    return;
  }
  const htmlFeeds = watchedState.feeds.map((feed) => `<li class = "list-group-item"><h3>${htmlEscape(feed.title)}</h3><p>${htmlEscape(feed.description)}</p></li>`);
  feeds.innerHTML = `<h2>${i18n.t('feeds')}</h2><ul class = "list-group mb-5">${htmlFeeds.join('')}</ul>`;
};

export const renderPosts = (elements, watchedState, i18n) => {
  const { posts } = elements;
  posts.innerHTML = '';
  if (watchedState.posts.length === 0) {
    return;
  }
  const capture = i18n.t('viewing');
  const htmlList = watchedState.posts.map((post) => {
    const classHref = watchedState.ui.readedPosts.has(post.link) ? 'font-weight-normal' : 'fw-bold';
    const htmlHref = `<a href = "${post.link}" data-id = "${post.link}" class = "${classHref}">${htmlEscape(post.title)}</a>`;
    const htmlButton = `<button class = "btn btn-primary btn-sm">${capture}</button>`;
    return `<li class = "list-group-item d-flex justify-content-between align-items-start">${htmlHref}${htmlButton}</li>`;
  });
  posts.innerHTML = `<h2>${i18n.t('posts')}</h2><ul class = "list-group">${htmlList.join('')}</ul>`;
};

export const getWatchedState = (elements, state, i18n) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'feeds':
        renderFeeds(elements, watchedState, i18n);
        break;
      case 'posts':
      case 'ui.readedPosts':
        renderPosts(elements, watchedState, i18n);
        break;
      case 'form.valid':
      case 'form.error':
        renderForm(elements, watchedState, i18n);
        break;
      case 'modal.selectedPostId':
        renderModal(elements, watchedState);
        break;
      case 'network.process':
      case 'network.error':
        renderNetworkProcess(elements, watchedState, i18n);
        break;
      default:
        break;
    }
  });
  return watchedState;
};
