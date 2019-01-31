import axios from 'axios';
import store from './../store';

const http = axios.create({
  baseURL: process.env.VUE_APP_ROOT_API,
  headers: { 'Content-Type': 'application/json' }
});

http.interceptors.request.use(
  function(config) {
    const token = store.getters['auth/tokenData'];
    config.headers.Authorization = `Bearer ${token.atk}`;
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

export default http;
