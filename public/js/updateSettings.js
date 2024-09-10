import { showAlert } from './alerts';
import axios from 'axios';

export const updateData = async (data, type) => {
  try {
    // type is either 'data' or 'password'
    const url =
      type === 'password'
        ? 'http://127.0.0.1:5000/api/users/updatePassword'
        : 'http://127.0.0.1:5000/api/users/updateMyData';
        
    const res = await axios({
      method: 'patch',
      url,
      data,
    });
    
    if (res.data.status === 'success') {
      showAlert('success', 'Date Saved Successfully!');
      return res.data.data.user.photo;;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
