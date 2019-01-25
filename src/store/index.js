import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import notify from './modules/notify';
import scangroup from './modules/scangroup';
import addresses from './modules/addresses';
import user from './modules/user';

import createLogger from '../plugins/logger';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    auth,
    notify,
    scangroup,
    addresses,
    user
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
});
