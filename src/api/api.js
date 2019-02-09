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
    let token = store.getters['auth/tokenData'];
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
      return refreshToken(originalRequest);
    }
    return Promise.reject(error);
  }
);

function refreshToken(originalRequest) {
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
      .then(authResponse => {
        sessionStorage.setItem('atk', authResponse.data.access_token);
        sessionStorage.setItem('expires', authResponse.data.expires);
        sessionStorage.setItem('rtk', authResponse.data.refresh_token);
        store.dispatch('auth/INIT');
        axios.defaults.headers.common['Authorization'] =
          'Bearer ' + authResponse.data.access_token;
        originalRequest.headers['Authorization'] =
          'Bearer ' + authResponse.data.access_token;
        processQueue(null, authResponse.data.access_token);
        resolve(axios(originalRequest));
      })
      .catch(err => {
        console.log('error occurred during token refresh attempt');
        console.log(err);
        window.location = '/login/';
        //processQueue(err, null);
        //reject(err);
      })
      .then(() => {
        isRefreshing = false;
      });
  });
}

export default http;
