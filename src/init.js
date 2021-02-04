import 'bootstrap/dist/css/bootstrap.min.css';

export default () => {
  const element = document.createElement('div');
  element.innerHTML = 'С Новым Годом!';
  element.classList.add('alert', 'alert-primary');
  element.setAttribute('role', 'alert');
  console.log('Start!');
  document.body.appendChild(element);
};
