// import axio from 'axios';
import { showAlert } from './alerts';
// type is ether 'password' or 'data'
exports.updateUserInfo = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updatePassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateInfo';
    const res = await axios({
      method: 'PATCH',
      url: url,
      data,
    });
    if (res.status === 'success') {
      showAlert('success', res.data.message);
    }
  } catch (err) {
    showAlert('error', err);
  }
};
