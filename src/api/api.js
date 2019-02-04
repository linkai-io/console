import axios from 'axios';
import store from './../store';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const http = axios.create({
  baseURL: process.env.VUE_APP_ROOT_API,
  headers: { 'Content-Type': 'application/json' }
});

http.interceptors.request.use(
  function(config) {
    const token = store.getters['auth/tokenData'];
    if (token === null || token === undefined) {
      window.location = '/login/';
      return null;
    }
    config.headers.Authorization = `Bearer ${token.atk}`;
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  function(response) {
    return response;
  },
  function(error) {
    const originalRequest = error.config;

    if (
      error.response.status === 403 &&
      !originalRequest._retry &&
      error.response.data !== undefined &&
      error.response.data.message === 'token expired'
    ) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch(err => {
            return err;
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const tokens = store.getters['auth/tokenData'];

      return new Promise(function(resolve, reject) {
        axios
          .post('/auth/refresh', {
            access_token: tokens.atk,
            refresh_token: tokens.rtk
          })
          .then(({ authResponse }) => {
            sessionStorage.setItem('atk', authResponse.access_token);
            sessionStorage.setItem('expires', authResponse.expires);
            sessionStorage.setItem('rtk', authResponse.refresh_token);
            axios.defaults.headers.common['Authorization'] =
              'Bearer ' + authResponse.access_token;
            originalRequest.headers['Authorization'] =
              'Bearer ' + authResponse.access_token;
            processQueue(null, authResponse.access_token);
            resolve(axios(originalRequest));
          })
          .catch(err => {
            processQueue(err, null);
            reject(err);
          })
          .then(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default http;
