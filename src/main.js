import Vue from 'vue';
import DashboardPlugin from './plugins/dashboard-plugin';
import App from './App.vue';
import API from './api/api.js';
// router setup
import router from './routes/router';
import i18n from './i18n';
// state setup
import store from './store';

// plugin setup
Vue.use(DashboardPlugin);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store,
  i18n
});
