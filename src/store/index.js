import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import notify from './modules/notify';
import scangroup from './modules/scangroup';
import addresses from './modules/addresses';
import webdata from './modules/webdata';
import user from './modules/user';
import event from './modules/event';
import settings from './modules/settings';

import createLogger from '../plugins/logger';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    auth,
    notify,
    settings,
    scangroup,
    addresses,
    webdata,
    event,
    user
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
});
