/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    // if user trying to sign up with an already existing account
    if (res.data.redirect) {
      window.location.href = res.data.redirect;
    }
    if(res.data.status == 'success'){
      showAlert('success','Please verify your email address and log in', 4);
      window.setTimeout(() => {
        location.assign('/login');
      }, 4000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.message);
  }
};
