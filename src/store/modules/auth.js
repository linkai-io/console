import router from '../../routes/router';

// initial state
const state = {
  tokenData: {},
  tokenExpired: false,
  isAdmin: false
};

// getters
const getters = {
  tokenData: state => state.tokenData
};

// actions
const actions = {
  INIT({ commit }) {
    commit('SET_INITIALIZED');
  }
};

// mutations
const mutations = {
  SET_INITIALIZED(state) {
    if (sessionStorage.getItem('atk') === undefined) {
      window.location = '/login/';
    }
    state.tokenData.atk = sessionStorage.getItem('atk');
    //sessionStorage.removeItem('atk');
    state.tokenData.expires = sessionStorage.getItem('expires');
    //sessionStorage.removeItem('expires');
    state.tokenData.rtk = sessionStorage.getItem('rtk');
    //sessionStorage.removeItem('rtk');
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
