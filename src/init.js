import 'bootstrap/dist/css/bootstrap.min.css';

export default () => {
  const element = document.createElement('div');
  element.innerHTML = 'Привет, Мир';
  element.classList.add('alert', 'alert-primary');
  element.setAttribute('role', 'alert');
  console.log('Start!');
  document.body.appendChild(element);
};
