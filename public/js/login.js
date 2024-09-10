/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const loginUser = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged In Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 800);
    }
  } catch (err) {
    showAlert('error', 'Wrong Email or Password!');
  }
};

export const logoutUser = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/users/logout',
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged Out Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 800);
    }
  } catch (err) {
    showAlert('error', 'Error Logging Out!');
  }
};
