import onChange from 'on-change';
import * as bootstrap from 'bootstrap';

const escapeHtml = (str) => {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

const renderModal = (elements, watchedState) => {
  if (watchedState.modal.selectedPostId === null) {
    return;
  }
  const { modal } = elements;
  const bsModal = new bootstrap.Modal(modal, {});
  //  Оформление модального диалога
  const selectedPost = watchedState.posts.find(
    (item) => item.guid === watchedState.modal.selectedPostId,
  );
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const buttonFullArticle = modal.querySelector('.btn-primary');
  modalTitle.textContent = selectedPost.title;
  modalBody.innerHTML = escapeHtml(selectedPost.description);
  buttonFullArticle.setAttribute('href', selectedPost.link);
  bsModal.show();
};

const renderNetworkProcess = (elements, watchedState, i18n) => {
  const { input, button, feedback } = elements;
  input.classList.remove('is-invalid');
  switch (watchedState.network.process) {
    case 'progress':
      feedback.classList.remove('text-success', 'text-danger');
      input.setAttribute('readonly', null);
      button.setAttribute('disabled', null);
      break;
    case 'idle':
      input.removeAttribute('readonly');
      button.removeAttribute('disabled');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18n.t('success');
      break;
    case 'error':
      input.removeAttribute('readonly');
      button.removeAttribute('disabled');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18n.t(watchedState.network.error);
      break;
    default:
  }
  input.focus();
};

const renderForm = (elements, watchedState, i18n) => {
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

const renderFeeds = (elements, watchedState, i18n) => {
  const { feeds } = elements;
  feeds.innerHTML = '';
  if (watchedState.feeds.length === 0) {
    return;
  }
  const htmlFeeds = watchedState.feeds.map((feed) => `
  <li class = "list-group-item border-0 border-end-0">
    <h3 class="h6 m-0">${escapeHtml(feed.title)}</h3>
    <p class="m-0 small text-black-50">${escapeHtml(feed.description)}</p>
  </li>`);
  feeds.innerHTML = `
  <div class="card-body">
    <h2>${i18n.t('feeds')}</h2>
  </div>
  <ul class = "list-group border-0 rounded-0">
    ${htmlFeeds.join('')}
  </ul>`;
};

const renderPosts = (elements, watchedState, i18n) => {
  const { posts } = elements;
  posts.innerHTML = '';
  if (watchedState.posts.length === 0) {
    return;
  }
  const capture = i18n.t('viewing');
  const htmlList = watchedState.posts.map((post) => {
    const classHref = watchedState.ui.readedPosts.has(post.guid) ? 'font-weight-normal' : 'fw-bold';
    const htmlHref = `
      <a href = "${post.link}" class = "${classHref}" data-id="2" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(post.title)}
      </a>
    `;
    const htmlButton = `
      <button type="button" class = "btn btn-outline-primary btn-sm" data-id = "${post.guid}">
        ${capture}
      </button>
    `;
    return `
      <li class = "list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
        ${htmlHref}${htmlButton}
      </li>
    `;
  });
  posts.innerHTML = `
    <div class="card-body">
      <h4>${i18n.t('posts')}</h4>
    </div>
    <ul class = "list-group border-0 rounded-0">
      ${htmlList.join('')}
    </ul>
  `;
};

const getWatchedState = (elements, state, i18n) => {
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
        renderForm(elements, watchedState, i18n);
        renderNetworkProcess(elements, watchedState, i18n);
        break;
      default:
        break;
    }
  });
  return watchedState;
};

export default getWatchedState;
