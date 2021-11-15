import onChange from 'on-change';
import * as bootstrap from 'bootstrap';

const escapeHtml = (str) => {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

export const renderModal = (elements, watchedState) => {
  if (watchedState.modal.selectedPostId === null) {
    return;
  }
  const { modal } = elements;
  const bsModal = new bootstrap.Modal(modal, {});
  //  Оформление модального диалога
  const isSelectedPost = (item) => item.title === watchedState.modal.selectedPostId;
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
  input.classList.remove('is-invalid');
  switch (watchedState.network.process) {
    case 'progress':
      feedback.classList.remove('text-success', 'text-danger');
      input.removeAttribute('readonly');
      button.removeAttribute('disabled');
      break;
    case 'idle':
      input.removeAttribute('readonly');
      button.removeAttribute('disabled');
      if (watchedState.network.error !== null) {
        feedback.classList.remove('text-success');
        feedback.classList.add('text-danger');
        feedback.textContent = i18n.t(watchedState.network.error);
      } else {
        feedback.classList.remove('text-success');
        feedback.classList.add('text-success');
        feedback.textContent = i18n.t('success');
      }
      break;
    default:
  }
};

export const renderForm = (elements, watchedState, i18n) => {
  const { form, input, feedback } = elements;
  if (watchedState.form.error !== null) {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = i18n.t(watchedState.form.error);
  } else {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    form.reset();
  }
  input.focus();
};

export const renderFeeds = (elements, watchedState, i18n) => {
  const { feeds } = elements;
  feeds.innerHTML = '';
  if (watchedState.feeds.length === 0) {
    return;
  }
  const htmlFeeds = watchedState.feeds.map((feed) => `<li class = "list-group-item"><h3>${escapeHtml(feed.title)}</h3><p>${escapeHtml(feed.description)}</p></li>`);
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
    const classHref = watchedState.ui.readedPosts.has(post.title) ? 'font-weight-normal' : 'fw-bold';
    const htmlHref = `<a href = "${post.link}" class = "${classHref}">${escapeHtml(post.title)}</a>`;
    const htmlButton = `<button class = "btn btn-primary btn-sm" data-id = "${post.title}">${capture}</button>`;
    return `<li class = "list-group-item d-flex justify-content-between align-items-start">${htmlHref}${htmlButton}</li>`;
  });
  posts.innerHTML = `<h2>${i18n.t('posts')}</h2><ul class = "list-group">${htmlList.join('')}</ul>`;
};

export const getWatchedState = (elements, state, i18n) => {
  const watchedState = onChange(state, (path) => {
    console.log(path);
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
