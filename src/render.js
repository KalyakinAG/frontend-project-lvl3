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
  const htmlFeeds = watchedState.feeds.map((feed) => `<li class = "list-group-item"><h3>${feed.title}</h3><p>${feed.description}</p></li>`);
  feeds.innerHTML = `<h2>Фиды</h2><ul class = "list-group mb-5">${htmlFeeds.join('')}</ul>`;
};

export const renderPosts = (elements, watchedState) => {
  const { posts } = elements;
  posts.innerHTML = '';
  if (watchedState.posts.length === 0) {
    return;
  }

  const htmlList = watchedState.posts.map((post) => {
    const classHref = watchedState.ui.readedPosts.has(post.guid) ? 'font-weight-normal' : 'fw-bold';
    const htmlHref = `<a href = "${post.link}" data-id = "${post.guid}" class = "${classHref}">${post.title}</a>`;
    const htmlButton = `<button class = "btn btn-primary btn-sm" data-bs-toggle = "modal" data-bs-target = "#modal">${i18n.t('viewing')}</button>`;
    return `<li class = "list-group-item d-flex justify-content-between align-items-start">${htmlHref}${htmlButton}</li>`;
  });

  posts.innerHTML = `<h2>Посты</h2><ul class = "list-group">${htmlList.join('')}</ul>`;
  posts.querySelectorAll('.btn').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const a = e.target.parentElement.querySelector('a');
      watchedState.modal.selectedPostId = a.getAttribute('data-id');
      if (!watchedState.ui.readedPosts.has(watchedState.modal.selectedPostId)) {
        watchedState.ui.readedPosts.add(watchedState.modal.selectedPostId);
      }
    });
  });
};

export const getWatchedState = (elements, state) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'feeds':
        renderFeeds(elements, watchedState);
        break;
      case 'posts':
      case 'ui.readedPosts':
        renderPosts(elements, watchedState);
        break;
      case 'form.valid':
      case 'form.error':
        renderForm(elements, watchedState);
        break;
      case 'modal.selectedPostId':
        renderModal(elements, watchedState);
        break;
      case 'network.process':
      case 'network.error':
        renderNetworkProcess(elements, watchedState);
        break;
      default:
        break;
    }
  });
  return watchedState;
};
