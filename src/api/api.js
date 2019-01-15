import axios from 'axios';
import store from './../store';

const http = axios.create({
  baseURL: process.env.VUE_APP_ROOT_API,
  headers: { 'Content-Type': 'application/json' }
});

http.interceptors.request.use(
  function(config) {
    const token = store.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

export default http;
