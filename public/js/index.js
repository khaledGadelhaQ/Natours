/* eslint-disable */
import axios from 'axios';
import { loginUser, logoutUser } from './login';
import { displayMap } from './mapBox';
import { updateData } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

const mapEl = document.getElementById('map');
const loginFormEl = document.querySelector('.form--login');
const logoutEl = document.querySelector('.nav__el--logout');
const updateDataForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');
const userPhotoIcon = document.querySelector('.nav__user-img');
const userPhotoPreview = document.querySelector('.form__user-photo');
const formInput = document.querySelector('.form__upload');
const bookBtn = document.getElementById('book-tour');
const alert = document.querySelector('body').dataset.alert;

if (loginFormEl) {
  loginFormEl.addEventListener('submit', (e) => {
    e.preventDefault(); // preventing the form from closing
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    loginUser(email, password);
  });
}

if (mapEl) {
  const locations = JSON.parse(mapEl.dataset.locations);
  displayMap(locations);
}

if (logoutEl) {
  logoutEl.addEventListener('click', logoutUser);
}

if (updateDataForm) {
  updateDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    const filename = await updateData(form, 'data');
    userPhotoPreview.setAttribute('src', `/img/users/${filename}`);
    userPhotoIcon.setAttribute('src', `/img/users/${filename}`);
  });
}

if (formInput) {
  formInput.addEventListener('change', async (e) => {
    const form = new FormData();
    form.append('photo', document.getElementById('photo').files[0]);

    const res = await axios({
      method: 'patch',
      url: '/api/users/photoValidation',
      data: form,
    });

    if (res.data.status === 'success') {
      userPhotoPreview.setAttribute('src', `/img/users/${res.data.name}`);
    }
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save--password').textContent = 'Updating...';

    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateData(
      { currentPassword, passwordConfirm, password },
      'password',
    );

    document.querySelector('.btn--save--password').textContent =
      'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

if(alert){
  showAlert('success', alert, 10);
}