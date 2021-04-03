import 'bootstrap/dist/css/bootstrap.min.css';
import render from './render.js';

export default () => {
  const state = {
    feeds: [],
    posts: [],
    ui: {
      feedback: '', // success, invalid, error, duplicate
    },
  };
  render(state);
};
