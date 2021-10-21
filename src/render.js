import onChange from 'on-change';

const htmlEscape = (str) => {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

export const renderModal = (elements, watchedState) => {
  if (watchedState.modal.selectedPostId === null) {
    return;
  }
  const { modal } = elements;
  //  Оформление модального диалога
  const isSelectedPost = (item) => item.link === watchedState.modal.selectedPostId;
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
      if (watchedState.network.error !== null) {
        feedback.classList.add('text-danger');
        feedback.textContent = watchedState.i18n.t(watchedState.network.error);
      } else {
        feedback.classList.add('text-success');
        feedback.textContent = watchedState.i18n.t('success');
      }
      break;
    default:
  }
};

export const renderForm = (elements, watchedState) => {
  const { input, feedback } = elements;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  if (watchedState.form.error !== null) {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = watchedState.i18n.t(watchedState.form.error);
  }
};

export const renderFeeds = (elements, watchedState) => {
  const { feeds } = elements;
  feeds.innerHTML = '';
  if (watchedState.feeds.length === 0) {
    return;
  }
  const htmlFeeds = watchedState.feeds.map((feed) => `<li class = "list-group-item"><h3>${htmlEscape(feed.title)}</h3><p>${htmlEscape(feed.description)}</p></li>`);
  feeds.innerHTML = `<h2>Фиды</h2><ul class = "list-group mb-5">${htmlFeeds.join('')}</ul>`;
};

export const renderPosts = (elements, watchedState) => {
  const { posts } = elements;
  posts.innerHTML = '';
  if (watchedState.posts.length === 0) {
    return;
  }

  const capture = watchedState.i18n.t('viewing');
  const htmlList = watchedState.posts.map((post) => {
    const classHref = watchedState.ui.readedPosts.has(post.link) ? 'font-weight-normal' : 'fw-bold';
    const htmlHref = `<a href = "${post.link}" data-id = "${post.link}" class = "${classHref}">${htmlEscape(post.title)}</a>`;
    const htmlButton = `<button class = "btn btn-primary btn-sm" data-bs-toggle = "modal" data-bs-target = "#modal">${capture}</button>`;
    return `<li class = "list-group-item d-flex justify-content-between align-items-start">${htmlHref}${htmlButton}</li>`;
  });

  posts.innerHTML = `<h2>Посты</h2><ul class = "list-group">${htmlList.join('')}</ul>`;
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
