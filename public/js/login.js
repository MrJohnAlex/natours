import { showAlert } from './alerts.js';
// export const login = async (email, password) => {
//   try {
//     const res = await axios({
//       method: 'POST',
//       url: 'http://localhost:3000/api/v1/users/login',
//       data: {
//         email,
//         password,
//       },
//     });
//     if (res.data.status === 'success') {
//       showAlert('success', 'Login successfully');
//       window.setTimeout(() => {
//         location.assign('/');
//       }, 1500);
//     }
//   } catch (error) {
//     showAlert('error', error.response.data.message);
//   }
// };
import axios from 'axios';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data && res.data.status === 'success') {
      showAlert('success', 'Login successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    // Check if the error has a response object
    if (error.response && error.response.data && error.response.data.message) {
      showAlert('error', error.response.data.message);
    } else if (error.message) {
      // Handle network errors or unexpected errors
      showAlert('error', error.message);
    } else {
      showAlert('error', 'An unknown error occurred');
    }
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logout successfully');
      location.reload(true);
    }
  } catch (error) {
    showAlert('error', 'Error logging out! Try agian');
  }
};
